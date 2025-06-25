import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
} from "react";
import tgpu, {
  StorageFlag,
  TgpuBuffer,
  UniformFlag,
  TgpuRoot,
  TgpuTexture,
  TgpuBindGroup,
  TgpuBindGroupLayout,
} from "typegpu";
import * as d from "typegpu/data";

const KERNEL_SIZE = 15;
const KERNEL_PIXELS = KERNEL_SIZE * KERNEL_SIZE;

export type Color = { r: number; g: number; b: number; a: number };
export type Kernel = Color[];

interface GpuResources {
  root: TgpuRoot;
  context: GPUCanvasContext;
  presentationFormat: GPUTextureFormat;
  renderRareLayout: TgpuBindGroupLayout;
  renderFrequentLayout: TgpuBindGroupLayout;
  computeLayout: TgpuBindGroupLayout;
  storageBuffer: TgpuBuffer<d.WgslArray<d.Vec4f>> & StorageFlag;
  readbackBuffers: TgpuBuffer<d.WgslArray<d.Vec4f>>[];
  readbackBufferIndex: number;
  mousePosBuffer: TgpuBuffer<d.Vec2f> & UniformFlag;
  kernelSizeBuffer: TgpuBuffer<d.I32> & UniformFlag;
  videoRenderOffscreenTextuePipeline: GPURenderPipeline;
  videoCanvasRenderPipeline: GPURenderPipeline;
  computePipeline: GPUComputePipeline;
  videoRenderTexture: TgpuTexture | null;
  kernelComputeBindGroup: TgpuBindGroup | null;
}

export interface WebGPUCanvasHandle {
  readKernelAt: (x: number, y: number) => Promise<Kernel>;
  updateVideoTexture: (width: number, height: number) => void;
  startRenderLoop: () => void;
  stopRenderLoop: () => void;
}

interface WebGPUCanvasProps {
  videoElement: HTMLVideoElement | null;
  maskVideoElement: HTMLVideoElement | null;
  isVideoLoaded: boolean;
  isMaskVideoLoaded: boolean;
  onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  className?: string;
}

