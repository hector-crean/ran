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
import { useMaskCanvasResources, MaskCanvasResources } from "./use-mask-canvas-resources";

const KERNEL_SIZE = 15;
const KERNEL_PIXELS = KERNEL_SIZE * KERNEL_SIZE;

export type Color = { r: number; g: number; b: number; a: number };
export type Kernel = Color[];

export interface VideoMaskCanvasHandle {
  readKernelAt: (x: number, y: number) => Promise<Kernel>;
  updateVideoTexture: (width: number, height: number) => void;
  startRenderLoop: () => void;
  stopRenderLoop: () => void;
}

interface VideoMaskCanvasProps {
  videoElement: HTMLVideoElement | null;
  maskVideoElement: HTMLVideoElement | null;
  isVideoLoaded: boolean;
  isMaskVideoLoaded: boolean;
  onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  className?: string;
}

export const VideoMaskCanvas = forwardRef<VideoMaskCanvasHandle, VideoMaskCanvasProps>(
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
    const animationFrameId = useRef(0);

    const { resources, initializeWebGPU, destroyResources, isInitialized } = useMaskCanvasResources();

    const initialize = useCallback(async () => {
      if (!canvasRef.current) {
        console.error("[WebGPU Init] Canvas ref not available");
        return;
      }

      await initializeWebGPU(canvasRef.current, KERNEL_SIZE);
    }, [initializeWebGPU]);

    const renderVideoFrame = useCallback(() => {
      if (!resources) {
        console.warn("[WebGPU Render] Resources not initialized");
        return;
      }

      if (!videoElement || !maskVideoElement) {
        console.warn("[WebGPU Render] Video elements not available");
        return;
      }

      const {
        root: tgpuRoot,
        canvasContext,
        videoToOffscreenTexturePipeline,
        videoToCanvasRenderPipeline,
        offscreenVideoTexture,
        videoTexturesBindGroupLayout,
        samplerBindGroupLayout,
      } = resources;

      if (!offscreenVideoTexture) {
        console.warn("[WebGPU Render] Offscreen video texture not available");
        return;
      }

      try {
        const commandEncoder = tgpuRoot.device.createCommandEncoder();

        const renderPass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: tgpuRoot.unwrap(offscreenVideoTexture).createView(),
              clearValue: [0, 0, 0, 1],
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        renderPass.setPipeline(videoToOffscreenTexturePipeline);

        const frequentBindGroup = tgpuRoot.createBindGroup(videoTexturesBindGroupLayout, {
          mainVideoTexture: tgpuRoot.device.importExternalTexture({
            source: videoElement,
          }),
          maskVideoTexture: tgpuRoot.device.importExternalTexture({
            source: maskVideoElement,
          }),
        });

        const videoSampler = tgpuRoot.device.createSampler({
          label: "Video Sampler",
          magFilter: "linear",
          minFilter: "linear",
        });
        const rareBindGroup = tgpuRoot.createBindGroup(samplerBindGroupLayout, {
          videoSampler,
        });

        renderPass.setBindGroup(0, tgpuRoot.unwrap(rareBindGroup));
        renderPass.setBindGroup(1, tgpuRoot.unwrap(frequentBindGroup));

        renderPass.draw(6);
        renderPass.end();

        const canvasRenderPass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: canvasContext.getCurrentTexture().createView(),
              clearValue: [0, 0, 0, 1],
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        canvasRenderPass.setPipeline(videoToCanvasRenderPipeline);

        canvasRenderPass.setBindGroup(0, tgpuRoot.unwrap(rareBindGroup));
        canvasRenderPass.setBindGroup(1, tgpuRoot.unwrap(frequentBindGroup));

        canvasRenderPass.draw(6);
        canvasRenderPass.end();

        tgpuRoot.device.queue.submit([commandEncoder.finish()]);
      } catch (error) {
        console.error("[WebGPU Render] Render failed:", error);
      }
    }, [resources, videoElement, maskVideoElement, isVideoLoaded, isMaskVideoLoaded]);

    const readKernelAt = useCallback(
      async (x: number, y: number): Promise<Kernel> => {
        if (!resources) {
          console.warn("[WebGPU ReadKernel] Resources not initialized");
          return Array(KERNEL_PIXELS).fill({ r: 0, g: 0, b: 0, a: 255 });
        }
  
        const {
          root,
          mousePositionUniformBuffer,
          kernelSamplingBindGroup,
          kernelSamplingComputePipeline,
          kernelDataStorageBuffer,
          kernelReadbackBuffers,
        } = resources;

        if (!kernelSamplingBindGroup) {
          console.warn("[WebGPU ReadKernel] Kernel sampling bind group not available");
          return Array(KERNEL_PIXELS).fill({ r: 0, g: 0, b: 0, a: 255 });
        }

        const submissionIndex = resources.readbackBufferIndex;
        const processingIndex = (submissionIndex + 1) % 2;

        try {
          // 1. Submit new work
          const normX = Math.max(0, Math.min(1, x));
          const normY = Math.max(0, Math.min(1, y));
          mousePositionUniformBuffer.write(d.vec2f(normX, normY));

          const commandEncoder = root.device.createCommandEncoder();
          const computePass = commandEncoder.beginComputePass();
          computePass.setPipeline(kernelSamplingComputePipeline);
          computePass.setBindGroup(0, root.unwrap(kernelSamplingBindGroup));
          computePass.dispatchWorkgroups(KERNEL_SIZE, KERNEL_SIZE, 1);
          computePass.end();

          const submissionBuffer = kernelReadbackBuffers[submissionIndex];
          commandEncoder.copyBufferToBuffer(
            root.unwrap(kernelDataStorageBuffer),
            0,
            root.unwrap(submissionBuffer),
            0,
            KERNEL_PIXELS * 16
          );
          root.device.queue.submit([commandEncoder.finish()]);

          // 2. Increment index for next time - FIXED: Update the resources object
          resources.readbackBufferIndex = processingIndex;

          // 3. Process the PREVIOUS buffer
          const processingBuffer = kernelReadbackBuffers[processingIndex];
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
          console.error("[WebGPU ReadKernel] Position:", { x, y,  });
          console.warn(
            "Buffer readback failed. This can happen if the tab is in the background or the buffer is still in use. Silently ignoring.",
            e
          );
          // Unmap the buffer so it can be used again
          const processingBuffer = kernelReadbackBuffers[processingIndex];
          root.unwrap(processingBuffer).unmap();
          return [];
        }
      },
      [resources]
    );

    const updateVideoTexture = useCallback((width: number, height: number) => {
      console.log("[WebGPU UpdateTexture] Updating video texture:", { width, height });

      if (!resources) {
        console.warn("[WebGPU UpdateTexture] Resources not initialized");
        return;
      }
      
      const {
        root,
        kernelComputeBindGroupLayout,
        kernelDataStorageBuffer,
        mousePositionUniformBuffer,
        kernelSizeUniformBuffer,
      } = resources;

      try {
        if (resources.offscreenVideoTexture) {
          console.log("[WebGPU UpdateTexture] Destroying previous texture");
          resources.offscreenVideoTexture.destroy();
        }

        const newTexture = root["~unstable"]
          .createTexture({ size: [width, height], format: "rgba8unorm" })
          .$name("Video Render Target")
          .$usage("render", "sampled");
        const newBindGroup = root.createBindGroup(kernelComputeBindGroupLayout, {
          sourceTexture: root.unwrap(newTexture).createView(),
          kernelDataOutput: kernelDataStorageBuffer,
          mousePosition: mousePositionUniformBuffer,
          kernelSize: kernelSizeUniformBuffer,
        });

        // FIXED: Update the resources object, not the destructured variables
        resources.offscreenVideoTexture = newTexture;
        resources.kernelSamplingBindGroup = newBindGroup;

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
    }, [resources]);

    const startRenderLoop = useCallback(() => {
      const animate = () => {
        renderVideoFrame();
        animationFrameId.current = requestAnimationFrame(animate);
      };
      animationFrameId.current = requestAnimationFrame(animate);
    }, [renderVideoFrame]);

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
      initialize();

      return () => {
        destroyResources();
        stopRenderLoop();
      };
    }, [initialize, destroyResources, stopRenderLoop]);

    useEffect(() => {
      if (isInitialized) {
        startRenderLoop();
      }
      return () => stopRenderLoop();
    }, [startRenderLoop, stopRenderLoop, isInitialized]);

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

VideoMaskCanvas.displayName = "VideoMaskCanvas";
