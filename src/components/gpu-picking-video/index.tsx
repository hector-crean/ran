'use client';

import { useFBO, useVideoTexture } from '@react-three/drei';
import { Canvas, extend, ThreeElement, useFrame, useThree } from '@react-three/fiber';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// Custom shader material
class VideoShaderMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                uVideoTexture: { value: null },
                uMaskTexture: { value: null },
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(1, 1) },
                uVideoResolution: { value: new THREE.Vector2(1, 1) },
                uOutlineThickness: { value: 2.0 },
                uEdgeThreshold: { value: 0.5 },
                uLineInnerColor: { value: new THREE.Color(0xff0000) },
                uLineOuterColor: { value: new THREE.Color(0xA020F0) },
                uMaskOverlayColor: { value: new THREE.Color(0x00ff00) },
                uMaskOverlayOpacity: { value: 0.3 },
                uOpacity: { value: 1.0 },
                uHoveredObject: { value: new THREE.Vector3(0, 0, 0) },
                uSelectedObject: { value: new THREE.Vector3(0, 0, 0) }
            },
            vertexShader: /*glsl*/`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: /*glsl*/`
        uniform sampler2D uVideoTexture;
        uniform sampler2D uMaskTexture;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uVideoResolution;
                 uniform float uOutlineThickness;
         uniform float uEdgeThreshold;
         uniform vec3 uLineInnerColor;
         uniform vec3 uLineOuterColor;
         uniform vec3 uMaskOverlayColor;
         uniform float uMaskOverlayOpacity;
         uniform vec3 uHoveredObject;
         uniform vec3 uSelectedObject;
        uniform float uOpacity;
        
        varying vec2 vUv;
        
        void main() {
          // Sample the main video texture
          vec4 videoColor = texture2D(uVideoTexture, vUv);
          
          // Sample the mask texture at current position
          vec4 centerMaskColor = texture2D(uMaskTexture, vUv);
          
          // Calculate texel size based on video resolution
          vec2 texelSize = 1.0 / uVideoResolution;
          
          // Edge detection using Sobel filter
          float gx = 0.0; // Horizontal gradient
          float gy = 0.0; // Vertical gradient
          
          // Sobel kernels for edge detection
          // Horizontal kernel (Gx):    Vertical kernel (Gy):
          // -1  0  1                   -1 -2 -1
          // -2  0  2                    0  0  0
          // -1  0  1                    1  2  1
          
       // 3x3 convolution with Sobel kernels
       for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 offset = vec2(float(x), float(y)) * texelSize * uOutlineThickness;
          vec2 sampleUv = vUv + offset;
          vec4 sampleColor = texture2D(uMaskTexture, sampleUv);
          
          float intensity = length(sampleColor.rgb) / sqrt(3.0);
          
          // Sobel X kernel: [-1,0,1; -2,0,2; -1,0,1]
          float gx_weight = 0.0;
          if (x == -1) gx_weight = -1.0;
          else if (x == 1) gx_weight = 1.0;
          if (y == 0) gx_weight *= 2.0;
          gx += intensity * gx_weight;
          
          // Sobel Y kernel: [-1,-2,-1; 0,0,0; 1,2,1]
          float gy_weight = 0.0;
          if (y == -1) gy_weight = -1.0;
          else if (y == 1) gy_weight = 1.0;
          if (x == 0) gy_weight *= 2.0;
          gy += intensity * gy_weight;
        }
      }
      
      float edgeScore = sqrt(gx * gx + gy * gy);
              
       
        // Normalize edge score - with intensity normalized to [0,1], max Sobel output is:
       // Horizontal: max |±1±2±1| = 4, Vertical: max |±1±2±1| = 4
       // Combined: sqrt(4² + 4²) = sqrt(32) ≈ 5.66
       float maxSobelOutput = sqrt(32.0);
       edgeScore = clamp(edgeScore / maxSobelOutput, 0.0, 1.0);





          
          // Check if current pixel matches hovered or selected object
          vec3 currentColor = centerMaskColor.rgb;
          bool isHovered = uHoveredObject.x >= 0.0 && distance(currentColor, uHoveredObject) < 0.01;
          bool isSelected = uSelectedObject.x >= 0.0 && distance(currentColor, uSelectedObject) < 0.01;
          
          // Only show outline for hovered or selected objects
          bool showOutline = false;
          if (isHovered || isSelected) {
              showOutline = true;
          }
          
          // Calculate outline strength (how much outline to show)
          float outlineStrength = smoothstep(0.0, uEdgeThreshold, edgeScore);
          
          // Use simple single color for outline (inner color for now)
          vec3 outlineColor = uLineInnerColor;
          
          // Calculate outline opacity based on edge strength and whether object should show outline
          float outlineOpacity = 0.0;

          if(showOutline == true) {
            outlineOpacity = outlineStrength;
          }

          // Mix video color with outline color
          vec3 finalColor = mix(videoColor.rgb, outlineColor, outlineOpacity);
          
        //   Apply mask overlay to non-black mask areas
          float maskPresence = length(centerMaskColor.rgb); // 0 for black, >0 for colored masks
          if (maskPresence > 0.01) { // Small threshold to avoid floating point precision issues
            finalColor = mix(finalColor, uMaskOverlayColor, uMaskOverlayOpacity);
          }
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
            transparent: true,
            side: THREE.DoubleSide
        });
    }
}


