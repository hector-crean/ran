import {

    useRef,
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
  

  
  export interface MaskCanvasResources {
    root: TgpuRoot;
    canvasContext: GPUCanvasContext;
    presentationFormat: GPUTextureFormat;
    samplerBindGroupLayout: TgpuBindGroupLayout;
    videoTexturesBindGroupLayout: TgpuBindGroupLayout;
    kernelComputeBindGroupLayout: TgpuBindGroupLayout;
    kernelDataStorageBuffer: TgpuBuffer<d.WgslArray<d.Vec4f>> & StorageFlag;
    kernelReadbackBuffers: TgpuBuffer<d.WgslArray<d.Vec4f>>[];
    readbackBufferIndex: number;
    mousePositionUniformBuffer: TgpuBuffer<d.Vec2f> & UniformFlag;
    kernelSizeUniformBuffer: TgpuBuffer<d.I32> & UniformFlag;
    videoToOffscreenTexturePipeline: GPURenderPipeline;
    videoToCanvasRenderPipeline: GPURenderPipeline;
    kernelSamplingComputePipeline: GPUComputePipeline;
    offscreenVideoTexture: TgpuTexture | null;
    kernelSamplingBindGroup: TgpuBindGroup | null;
  }
  
  
  
  
  // ... WebGPUResources interface ...
  
  export interface UseMaskCanvasResourcesReturn {
    resources: MaskCanvasResources | null;
    initializeWebGPU: (canvas: HTMLCanvasElement, KERNEL_SIZE: number) => Promise<void>;
    destroyResources: () => void;
    isInitialized: boolean;
  }
  
  export const useMaskCanvasResources = (): UseMaskCanvasResourcesReturn => {
    const resourcesRef = useRef<MaskCanvasResources | null>(null);
  
    const initializeWebGPU = useCallback(async (canvas: HTMLCanvasElement, KERNEL_SIZE: number) => {
      console.log("[WebGPU Init] Starting WebGPU initialization");

      const KERNEL_PIXELS = KERNEL_SIZE * KERNEL_SIZE;
  
      const canvasContext = canvas.getContext("webgpu");
      if (!canvasContext) {
        throw new Error("WebGPU not supported");
      }
  
      try {
        const tgpuRoot = await tgpu.init();
        const canvasPresentationFormat = navigator.gpu.getPreferredCanvasFormat();
  
        canvasContext.configure({
          device: tgpuRoot.device,
          format: canvasPresentationFormat,
          alphaMode: "premultiplied",
        });
  
          // --- Bind Group Layout Definitions ---
          const samplerBindGroupLayout = tgpu.bindGroupLayout({
            videoSampler: { sampler: "filtering" },
          });
          
          const videoTexturesBindGroupLayout = tgpu.bindGroupLayout({
            mainVideoTexture: { externalTexture: {} },
            maskVideoTexture: { externalTexture: {} },
          });
          
          const VertexShaderOutput = d.struct({
            position: d.builtin.position,
            uv: d.location(0, d.vec2f),
          });
  
          const videoRenderingShaderCode = tgpu.resolve({
            template: /* wgsl */ `
              @vertex
              fn vertex_main(@builtin(vertex_index) vertexIndex: u32) -> VertexShaderOutput {
                const positions = array(vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0), vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0));
                const uvCoordinates = array(vec2(0.0, 1.0), vec2(1.0, 1.0), vec2(0.0, 0.0), vec2(0.0, 0.0), vec2(1.0, 1.0), vec2(1.0, 0.0));
                var output: VertexShaderOutput;
                output.position = vec4(positions[vertexIndex], 0.0, 1.0);
                output.uv = uvCoordinates[vertexIndex];
                return output;
              }
              @fragment
              fn fragment_composite_video(@location(0) uv: vec2f) -> @location(0) vec4f {
                let videoColor = textureSampleBaseClampToEdge(mainVideoTexture, videoSampler, uv);
                let maskColor = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv);
                return vec4(videoColor.rgb, maskColor.r);
              }

              @fragment
              fn fragment_simple_video(@location(0) uv: vec2f) -> @location(0) vec4f {
                let videoColor = textureSampleBaseClampToEdge(mainVideoTexture, videoSampler, uv);
                return vec4(videoColor.rgb, 1.0);
              }
              
              @fragment
              fn fragment_outline_effect(@location(0) uv: vec2f) -> @location(0) vec4f {
                let videoColor = textureSampleBaseClampToEdge(mainVideoTexture, videoSampler, uv);
                let maskColor = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv);
                
                // Sample neighboring pixels for edge detection
                let texelSize = vec2f(1.0 / 1920.0, 1.0 / 1080.0);
                let outlineWidth = 1.5;
                
                let maskCenter = maskColor.rgb;
                let maskLeft = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv + vec2f(-texelSize.x * outlineWidth, 0.0)).rgb;
                let maskRight = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv + vec2f(texelSize.x * outlineWidth, 0.0)).rgb;
                let maskUp = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv + vec2f(0.0, -texelSize.y * outlineWidth)).rgb;
                let maskDown = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv + vec2f(0.0, texelSize.y * outlineWidth)).rgb;
                
                // Color-based edge detection - detect transitions between different mask colors
                let colorDiff = length(maskCenter - maskLeft) + length(maskCenter - maskRight) + 
                               length(maskCenter - maskUp) + length(maskCenter - maskDown);
                
                // Check if we're at a mask boundary (transition from colored mask to black background or between different masks)
                let maskIntensity = length(maskColor.rgb);
                let isBackground = maskIntensity < 0.05;
                let isEdge = colorDiff > 0.2;
                
                // Create outline using the mask's own color but brighter
                let outlineColor = normalize(maskColor.rgb + vec3f(0.1)) * 1.5;
                let outlineThreshold = 0.1;
                
                // Apply outline effect
                if (isEdge && !isBackground) {
                  return vec4f(mix(videoColor.rgb, outlineColor, 0.8), 1.0);
                } else {
                  return vec4f(videoColor.rgb, maskColor.r);
                }
              }
              
              @fragment
              fn fragment_glow_effect(@location(0) uv: vec2f) -> @location(0) vec4f {
                let videoColor = textureSampleBaseClampToEdge(mainVideoTexture, videoSampler, uv);
                let maskColor = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv);
                
                let texelSize = vec2f(1.0 / 1920.0, 1.0 / 1080.0);
                let glowRadius = 5.0;
                let glowSamples = 8;
                
                var glowAccumulation = 0.0;
                
                // Sample in a circle around the current pixel
                for (var i = 0; i < glowSamples; i++) {
                  let angle = f32(i) * 2.0 * 3.14159 / f32(glowSamples);
                  let offset = vec2f(cos(angle), sin(angle)) * texelSize * glowRadius;
                  let sampleMask = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv + offset).r;
                  glowAccumulation += sampleMask;
                }
                
                glowAccumulation /= f32(glowSamples);
                
                // Create glow color
                let glowColor = vec3f(0.0, 0.5, 1.0); // Blue glow
                let glowIntensity = glowAccumulation * 0.8;
                
                // Combine original video with glow
                let finalColor = mix(videoColor.rgb, glowColor, glowIntensity * (1.0 - maskColor.r));
                return vec4f(finalColor, max(maskColor.r, glowIntensity));
              }
              
              @fragment
              fn fragment_stroke_outline(@location(0) uv: vec2f) -> @location(0) vec4f {
                let videoColor = textureSampleBaseClampToEdge(mainVideoTexture, videoSampler, uv);
                let maskColor = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv);
                
                let texelSize = vec2f(1.0 / 1920.0, 1.0 / 1080.0);
                let strokeWidth = 3.0;
                
                // Sample in multiple directions to create a solid stroke
                var maxMaskValue = 0.0;
                let sampleCount = 16;
                
                for (var i = 0; i < sampleCount; i++) {
                  let angle = f32(i) * 2.0 * 3.14159 / f32(sampleCount);
                  let offset = vec2f(cos(angle), sin(angle)) * texelSize * strokeWidth;
                  let sampleMask = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv + offset).r;
                  maxMaskValue = max(maxMaskValue, sampleMask);
                }
                
                // Create stroke effect
                let strokeColor = vec3f(1.0, 1.0, 0.0); // Yellow stroke
                let isStroke = maxMaskValue > 0.1 && maskColor.r < 0.1; // Stroke where mask dilates but original is transparent
                
                if (isStroke) {
                  return vec4f(strokeColor, 1.0);
                } else {
                  return vec4f(videoColor.rgb, maskColor.r);
                }
              }
              
              @fragment
              fn fragment_morphological_operations(@location(0) uv: vec2f) -> @location(0) vec4f {
                let videoColor = textureSampleBaseClampToEdge(mainVideoTexture, videoSampler, uv);
                let maskColor = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv);
                
                let texelSize = vec2f(1.0 / 1920.0, 1.0 / 1080.0);
                let kernelSize = 2.0;
                
                // Dilation operation - expand the mask
                var maxMask = 0.0;
                for (var dx = -kernelSize; dx <= kernelSize; dx += 1.0) {
                  for (var dy = -kernelSize; dy <= kernelSize; dy += 1.0) {
                    let offset = vec2f(dx, dy) * texelSize;
                    let sampleMask = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv + offset).r;
                    maxMask = max(maxMask, sampleMask);
                  }
                }
                
                // Erosion operation - shrink the mask
                var minMask = 1.0;
                for (var dx = -kernelSize; dx <= kernelSize; dx += 1.0) {
                  for (var dy = -kernelSize; dy <= kernelSize; dy += 1.0) {
                    let offset = vec2f(dx, dy) * texelSize;
                    let sampleMask = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv + offset).r;
                    minMask = min(minMask, sampleMask);
                  }
                }
                
                // Create different effects using morphological operations
                let dilatedMask = maxMask;
                let erodedMask = minMask;
                let edgeMask = dilatedMask - erodedMask; // Gradient/edge
                
                // Apply the effect
                let effectColor = vec3f(0.8, 0.2, 0.8); // Purple effect
                let finalColor = mix(videoColor.rgb, effectColor, edgeMask * 0.6);
                
                return vec4f(finalColor, max(maskColor.r, edgeMask * 0.3));
              }
              
              @fragment
              fn fragment_extract_colors(@location(0) uv: vec2f) -> @location(0) vec4f {
                let maskColor = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv);
                return vec4(maskColor.rgb, 1.0);
              }
              
              @fragment
              fn fragment_mask_separation(@location(0) uv: vec2f) -> @location(0) vec4f {
                let videoColor = textureSampleBaseClampToEdge(mainVideoTexture, videoSampler, uv);
                let maskColor = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv);
                
                // Detect different prime-based mask regions by analyzing color intensity patterns
                let maskIntensity = length(maskColor.rgb);
                
                // Create different effects for different mask intensities (representing different primes/combinations)
                if (maskIntensity < 0.05) {
                  // Background - keep original video
                  return vec4f(videoColor.rgb, 0.0);
                } else if (maskIntensity < 0.3) {
                  // Lower intensity mask (single prime) - subtle glow
                  let glowColor = maskColor.rgb * 3.0;
                  return vec4f(mix(videoColor.rgb, glowColor, 0.3), 1.0);
                } else if (maskIntensity < 0.6) {
                  // Medium intensity mask (prime combination) - stronger effect
                  let enhancedColor = maskColor.rgb * 2.0;
                  return vec4f(mix(videoColor.rgb, enhancedColor, 0.5), 1.0);
                } else {
                  // High intensity mask (multiple overlapping primes) - most dramatic effect
                  let maxColor = normalize(maskColor.rgb) * 1.2;
                  return vec4f(mix(videoColor.rgb, maxColor, 0.7), 1.0);
                }
              }
              
              @fragment
              fn fragment_prime_outline(@location(0) uv: vec2f) -> @location(0) vec4f {
                let videoColor = textureSampleBaseClampToEdge(mainVideoTexture, videoSampler, uv);
                let maskColor = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv);
                
                let texelSize = vec2f(1.0 / 1920.0, 1.0 / 1080.0);
                let outlineWidth = 2.0;
                
                // Sample surrounding pixels to detect mask boundaries
                let center = maskColor.rgb;
                var maxColorDiff = 0.0;
                var neighborMaskColor = vec3f(0.0);
                
                // Check 8 directions for the strongest color difference
                for (var i = 0; i < 8; i++) {
                  let angle = f32(i) * 2.0 * 3.14159 / 8.0;
                  let offset = vec2f(cos(angle), sin(angle)) * texelSize * outlineWidth;
                  let neighborColor = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv + offset).rgb;
                  
                  let colorDiff = length(center - neighborColor);
                  if (colorDiff > maxColorDiff) {
                    maxColorDiff = colorDiff;
                    neighborMaskColor = neighborColor;
                  }
                }
                
                // Create outline effect based on the transition between different prime-colored masks
                let isEdge = maxColorDiff > 0.15;
                let centerIntensity = length(center);
                let neighborIntensity = length(neighborMaskColor);
                
                if (isEdge && centerIntensity > 0.05) {
                  // Use a combination of both mask colors for the outline
                  let outlineColor = normalize(center + neighborMaskColor) * 1.8;
                  return vec4f(mix(videoColor.rgb, outlineColor, 0.6), 1.0);
                } else {
                  return vec4f(videoColor.rgb, length(maskColor.rgb));
                }
              }
              
              @fragment
              fn fragment_overlap_highlight(@location(0) uv: vec2f) -> @location(0) vec4f {
                let videoColor = textureSampleBaseClampToEdge(mainVideoTexture, videoSampler, uv);
                let maskColor = textureSampleBaseClampToEdge(maskVideoTexture, videoSampler, uv);
                
                // Detect overlapping regions by analyzing color complexity
                // Higher intensity usually means more prime factors (more overlaps)
                let maskIntensity = length(maskColor.rgb);
                let colorComplexity = abs(maskColor.r - maskColor.g) + abs(maskColor.g - maskColor.b) + abs(maskColor.b - maskColor.r);
                
                // Overlapping regions will have higher complexity and intensity
                let overlapFactor = maskIntensity * colorComplexity * 2.0;
                
                if (overlapFactor > 0.3) {
                  // Highlight overlapping regions with a special effect
                  let highlightColor = vec3f(1.0, 0.8, 0.2); // Golden highlight for overlaps
                  let pulseEffect = 0.5 + 0.3 * sin(length(uv) * 20.0); // Add some visual interest
                  return vec4f(mix(videoColor.rgb, highlightColor * pulseEffect, overlapFactor * 0.6), 1.0);
                } else if (maskIntensity > 0.05) {
                  // Single mask regions - subtle tint
                  let tintColor = normalize(maskColor.rgb) * 0.8;
                  return vec4f(mix(videoColor.rgb, tintColor, 0.2), 1.0);
                } else {
                  // Background
                  return vec4f(videoColor.rgb, 0.0);
                }
              }
            `,
            externals: {
              ...samplerBindGroupLayout.bound,
              ...videoTexturesBindGroupLayout.bound,
              VertexShaderOutput,
            },
          });
  
          const kernelComputeBindGroupLayout = tgpu.bindGroupLayout({
            sourceTexture: { texture: "unfilterable-float" },
            kernelDataOutput: {
              storage: d.arrayOf(d.vec4f, KERNEL_PIXELS),
              access: "mutable",
            },
            mousePosition: { uniform: d.vec2f },
            kernelSize: { uniform: d.i32 },
          });
  
          const kernelSamplingComputeShaderCode = tgpu.resolve({
            template: /* wgsl */ `
              @compute @workgroup_size(1, 1, 1)
              fn compute_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
                let kernelX = i32(globalId.x);
                let kernelY = i32(globalId.y);
                if (kernelX >= kernelSize || kernelY >= kernelSize) { return; }
                
                let kernelIndex = kernelY * kernelSize + kernelX;
                let kernelHalfSize = kernelSize / 2;
                let offsetX = kernelX - kernelHalfSize;
                let offsetY = kernelY - kernelHalfSize;
                
                let textureDimensions = vec2f(textureDimensions(sourceTexture));
                let centerPixelPosition = mousePosition * textureDimensions;
                let samplePixelPosition = vec2i(centerPixelPosition) + vec2i(offsetX, offsetY);
                let clampedSamplePosition = vec2i(
                  clamp(samplePixelPosition.x, 0, i32(textureDimensions.x) - 1), 
                  clamp(samplePixelPosition.y, 0, i32(textureDimensions.y) - 1)
                );
                
                kernelDataOutput[kernelIndex] = textureLoad(sourceTexture, clampedSamplePosition, 0);
              }
            `,
            externals: { ...kernelComputeBindGroupLayout.bound },
          });
  
          // --- Shader Module Creation ---
          const videoRenderingShaderModule = tgpuRoot.device.createShaderModule({
            label: "Video Rendering Shader",
            code: videoRenderingShaderCode,
          });
          
          const kernelSamplingComputeShaderModule = tgpuRoot.device.createShaderModule({
            label: "Kernel Sampling Compute Shader",
            code: kernelSamplingComputeShaderCode,
          });
  
          // --- Buffer Creation ---
          const kernelDataStorageBuffer = tgpuRoot
            .createBuffer(d.arrayOf(d.vec4f, KERNEL_PIXELS))
            .$name("Kernel Color Data Storage Buffer")
            .$usage("storage")
            .$addFlags(GPUBufferUsage.COPY_SRC);
  
          const kernelReadbackBuffers = [
            tgpuRoot
              .createBuffer(d.arrayOf(d.vec4f, KERNEL_PIXELS))
              .$name("Kernel Readback Buffer A")
              .$addFlags(GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ),
            tgpuRoot
              .createBuffer(d.arrayOf(d.vec4f, KERNEL_PIXELS))
              .$name("Kernel Readback Buffer B")
              .$addFlags(GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ),
          ];
  
          const mousePositionUniformBuffer = tgpuRoot
            .createBuffer(d.vec2f)
            .$name("Mouse Position Uniform Buffer")
            .$usage("uniform");
            
          const kernelSizeUniformBuffer = tgpuRoot
            .createBuffer(d.i32, KERNEL_SIZE)
            .$name("Kernel Size Uniform Buffer")
            .$usage("uniform");
  
          // --- Pipeline Creation ---
          const renderPipelineLayout = tgpuRoot.device.createPipelineLayout({
            bindGroupLayouts: [
              tgpuRoot.unwrap(samplerBindGroupLayout),
              tgpuRoot.unwrap(videoTexturesBindGroupLayout),
            ],
          });
  
          const videoToOffscreenTexturePipeline = tgpuRoot.device.createRenderPipeline({
            label: "Video to Offscreen Texture Pipeline",
            layout: renderPipelineLayout,
            vertex: { module: videoRenderingShaderModule, entryPoint: "vertex_main" },
            fragment: {
              module: videoRenderingShaderModule,
              entryPoint: "fragment_extract_colors",
              targets: [{ format: "rgba8unorm" }],
            },
            primitive: { topology: "triangle-list" },
          });
  
          const videoToCanvasRenderPipeline = tgpuRoot.device.createRenderPipeline({
            label: "Video to Canvas Pipeline",
            layout: renderPipelineLayout,
            vertex: { module: videoRenderingShaderModule, entryPoint: "vertex_main" },
            fragment: {
              module: videoRenderingShaderModule,
              entryPoint: "fragment_simple_video",
              targets: [{ format: canvasPresentationFormat }],
            },
            primitive: { topology: "triangle-list" },
          });
  
          const kernelSamplingComputePipeline = tgpuRoot.device.createComputePipeline({
            label: "Kernel Color Sampling Compute Pipeline",
            layout: tgpuRoot.device.createPipelineLayout({
              label: "Kernel Sampling Pipeline Layout",
              bindGroupLayouts: [tgpuRoot.unwrap(kernelComputeBindGroupLayout)],
            }),
            compute: { module: kernelSamplingComputeShaderModule, entryPoint: "compute_main" },
          });
  
          // Create initial offscreen texture with default dimensions
          console.log("[WebGPU Init] Creating initial offscreen video texture");
          const initialOffscreenTexture = tgpuRoot["~unstable"]
            .createTexture({ size: [512, 512], format: "rgba8unorm" })
            .$name("Initial Offscreen Video Texture")
            .$usage("render", "sampled");
          
          const initialKernelSamplingBindGroup = tgpuRoot.createBindGroup(kernelComputeBindGroupLayout, {
            sourceTexture: tgpuRoot.unwrap(initialOffscreenTexture).createView(),
            kernelDataOutput: kernelDataStorageBuffer,
            mousePosition: mousePositionUniformBuffer,
            kernelSize: kernelSizeUniformBuffer,
          });
  
          console.log("[WebGPU Init] All resources created successfully");
          console.log("[WebGPU Init] WebGPU Resources summary:", {
            hasTgpuRoot: !!tgpuRoot,
            hasCanvasContext: !!canvasContext,
            presentationFormat: canvasPresentationFormat,
            kernelSize: KERNEL_SIZE,
            kernelPixels: KERNEL_PIXELS,
            initialTextureSize: [512, 512]
          });
  
  
        // Create the complete resources object
        const completeResources: MaskCanvasResources = {
          root: tgpuRoot,
          canvasContext,
          presentationFormat: canvasPresentationFormat,
          samplerBindGroupLayout,
          videoTexturesBindGroupLayout,
          kernelComputeBindGroupLayout,
          kernelDataStorageBuffer,
          kernelReadbackBuffers,
          readbackBufferIndex: 0,
          mousePositionUniformBuffer,
          kernelSizeUniformBuffer,
          videoToOffscreenTexturePipeline,
          videoToCanvasRenderPipeline,
          kernelSamplingComputePipeline,
          offscreenVideoTexture: initialOffscreenTexture,
          kernelSamplingBindGroup: initialKernelSamplingBindGroup,
        };
  
        resourcesRef.current = completeResources;
        console.log("[WebGPU Init] Resources initialized successfully");
      } catch (error) {
        console.error("[WebGPU Init] Initialization failed:", error);
        throw error;
      }
    }, []);
  
    const destroyResources = useCallback(() => {
      if (resourcesRef.current?.offscreenVideoTexture) {
        resourcesRef.current.offscreenVideoTexture.destroy();
      }
      resourcesRef.current = null;
    }, []);
  
    return {
      resources: resourcesRef.current,
      initializeWebGPU,
      destroyResources,
      isInitialized: resourcesRef.current !== null,
    };
  };
  
  