export const WebGPUCanvas = forwardRef<WebGPUCanvasHandle, WebGPUCanvasProps>(
  (
    {
      videoElement,
      maskVideoElement,
      isVideoLoaded,
      isMaskVideoLoaded,
      onPointerMove,
      className,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gpuResources = useRef<Partial<GpuResources>>({});
    const animationFrameId = useRef(0);

    const initWebGPU = useCallback(async () => {
      console.log("[WebGPU Init] Starting WebGPU initialization");
      
      if (!canvasRef.current) {
        console.error("[WebGPU Init] Canvas ref not available");
        return;
      }

      const context = canvasRef.current.getContext("webgpu");
      if (!context) {
        console.error("[WebGPU Init] WebGPU not supported - context creation failed");
        console.error("[WebGPU Init] Browser support check:", {
          hasNavigatorGpu: !!navigator.gpu,
          hasWebGpuSupport: !!navigator.gpu?.requestAdapter
        });
        throw new Error("WebGPU not supported");
      }

      try {
        console.log("[WebGPU Init] Initializing TypeGPU root");
        const root = await tgpu.init();
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        console.log("[WebGPU Init] Presentation format:", presentationFormat);

        context.configure({
          device: root.device,
          format: presentationFormat,
          alphaMode: "premultiplied",
        });

        // --- TypeGPU Schema Definitions ---
        const renderRareLayout = tgpu.bindGroupLayout({
          videoSampler: { sampler: "filtering" },
        });
        const renderFrequentLayout = tgpu.bindGroupLayout({
          videoTexture: { externalTexture: {} },
          maskVideoTexture: { externalTexture: {} },
        });
        const VertexOutput = d.struct({
          position: d.builtin.position,
          uv: d.location(0, d.vec2f),
        });

        const renderShaderCode = tgpu.resolve({
          template: /* wgsl */ `
            @vertex
            fn main_vert(@builtin(vertex_index) idx: u32) -> VertexOutput {
              const pos = array(vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0), vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0));
              const uv = array(vec2(0.0, 1.0), vec2(1.0, 1.0), vec2(0.0, 0.0), vec2(0.0, 0.0), vec2(1.0, 1.0), vec2(1.0, 0.0));
              var output: VertexOutput;
              output.position = vec4(pos[idx], 0.0, 1.0);
              output.uv = uv[idx];
              return output;
            }
            @fragment
            fn main_video_frag(@location(0) uv: vec2f) -> @location(0) vec4f {
              let video_color = textureSampleBaseClampToEdge(videoTexture, videoSampler, uv);
              let mask_color = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv);
              return vec4(video_color.rgb, mask_color.r);
            }
            @fragment
            fn main_colour_picker_frag(@location(0) uv: vec2f) -> @location(0) vec4f {
              let mask_color = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv);
              return vec4(mask_color.rgb, mask_color.r);
            }
           
          `,
          externals: {
            ...renderRareLayout.bound,
            ...renderFrequentLayout.bound,
            VertexOutput,
          },
        });

        const computeLayout = tgpu.bindGroupLayout({
          inputTexture: { texture: "unfilterable-float" },
          outputBuffer: {
            storage: d.arrayOf(d.vec4f, KERNEL_PIXELS),
            access: "mutable",
          },
          mousePosition: { uniform: d.vec2f },
          kernelSize: { uniform: d.i32 },
        });

        const computeShaderCode = tgpu.resolve({
          template: /* wgsl */ `
            @compute @workgroup_size(1, 1, 1)
            fn main(@builtin(global_invocation_id) id: vec3<u32>) {
              let x = i32(id.x);
              let y = i32(id.y);
              if (x >= kernelSize || y >= kernelSize) { return; }
              let kernelIndex = y * kernelSize + x;
              let halfSize = kernelSize / 2;
              let offsetX = x - halfSize;
              let offsetY = y - halfSize;
              let textureDimensions = vec2f(textureDimensions(inputTexture));
              let centerPixel = mousePosition * textureDimensions;
              let pixelPos = vec2i(centerPixel) + vec2i(offsetX, offsetY);
              let clampedPos = vec2i(clamp(pixelPos.x, 0, i32(textureDimensions.x) - 1), clamp(pixelPos.y, 0, i32(textureDimensions.y) - 1));
              outputBuffer[kernelIndex] = textureLoad(inputTexture, clampedPos, 0);
            }
          `,
          externals: { ...computeLayout.bound },
        });

        // --- Resource Creation ---
        const renderShader = root.device.createShaderModule({
          label: "Render Shader",
          code: renderShaderCode,
        });
        const computeShader = root.device.createShaderModule({
          label: "Compute Shader",
          code: computeShaderCode,
        });

        const storageBuffer = root
          .createBuffer(d.arrayOf(d.vec4f, KERNEL_PIXELS))
          .$name("Kernel Storage Buffer")
          .$usage("storage")
          .$addFlags(GPUBufferUsage.COPY_SRC);

        const readbackBuffers = [
          root
            .createBuffer(d.arrayOf(d.vec4f, KERNEL_PIXELS))
            .$name("Kernel Readback Buffer 0")
            .$addFlags(GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ),
          root
            .createBuffer(d.arrayOf(d.vec4f, KERNEL_PIXELS))
            .$name("Kernel Readback Buffer 1")
            .$addFlags(GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ),
        ];

        const mousePosBuffer = root
          .createBuffer(d.vec2f)
          .$name("Mouse Position Buffer")
          .$usage("uniform");
        const kernelSizeBuffer = root
          .createBuffer(d.i32, KERNEL_SIZE)
          .$name("Kernel Size Buffer")
          .$usage("uniform");

        const renderPipelineLayout = root.device.createPipelineLayout({
          bindGroupLayouts: [
            root.unwrap(renderRareLayout),
            root.unwrap(renderFrequentLayout),
          ],
        });

        // videoRenderOffscreenTextuePipeline → Renders to an Off-screen Texture
        // This pipeline's job is to render the composited video into an in-memory texture (videoRenderTexture). This texture isn't displayed on the screen.
        // Instead, it serves as the data source for the color picker's compute shader. This pipeline is specifically configured to output to a texture with the rgba8unorm format.

        const videoRenderOffscreenTextuePipeline =
          root.device.createRenderPipeline({
            label: "Video to Texture Pipeline",
            layout: renderPipelineLayout,
            vertex: { module: renderShader, entryPoint: "main_vert" },
            fragment: {
              module: renderShader,
              entryPoint: "main_colour_picker_frag",
              targets: [{ format: "rgba8unorm" }],
            },
            primitive: { topology: "triangle-list" },
          });

        // videoCanvasRenderPipeline → Renders to the Screen
        // This second pipeline takes the same video sources and renders the result to the actual <canvas> element that you see on the page.
        // A pipeline that renders to the screen must be configured with the canvas's specific presentationFormat, which is determined by the browser and your operating system.

        const videoCanvasRenderPipeline = root.device.createRenderPipeline({
          label: "Video to Canvas Pipeline",
          layout: renderPipelineLayout,
          vertex: { module: renderShader, entryPoint: "main_vert" },
          fragment: {
            module: renderShader,
            entryPoint: "main_video_frag",
            targets: [{ format: presentationFormat }],
          },
          primitive: { topology: "triangle-list" },
        });

        const computePipeline = root.device.createComputePipeline({
          label: "Kernel Reader Compute Pipeline",
          layout: root.device.createPipelineLayout({
            label: "Kernel Reader Pipeline Layout",
            bindGroupLayouts: [root.unwrap(computeLayout)],
          }),
          compute: { module: computeShader, entryPoint: "main" },
        });

        // Create initial video render texture with default dimensions
        console.log("[WebGPU Init] Creating initial video render texture");
        const initialTexture = root["~unstable"]
          .createTexture({ size: [512, 512], format: "rgba8unorm" })
          .$name("Initial Video Render Target")
          .$usage("render", "sampled");
        
        const initialKernelComputeBindGroup = root.createBindGroup(computeLayout, {
          inputTexture: root.unwrap(initialTexture).createView(),
          outputBuffer: storageBuffer,
          mousePosition: mousePosBuffer,
          kernelSize: kernelSizeBuffer,
        });

        console.log("[WebGPU Init] All resources created successfully");
        console.log("[WebGPU Init] GPU Resources summary:", {
          hasRoot: !!root,
          hasContext: !!context,
          presentationFormat,
          kernelSize: KERNEL_SIZE,
          kernelPixels: KERNEL_PIXELS,
          initialTextureSize: [512, 512]
        });

        gpuResources.current = {
          root,
          context,
          presentationFormat,
          renderRareLayout,
          renderFrequentLayout,
          computeLayout,
          storageBuffer,
          readbackBuffers,
          readbackBufferIndex: 0,
          mousePosBuffer,
          kernelSizeBuffer,
          videoRenderOffscreenTextuePipeline,
          videoCanvasRenderPipeline,
          computePipeline,
          videoRenderTexture: initialTexture,
          kernelComputeBindGroup: initialKernelComputeBindGroup,
        };
      } catch (error) {
        console.error("[WebGPU Init] Initialization failed:", error);
        throw error;
      }
    }, []);

    const render = useCallback(() => {
      const {
        root,
        context,
        videoRenderOffscreenTextuePipeline,
        videoCanvasRenderPipeline,
        videoRenderTexture,
        renderFrequentLayout,
        renderRareLayout,
      } = gpuResources.current;

      // Better logging for missing resources
      const missingResources = [];
      if (!root) missingResources.push("root (TgpuRoot)");
      if (!context) missingResources.push("context (GPUCanvasContext)");
      if (!videoElement) missingResources.push("videoElement (HTMLVideoElement)");
      if (!maskVideoElement) missingResources.push("maskVideoElement (HTMLVideoElement)");
      if (!renderFrequentLayout) missingResources.push("renderFrequentLayout");
      if (!renderRareLayout) missingResources.push("renderRareLayout");
      if (!videoRenderOffscreenTextuePipeline) missingResources.push("videoRenderOffscreenTextuePipeline");
      if (!videoCanvasRenderPipeline) missingResources.push("videoCanvasRenderPipeline");
      if (!videoRenderTexture) missingResources.push("videoRenderTexture");

      if (missingResources.length > 0) {
        console.error("[WebGPU Render] Missing resources:", missingResources.join(", "));
        console.error("[WebGPU Render] Video loaded states:", { 
          isVideoLoaded, 
          isMaskVideoLoaded,
          videoElementReady: !!videoElement,
          maskVideoElementReady: !!maskVideoElement
        });
        return;
      }

      try {
        const commandEncoder = root.device.createCommandEncoder();

        const renderPass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: root.unwrap(videoRenderTexture).createView(),
              clearValue: [0, 0, 0, 1],
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        renderPass.setPipeline(videoRenderOffscreenTextuePipeline);

        const frequentBindGroup = root.createBindGroup(renderFrequentLayout, {
          videoTexture: root.device.importExternalTexture({
            source: videoElement,
          }),
          maskVideoTexture: root.device.importExternalTexture({
            source: maskVideoElement,
          }),
        });

        const videoSampler = root.device.createSampler({
          label: "Video Sampler",
          magFilter: "linear",
          minFilter: "linear",
        });
        const rareBindGroup = root.createBindGroup(renderRareLayout, {
          videoSampler,
        });

        renderPass.setBindGroup(0, root.unwrap(rareBindGroup));
        renderPass.setBindGroup(1, root.unwrap(frequentBindGroup));

        renderPass.draw(6);
        renderPass.end();

        const canvasRenderPass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              clearValue: [0, 0, 0, 1],
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        canvasRenderPass.setPipeline(videoCanvasRenderPipeline);

        canvasRenderPass.setBindGroup(0, root.unwrap(rareBindGroup));
        canvasRenderPass.setBindGroup(1, root.unwrap(frequentBindGroup));

        canvasRenderPass.draw(6);
        canvasRenderPass.end();

        root.device.queue.submit([commandEncoder.finish()]);
      } catch (error) {
        console.error("[WebGPU Render] Render failed:", error);
      }
    }, [videoElement, maskVideoElement, isVideoLoaded, isMaskVideoLoaded]);

    const readKernelAt = useCallback(
      async (x: number, y: number): Promise<Kernel> => {
        const {
          root,
          mousePosBuffer,
          videoRenderTexture,
          kernelComputeBindGroup,
          computePipeline,
          storageBuffer,
          readbackBuffers,
        } = gpuResources.current;

        // Better logging for missing resources
        const missingResources = [];
        if (!root) missingResources.push("root (TgpuRoot)");
        if (!mousePosBuffer) missingResources.push("mousePosBuffer");
        if (!videoRenderTexture) missingResources.push("videoRenderTexture");
        if (!kernelComputeBindGroup) missingResources.push("kernelComputeBindGroup");
        if (!computePipeline) missingResources.push("computePipeline");
        if (!storageBuffer) missingResources.push("storageBuffer");
        if (!readbackBuffers) missingResources.push("readbackBuffers");

        if (missingResources.length > 0) {
          console.warn("[WebGPU ReadKernel] Missing resources for kernel read:", missingResources.join(", "));
          console.warn("[WebGPU ReadKernel] Returning default kernel. Position:", { x, y });
          return Array(KERNEL_PIXELS).fill({ r: 0, g: 0, b: 0, a: 255 });
        }

        const submissionIndex = gpuResources.current.readbackBufferIndex!;
        const processingIndex = (submissionIndex + 1) % 2;

        try {
          // 1. Submit new work
          const normX = Math.max(0, Math.min(1, x));
          const normY = Math.max(0, Math.min(1, y));
          mousePosBuffer.write(d.vec2f(normX, normY));

          const commandEncoder = root.device.createCommandEncoder();
          const computePass = commandEncoder.beginComputePass();
          computePass.setPipeline(computePipeline);
          computePass.setBindGroup(0, root.unwrap(kernelComputeBindGroup));
          computePass.dispatchWorkgroups(KERNEL_SIZE, KERNEL_SIZE, 1);
          computePass.end();

          const submissionBuffer = readbackBuffers[submissionIndex];
          commandEncoder.copyBufferToBuffer(
            root.unwrap(storageBuffer),
            0,
            root.unwrap(submissionBuffer),
            0,
            KERNEL_PIXELS * 16
          );
          root.device.queue.submit([commandEncoder.finish()]);

          // 2. Increment index for next time
          gpuResources.current.readbackBufferIndex = processingIndex;

          // 3. Process the PREVIOUS buffer
          const processingBuffer = readbackBuffers[processingIndex];
          const results = (await processingBuffer.read()) as {
            x: number;
            y: number;
            z: number;
            w: number;
          }[];
          return results.map((c) => ({
            r: Math.round(c.x * 255),
            g: Math.round(c.y * 255),
            b: Math.round(c.z * 255),
            a: Math.round(c.w * 255),
          }));
        } catch (e) {
          console.error("[WebGPU ReadKernel] Kernel read operation failed:", e);
          console.error("[WebGPU ReadKernel] Position:", { x, y, normX, normY });
          console.warn(
            "Buffer readback failed. This can happen if the tab is in the background or the buffer is still in use. Silently ignoring.",
            e
          );
          // Unmap the buffer so it can be used again
          root.unwrap(processingBuffer).unmap();
          return [];
        }
      },
      []
    );

    const updateVideoTexture = useCallback((width: number, height: number) => {
      console.log("[WebGPU UpdateTexture] Updating video texture:", { width, height });
      
      const {
        root,
        computeLayout,
        storageBuffer,
        mousePosBuffer,
        kernelSizeBuffer,
      } = gpuResources.current;

      // Better logging for missing resources
      const missingResources = [];
      if (!root) missingResources.push("root (TgpuRoot)");
      if (!computeLayout) missingResources.push("computeLayout");
      if (!storageBuffer) missingResources.push("storageBuffer");
      if (!mousePosBuffer) missingResources.push("mousePosBuffer");
      if (!kernelSizeBuffer) missingResources.push("kernelSizeBuffer");

      if (missingResources.length > 0) {
        console.error("[WebGPU UpdateTexture] Cannot update video texture, missing resources:", missingResources.join(", "));
        return;
      }

      try {
        if (gpuResources.current.videoRenderTexture) {
          console.log("[WebGPU UpdateTexture] Destroying previous texture");
          gpuResources.current.videoRenderTexture.destroy();
        }

        const newTexture = root["~unstable"]
          .createTexture({ size: [width, height], format: "rgba8unorm" })
          .$name("Video Render Target")
          .$usage("render", "sampled");
        const newBindGroup = root.createBindGroup(computeLayout, {
          inputTexture: root.unwrap(newTexture).createView(),
          outputBuffer: storageBuffer,
          mousePosition: mousePosBuffer,
          kernelSize: kernelSizeBuffer,
        });

        gpuResources.current.videoRenderTexture = newTexture;
        gpuResources.current.kernelComputeBindGroup = newBindGroup;

        // Update canvas size
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          console.log("[WebGPU UpdateTexture] Canvas size updated:", { width, height });
        }
        
        console.log("[WebGPU UpdateTexture] Video texture updated successfully");
      } catch (error) {
        console.error("[WebGPU UpdateTexture] Failed to update video texture:", error);
      }
    }, []);

    const startRenderLoop = useCallback(() => {
      const animate = () => {
        render();
        animationFrameId.current = requestAnimationFrame(animate);
      };
      animationFrameId.current = requestAnimationFrame(animate);
    }, [render]);

    const stopRenderLoop = useCallback(() => {
      cancelAnimationFrame(animationFrameId.current);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        readKernelAt,
        updateVideoTexture,
        startRenderLoop,
        stopRenderLoop,
      }),
      [readKernelAt, updateVideoTexture, startRenderLoop, stopRenderLoop]
    );

    useEffect(() => {
      initWebGPU();

      return () => {
        if (gpuResources.current.videoRenderTexture) {
          gpuResources.current.videoRenderTexture.destroy();
        }
        stopRenderLoop();
      };
    }, [initWebGPU, stopRenderLoop]);

    useEffect(() => {
      startRenderLoop();
      return () => stopRenderLoop();
    }, [startRenderLoop, stopRenderLoop]);

    return (
      <canvas
        ref={canvasRef}
        width="512"
        height="512"
        onPointerMove={onPointerMove}
        className={className}
      />
    );
  }
);

WebGPUCanvas.displayName = "WebGPUCanvas";