// Extend R3F to include our custom materials
extend({ VideoShaderMaterial });

// Declare the custom materials for TypeScript
declare module '@react-three/fiber' {
    interface ThreeElements {
        videoShaderMaterial: ThreeElement<typeof VideoShaderMaterial>;
    }
}



interface ColorInfo {
    r: number;
    g: number;
    b: number;
    a: number;
    rNorm: number;
    gNorm: number;
    bNorm: number;
    aNorm: number;
    hex: string;
    objectId: number;
}


interface VideoMeshProps {
    videoSrc: string;
    maskSrc: string;
    onVideoLoad?: (video: HTMLVideoElement) => void;
    onVideoError?: (error: string) => void;
    onMaskHover?: (colorInfo: ColorInfo, x: number, y: number) => void;
    onMaskClick?: (colorInfo: ColorInfo, x: number, y: number) => void;
    outlineThickness?: number;
    edgeThreshold?: number;
    lineInnerColor?: string;
    lineOuterColor?: string;
    maskOverlayColor?: string;
    maskOverlayOpacity?: number;
    hoveredObject: number | null;
    selectedObject: number | null;
}

const VideoMesh = React.memo(React.forwardRef<THREE.Mesh, VideoMeshProps>(function VideoMesh({
    videoSrc,
    maskSrc,
    onVideoLoad,
    onVideoError,
    onMaskHover,
    onMaskClick,
    outlineThickness = 2.0,
    edgeThreshold = 0.5,
    lineInnerColor = '#ff0000',
    lineOuterColor = '#A020F0',
    maskOverlayColor = '#00ff00',
    maskOverlayOpacity = 0.3,
    hoveredObject,
    selectedObject
}, ref) {
    const materialRef = useRef<VideoShaderMaterial>(null);

    const syncIntervalRef = useRef<number | null>(null);
    const [bothVideosReady, setBothVideosReady] = useState(false);

    const { gl, camera, size } = useThree();

    // Use useFBO instead of manual render target management
    const pickingFBO = useFBO(size.width, size.height, {
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        generateMipmaps: false,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter
    });
    const pickingScene = useRef<THREE.Scene>(null);
    const pickingMesh = useRef<THREE.Mesh>(null);

    // Video textures
    const videoTexture = useVideoTexture(videoSrc);
    const maskTexture = useVideoTexture(maskSrc);

    // Debug logging
    useEffect(() => {
        console.log('VideoTexture:', videoTexture);
        console.log('MaskTexture:', maskTexture);
        if (videoTexture?.image) {
            console.log('Video dimensions:', videoTexture.image.videoWidth, 'x', videoTexture.image.videoHeight);
        }
    }, [videoTexture, maskTexture]);

    // Calculate video aspect ratio and plane size
    const videoAspectRatio = useMemo(() => {
        if (videoTexture?.image) {
            const video = videoTexture.image as HTMLVideoElement;
            return video.videoWidth / video.videoHeight;
        }
        return 16 / 9; // Default aspect ratio
    }, [videoTexture]);

    // Update camera bounds based on container aspect ratio
    useEffect(() => {
        if (camera && camera.type === 'OrthographicCamera') {
            const orthoCamera = camera as THREE.OrthographicCamera;
            const containerAspect = size.width / size.height;

            orthoCamera.left = -containerAspect;
            orthoCamera.right = containerAspect;
            orthoCamera.top = 1;
            orthoCamera.bottom = -1;
            orthoCamera.updateProjectionMatrix();

            console.log(`Updated camera bounds: left=${-containerAspect.toFixed(2)}, right=${containerAspect.toFixed(2)}, top=1, bottom=-1`);
        }
    }, [camera, size.width, size.height]);

    // Create plane geometry with correct aspect ratio
    const planeGeometry = useMemo(() => {
        // Calculate based on container aspect ratio
        const containerAspect = size.width / size.height;

        // Camera bounds will be adjusted to match container aspect
        const cameraHeight = 2; // Fixed height from -1 to 1
        const cameraWidth = cameraHeight * containerAspect;

        let planeWidth, planeHeight;

        // Scale down to fit within 90% of camera bounds
        // const maxWidth = cameraWidth * 0.9;
        // const maxHeight = cameraHeight * 0.9;
        const maxWidth = cameraWidth * 1;
        const maxHeight = cameraHeight * 1;

        if (videoAspectRatio > containerAspect) {
            // Video is wider than container - fit to width
            planeWidth = maxWidth;
            planeHeight = planeWidth / videoAspectRatio;
        } else {
            // Video is taller than container - fit to height
            planeHeight = maxHeight;
            planeWidth = planeHeight * videoAspectRatio;
        }

        console.log(`Video aspect: ${videoAspectRatio.toFixed(3)}, Container aspect: ${containerAspect.toFixed(3)}`);
        console.log(`Plane size: ${planeWidth.toFixed(3)} x ${planeHeight.toFixed(3)}`);
        return new THREE.PlaneGeometry(planeWidth, planeHeight);
    }, [videoAspectRatio, size.width, size.height]);

    // Get video elements from textures
    const videoElement = videoTexture.image as HTMLVideoElement;
    const maskElement = maskTexture.image as HTMLVideoElement;

    // Set up picking render target and scene
    useEffect(() => {
        if (!pickingScene.current) {
            pickingScene.current = new THREE.Scene();

            // Create picking mesh with properly sized plane geometry
            const geometry = planeGeometry.clone();
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uMaskTexture: { value: null },
                    uResolution: { value: new THREE.Vector2(1, 1) },
                    uVideoResolution: { value: new THREE.Vector2(1, 1) }
                },
                vertexShader: /*glsl*/`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: /*glsl*/`
                    uniform sampler2D uMaskTexture;
                    uniform vec2 uResolution;
                    uniform vec2 uVideoResolution;
                    
                    varying vec2 vUv;
                    
                    void main() {
                        vec4 maskColor = texture2D(uMaskTexture, vUv);
                        
                        // Output full RGB color for object ID detection
                        gl_FragColor = vec4(maskColor.rgb, 1.0);
                    }
                `
            });
            pickingMesh.current = new THREE.Mesh(geometry, material);
            pickingScene.current.add(pickingMesh.current);
        }
    }, [planeGeometry]);

    // GPU picking function
    const pickMask = useCallback((x: number, y: number) => {
        if (!pickingScene.current || !pickingMesh.current) {
            return;
        }

        // Ensure FBO is ready
        if (!pickingFBO) {
            return;
        }

        // Ensure mask texture is ready
        if (!maskTexture || !maskTexture.image) {
            return;
        }

        // Bounds check
        if (x < 0 || x >= pickingFBO.width || y < 0 || y >= pickingFBO.height) {
            return;
        }

        // Update picking material uniforms
        const pickingMaterial = pickingMesh.current.material as THREE.ShaderMaterial;
        if (maskTexture && pickingMaterial.uniforms) {
            pickingMaterial.uniforms.uMaskTexture.value = maskTexture;
            pickingMaterial.uniforms.uResolution.value.set(size.width, size.height);
            pickingMaterial.uniforms.uVideoResolution.value.set(
                maskTexture.image.videoWidth || 1920,
                maskTexture.image.videoHeight || 1080
            );
        }

        // Render picking scene to render target
        const currentRenderTarget = gl.getRenderTarget();
        gl.setRenderTarget(pickingFBO);
        gl.clear();
        gl.render(pickingScene.current, camera);
        gl.setRenderTarget(currentRenderTarget);

        // Read pixel at cursor position
        const pixelBuffer = new Uint8Array(4);
        const flippedY = pickingFBO.height - y - 1; // Flip Y coordinate and adjust for 0-based indexing

        gl.readRenderTargetPixels(
            pickingFBO,
            x, flippedY,
            1, 1,
            pixelBuffer
        );

        // Return full RGBA color information
        const colorInfo = {
            r: pixelBuffer[0],
            g: pixelBuffer[1],
            b: pixelBuffer[2],
            a: pixelBuffer[3],
            // Convert to 0-1 range
            rNorm: pixelBuffer[0] / 255,
            gNorm: pixelBuffer[1] / 255,
            bNorm: pixelBuffer[2] / 255,
            aNorm: pixelBuffer[3] / 255,
            // Create hex color string
            hex: `#${pixelBuffer[0].toString(16).padStart(2, '0')}${pixelBuffer[1].toString(16).padStart(2, '0')}${pixelBuffer[2].toString(16).padStart(2, '0')}`,
            // Encode as object ID (common encoding: R*65536 + G*256 + B)
            objectId: (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2]
        };

        return colorInfo;
    }, [gl, camera, maskTexture, size.width, size.height, pickingFBO]);

    // Mouse move handler
    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (!onMaskHover) return;

        const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const colorInfo = pickMask(x, y);
        if (colorInfo !== undefined) {
            onMaskHover(colorInfo, x, y);
        }
    }, [pickMask, onMaskHover]);

    // Mouse click handler
    const handleMouseClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (!onMaskClick) return;

        const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const colorInfo = pickMask(x, y);
        if (colorInfo !== undefined) {
            onMaskClick(colorInfo, x, y);
        }
    }, [pickMask, onMaskClick]);

    // Expose mouse handlers
    useEffect(() => {
        if (ref && typeof ref === 'object' && ref.current) {
            (ref.current as any).handleMouseMove = handleMouseMove;
            (ref.current as any).handleMouseClick = handleMouseClick;
        }
    }, [handleMouseMove, handleMouseClick, ref]);

    // Check if both videos are ready
    useEffect(() => {
        if (videoElement && maskElement) {
            const checkReady = () => {
                const videoReady = videoElement.readyState >= 3;
                const maskReady = maskElement.readyState >= 3;

                if (videoReady && maskReady && !bothVideosReady) {
                    setBothVideosReady(true);
                    console.log('Both videos are ready for synchronized playback');
                }
            };

            videoElement.addEventListener('canplay', checkReady);
            maskElement.addEventListener('canplay', checkReady);
            checkReady();

            return () => {
                videoElement.removeEventListener('canplay', checkReady);
                maskElement.removeEventListener('canplay', checkReady);
            };
        }
    }, [videoElement, maskElement, bothVideosReady]);

    // Sync function to keep videos aligned
    const syncVideos = useCallback(() => {
        if (!videoElement || !maskElement) return;

        const mainTime = videoElement.currentTime;
        const maskTime = maskElement.currentTime;
        const timeDiff = Math.abs(mainTime - maskTime);

        const SYNC_THRESHOLD = 0.1;

        if (timeDiff > SYNC_THRESHOLD) {
            console.log(`Videos out of sync by ${timeDiff.toFixed(3)}s, correcting...`);
            maskElement.currentTime = mainTime;
        }
    }, [videoElement, maskElement]);

    const startSyncMonitoring = useCallback(() => {
        if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
        }
        syncIntervalRef.current = window.setInterval(syncVideos, 500);
    }, [syncVideos]);

    const stopSyncMonitoring = useCallback(() => {
        if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (videoElement && maskElement) {
            const handleVideoLoad = () => {
                console.log('Main video loaded:', {
                    width: videoElement.videoWidth,
                    height: videoElement.videoHeight,
                    duration: videoElement.duration
                });
                onVideoLoad?.(videoElement);
            };

            const handleVideoError = (e: Event) => {
                console.error('Main video error:', e, videoElement.error);
                onVideoError?.(`Main video error: ${videoElement.error?.message || 'Unknown error'}`);
            };

            const handleMaskError = (e: Event) => {
                console.error('Mask video error:', e, maskElement.error);
                onVideoError?.(`Mask video error: ${maskElement.error?.message || 'Unknown error'}`);
            };

            videoElement.addEventListener('loadedmetadata', handleVideoLoad);
            videoElement.addEventListener('error', handleVideoError);
            maskElement.addEventListener('error', handleMaskError);

            if (videoElement.readyState >= 1) {
                handleVideoLoad();
            }

            return () => {
                videoElement.removeEventListener('loadedmetadata', handleVideoLoad);
                videoElement.removeEventListener('error', handleVideoError);
                maskElement.removeEventListener('error', handleMaskError);
                stopSyncMonitoring();
            };
        }
    }, [videoElement, maskElement, onVideoLoad, onVideoError, stopSyncMonitoring]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    useEffect(() => {
        if (materialRef.current && videoTexture && maskTexture) {
            materialRef.current.uniforms.uVideoTexture.value = videoTexture;
            materialRef.current.uniforms.uMaskTexture.value = maskTexture;

            materialRef.current.uniforms.uVideoResolution.value.set(
                videoTexture.image.videoWidth || 1920,
                videoTexture.image.videoHeight || 1080
            );
        }
    }, [videoTexture, maskTexture]);

    // Update outline parameters
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uOutlineThickness.value = outlineThickness;
            materialRef.current.uniforms.uEdgeThreshold.value = edgeThreshold;
            materialRef.current.uniforms.uLineInnerColor.value = new THREE.Color(lineInnerColor);
            materialRef.current.uniforms.uLineOuterColor.value = new THREE.Color(lineOuterColor);
            materialRef.current.uniforms.uMaskOverlayColor.value = new THREE.Color(maskOverlayColor);
            materialRef.current.uniforms.uMaskOverlayOpacity.value = maskOverlayOpacity;

            // Convert object ID back to normalized RGB color
            if (hoveredObject !== null) {
                const r = ((hoveredObject >> 16) & 0xFF) / 255.0;
                const g = ((hoveredObject >> 8) & 0xFF) / 255.0;
                const b = (hoveredObject & 0xFF) / 255.0;
                materialRef.current.uniforms.uHoveredObject.value = new THREE.Vector3(r, g, b);
            } else {
                materialRef.current.uniforms.uHoveredObject.value = new THREE.Vector3(-1, -1, -1); // No hover
            }

            if (selectedObject !== null) {
                const r = ((selectedObject >> 16) & 0xFF) / 255.0;
                const g = ((selectedObject >> 8) & 0xFF) / 255.0;
                const b = (selectedObject & 0xFF) / 255.0;
                materialRef.current.uniforms.uSelectedObject.value = new THREE.Vector3(r, g, b);
            } else {
                materialRef.current.uniforms.uSelectedObject.value = new THREE.Vector3(-1, -1, -1); // No selection
            }
        }
    }, [outlineThickness, edgeThreshold, lineInnerColor, lineOuterColor, maskOverlayColor, maskOverlayOpacity, hoveredObject, selectedObject]);

    useEffect(() => {
        const handleResize = () => {
            if (materialRef.current) {
                materialRef.current.uniforms.uResolution.value.set(
                    window.innerWidth,
                    window.innerHeight
                );
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const playVideo = useCallback(async () => {
        if (!videoElement || !maskElement || !bothVideosReady) {
            console.warn('Videos not ready for synchronized playback');
            return;
        }

        try {
            const startTime = 0;
            videoElement.currentTime = startTime;
            maskElement.currentTime = startTime;

            const playPromises = [
                videoElement.play(),
                maskElement.play()
            ];

            await Promise.all(playPromises);
            startSyncMonitoring();

            console.log('Synchronized playback started');
        } catch (err) {
            console.error('Error starting synchronized playback:', err);
            onVideoError?.(`Playback error: ${err}`);
        }
    }, [videoElement, maskElement, bothVideosReady, startSyncMonitoring, onVideoError]);

    const pauseVideo = useCallback(() => {
        if (videoElement && maskElement) {
            stopSyncMonitoring();
            videoElement.pause();
            maskElement.pause();
            console.log('Synchronized playback paused');
        }
    }, [videoElement, maskElement, stopSyncMonitoring]);

    const seekTo = useCallback((time: number) => {
        if (videoElement && maskElement) {
            videoElement.currentTime = time;
            maskElement.currentTime = time;
            console.log(`Seeked to ${time.toFixed(2)}s`);
        }
    }, [videoElement, maskElement]);

    useEffect(() => {
        if (ref && typeof ref === 'object' && ref.current) {
            (ref.current as any).playVideo = playVideo;
            (ref.current as any).pauseVideo = pauseVideo;
            (ref.current as any).seekTo = seekTo;
            (ref.current as any).getVideoElement = () => videoElement;
            (ref.current as any).getMaskElement = () => maskElement;
            (ref.current as any).bothVideosReady = bothVideosReady;
        }
    }, [playVideo, pauseVideo, seekTo, ref, videoElement, maskElement, bothVideosReady]);

    return (
        <group>
            <mesh ref={ref} geometry={planeGeometry}>
                <videoShaderMaterial
                    ref={materialRef}
                    transparent
                    side={THREE.DoubleSide}
                />

            </mesh>
        </group>
    );
}));

interface VideoPlayerProps {
    videoSrc: string;
    maskSrc: string;
    className?: string;
}

export default function GpuPickingVideo({ videoSrc, maskSrc, className = '' }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVideo, setCurrentVideo] = useState<HTMLVideoElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingStatus, setLoadingStatus] = useState<string>('Loading...');
    const [videosReady, setVideosReady] = useState(false);
    const [maskInfo, setMaskInfo] = useState<{
        colorInfo: ColorInfo;
        x: number;
        y: number;
    } | null>(null);
    const videoMeshRef = useRef<THREE.Mesh>(null);

    // Outline shader parameters
    const [outlineThickness, setOutlineThickness] = useState(2.0);
    const [edgeThreshold, setEdgeThreshold] = useState(0.5);
    const [lineInnerColor, setLineInnerColor] = useState('#ff0000');
    const [lineOuterColor, setLineOuterColor] = useState('#A020F0');
    const [maskOverlayColor, setMaskOverlayColor] = useState('#00ff00');
    const [maskOverlayOpacity, setMaskOverlayOpacity] = useState(0.3);
    const [showControls, setShowControls] = useState(false);

    const [hoveredObject, setHoveredObject] = useState<number | null>(null);
    const [selectedObject, setSelectedObject] = useState<number | null>(null);


    const handleVideoLoad = useCallback((video: HTMLVideoElement) => {
        setCurrentVideo(video);
        setLoadingStatus('Videos loaded successfully');
        setError(null);
    }, []);

    const handleVideoError = useCallback((error: string) => {
        setError(error);
        setLoadingStatus('Error loading videos');
    }, []);

    const handleMaskHover = useCallback((colorInfo: ColorInfo, x: number, y: number) => {
        setMaskInfo({ colorInfo, x, y });
        setHoveredObject(colorInfo.objectId);
    }, []);

    const handleMaskClick = useCallback((colorInfo: ColorInfo, x: number, y: number) => {
        // Toggle selection - if already selected, deselect, otherwise select
        if (selectedObject === colorInfo.objectId) {
            setSelectedObject(null);
        } else {
            setSelectedObject(colorInfo.objectId);
        }
    }, [selectedObject]);

    // Check video readiness periodically
    useEffect(() => {
        const checkReadiness = () => {
            if (videoMeshRef.current) {
                const mesh = videoMeshRef.current as any;
                const ready = mesh.bothVideosReady;
                if (ready !== videosReady) {
                    setVideosReady(ready);
                    if (ready) {
                        setLoadingStatus('Videos synchronized and ready');
                    }
                }
            }
        };

        const interval = setInterval(checkReadiness, 100);
        return () => clearInterval(interval);
    }, [videosReady]);

    const togglePlayPause = useCallback(() => {
        if (videoMeshRef.current && videosReady) {
            const mesh = videoMeshRef.current;
            if (isPlaying) {
                mesh.pauseVideo?.();
            } else {
                mesh.playVideo?.();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying, videosReady]);

    const seekToTime = useCallback((time: number) => {
        if (videoMeshRef.current && videosReady) {
            const mesh = videoMeshRef.current as any;
            mesh.seekTo?.(time);
        }
    }, [videosReady]);

    const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (videoMeshRef.current) {
            const mesh = videoMeshRef.current as any;
            mesh.handleMouseMove?.(event);
        }
    }, []);

    const handleCanvasMouseClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (videoMeshRef.current) {
            const mesh = videoMeshRef.current as any;
            mesh.handleMouseClick?.(event);
        }
    }, []);

    return (
        <div
            className={`relative w-full h-full ${className}`}
            onMouseMove={handleCanvasMouseMove}
            onClick={handleCanvasMouseClick}
        >
            <Canvas
                orthographic
                camera={{
                    position: [0, 0, 1],
                    zoom: 1
                }}
                style={{ width: '100%', height: '100%' }}
            >
                <ambientLight intensity={0.5} />
                <VideoMesh
                    ref={videoMeshRef}
                    videoSrc={videoSrc}
                    maskSrc={maskSrc}
                    onVideoLoad={handleVideoLoad}
                    onVideoError={handleVideoError}
                    onMaskHover={handleMaskHover}
                    onMaskClick={handleMaskClick}
                    outlineThickness={outlineThickness}
                    edgeThreshold={edgeThreshold}
                    lineInnerColor={lineInnerColor}
                    lineOuterColor={lineOuterColor}
                    maskOverlayColor={maskOverlayColor}
                    maskOverlayOpacity={maskOverlayOpacity}
                    hoveredObject={hoveredObject}
                    selectedObject={selectedObject}
                />
            </Canvas>

            {/* Status Display */}
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
                {error ? (
                    <div className="text-red-400">❌ {error}</div>
                ) : videosReady ? (
                    <div className="text-green-400">✅ {loadingStatus}</div>
                ) : (
                    <div className="text-yellow-400">⏳ {loadingStatus}</div>
                )}
            </div>

            {/* Mask Picking Display */}
            {maskInfo && (
                <div className="absolute top-16 right-4 bg-black/70 text-white px-3 py-2 rounded text-xs">
                    <div>Cursor: ({maskInfo.x}, {maskInfo.y})</div>
                    <div>Object ID: {maskInfo.colorInfo.objectId}</div>
                    <div>RGB: ({maskInfo.colorInfo.r}, {maskInfo.colorInfo.g}, {maskInfo.colorInfo.b})</div>
                    <div>Hex: {maskInfo.colorInfo.hex}</div>
                    <div className="flex items-center gap-2">
                        <span>Color:</span>
                        <div
                            className="w-4 h-4 border border-white"
                            style={{ backgroundColor: `rgb(${maskInfo.colorInfo.r}, ${maskInfo.colorInfo.g}, ${maskInfo.colorInfo.b})` }}
                        />
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className={`text-xs px-2 py-1 rounded ${hoveredObject === maskInfo.colorInfo.objectId ? 'bg-yellow-600/50 text-yellow-200' : 'bg-gray-600/50 text-gray-300'}`}>
                            {hoveredObject === maskInfo.colorInfo.objectId ? '🔍 Hovered' : 'Hover to outline'}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${selectedObject === maskInfo.colorInfo.objectId ? 'bg-blue-600/50 text-blue-200' : 'bg-gray-600/50 text-gray-300'}`}>
                            {selectedObject === maskInfo.colorInfo.objectId ? '📌 Selected' : 'Click to select'}
                        </div>
                    </div>
                </div>
            )}

            {/* Debug Info */}
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded text-xs">
                <div>Main: {videoSrc.split('/').pop()}</div>
                <div>Mask: {maskSrc.split('/').pop()}</div>
                <div>Status: {isPlaying ? 'Playing' : 'Paused'}</div>
                <div>Ready: {videosReady ? 'Yes' : 'No'}</div>
                <div>Sync: {videosReady && isPlaying ? 'Active' : 'Inactive'}</div>
                <div>GPU Picking: {videosReady ? 'Active' : 'Inactive'}</div>
                <div className="mt-2 pt-2 border-t border-gray-600">
                    <div>Hovered: {hoveredObject !== null ? `#${hoveredObject.toString(16).padStart(6, '0')}` : 'None'}</div>
                    <div>Selected: {selectedObject !== null ? `#${selectedObject.toString(16).padStart(6, '0')}` : 'None'}</div>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
                <button
                    onClick={togglePlayPause}
                    className={`px-6 py-3 text-white rounded-lg transition-colors ${videosReady
                        ? 'bg-black/50 hover:bg-black/70'
                        : 'bg-gray-500/50 cursor-not-allowed'
                        }`}
                    disabled={!videosReady}
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </button>

                {/* Quick seek buttons */}
                {videosReady && (
                    <div className="flex gap-1">
                        <button
                            onClick={() => seekToTime(0)}
                            className="px-3 py-2 bg-gray-600/50 text-white rounded text-sm hover:bg-gray-600/70 transition-colors"
                        >
                            Start
                        </button>
                        <button
                            onClick={() => seekToTime(5)}
                            className="px-3 py-2 bg-gray-600/50 text-white rounded text-sm hover:bg-gray-600/70 transition-colors"
                        >
                            5s
                        </button>
                        <button
                            onClick={() => seekToTime(10)}
                            className="px-3 py-2 bg-gray-600/50 text-white rounded text-sm hover:bg-gray-600/70 transition-colors"
                        >
                            10s
                        </button>
                    </div>
                )}

                {/* Outline Controls Toggle */}
                <button
                    onClick={() => setShowControls(!showControls)}
                    className="px-3 py-2 bg-purple-600/50 text-white rounded text-sm hover:bg-purple-600/70 transition-colors"
                >
                    Outline Controls
                </button>

                {/* Test Video Links */}
                <div className="flex gap-2">
                    <a
                        href={videoSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-blue-500/50 text-white rounded text-sm hover:bg-blue-500/70 transition-colors"
                    >
                        Test Main Video
                    </a>
                    <a
                        href={maskSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-purple-500/50 text-white rounded text-sm hover:bg-purple-500/70 transition-colors"
                    >
                        Test Mask Video
                    </a>
                </div>
            </div>

            {/* Outline Controls Panel */}
            {showControls && (
                <div className="absolute bottom-24 left-4 right-4 bg-black/80 text-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Outline Shader Controls</h3>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Outline Thickness */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Outline Thickness: {outlineThickness.toFixed(1)}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="1"
                                value={outlineThickness}
                                onChange={(e) => setOutlineThickness(parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <div className="text-xs text-gray-400">Controls outline thickness</div>
                        </div>

                        {/* Edge Threshold */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Edge Threshold: {edgeThreshold.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1.0"
                                step="0.005"
                                value={edgeThreshold}
                                onChange={(e) => setEdgeThreshold(parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <div className="text-xs text-gray-400">Minimum edge strength to show outline</div>
                        </div>

                        {/* Inner Color */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Inner Color
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={lineInnerColor}
                                    onChange={(e) => setLineInnerColor(e.target.value)}
                                    className="w-12 h-8 rounded border border-gray-600"
                                />
                                <input
                                    type="text"
                                    value={lineInnerColor}
                                    onChange={(e) => setLineInnerColor(e.target.value)}
                                    className="flex-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                                />
                            </div>
                            <div className="text-xs text-gray-400">Color at edge center</div>
                        </div>

                        {/* Outer Color */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Outer Color
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={lineOuterColor}
                                    onChange={(e) => setLineOuterColor(e.target.value)}
                                    className="w-12 h-8 rounded border border-gray-600"
                                />
                                <input
                                    type="text"
                                    value={lineOuterColor}
                                    onChange={(e) => setLineOuterColor(e.target.value)}
                                    className="flex-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                                />
                            </div>
                            <div className="text-xs text-gray-400">Color at edge periphery</div>
                        </div>

                        {/* Mask Overlay Color */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Mask Overlay Color
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={maskOverlayColor}
                                    onChange={(e) => setMaskOverlayColor(e.target.value)}
                                    className="w-12 h-8 rounded border border-gray-600"
                                />
                                <input
                                    type="text"
                                    value={maskOverlayColor}
                                    onChange={(e) => setMaskOverlayColor(e.target.value)}
                                    className="flex-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                                />
                            </div>
                            <div className="text-xs text-gray-400">Color overlay for masked areas</div>
                        </div>

                        {/* Mask Overlay Opacity */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Mask Overlay Opacity: {maskOverlayOpacity.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0.0"
                                max="1.0"
                                step="0.05"
                                value={maskOverlayOpacity}
                                onChange={(e) => setMaskOverlayOpacity(parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <div className="text-xs text-gray-400">Opacity of mask overlay</div>
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="mt-4 pt-4 border-t border-gray-600">
                        <label className="block text-sm font-medium mb-2">Presets:</label>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => {
                                    setOutlineThickness(1.0);
                                    setEdgeThreshold(0.3);
                                    setLineInnerColor('#ff0000');
                                    setLineOuterColor('#880000');
                                    setMaskOverlayColor('#ff4444');
                                    setMaskOverlayOpacity(0.2);
                                }}
                                className="px-3 py-1 bg-red-600/50 text-white rounded text-sm hover:bg-red-600/70 transition-colors"
                            >
                                Red Outline
                            </button>
                            <button
                                onClick={() => {
                                    setOutlineThickness(1.5);
                                    setEdgeThreshold(0.4);
                                    setLineInnerColor('#00ff00');
                                    setLineOuterColor('#008800');
                                    setMaskOverlayColor('#44ff44');
                                    setMaskOverlayOpacity(0.3);
                                }}
                                className="px-3 py-1 bg-green-600/50 text-white rounded text-sm hover:bg-green-600/70 transition-colors"
                            >
                                Green Thick
                            </button>
                            <button
                                onClick={() => {
                                    setOutlineThickness(0.5);
                                    setEdgeThreshold(0.6);
                                    setLineInnerColor('#0088ff');
                                    setLineOuterColor('#004488');
                                    setMaskOverlayColor('#4488ff');
                                    setMaskOverlayOpacity(0.15);
                                }}
                                className="px-3 py-1 bg-blue-600/50 text-white rounded text-sm hover:bg-blue-600/70 transition-colors"
                            >
                                Blue Thin
                            </button>
                            <button
                                onClick={() => {
                                    setOutlineThickness(2.0);
                                    setEdgeThreshold(0.5);
                                    setLineInnerColor('#ffff00');
                                    setLineOuterColor('#888800');
                                    setMaskOverlayColor('#ffff44');
                                    setMaskOverlayOpacity(0.4);
                                }}
                                className="px-3 py-1 bg-yellow-600/50 text-white rounded text-sm hover:bg-yellow-600/70 transition-colors"
                            >
                                Yellow Bold
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 