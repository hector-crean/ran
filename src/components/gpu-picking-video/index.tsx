'use client';

import { useFBO } from '@react-three/drei';
import { Canvas, extend, ThreeElement, useFrame, useThree } from '@react-three/fiber';
import { AnimatePresence } from 'motion/react';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { VideoControls } from '../ui/video-controls';
import { VideoPlayer, VideoPlayerHandle } from '../video-player';

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
                uMaskResolution: { value: new THREE.Vector2(1, 1) },
                uOutlineThickness: { value: 2.0 },
                uEdgeThreshold: { value: 0.5 },
                uLineInnerColor: { value: new THREE.Color(0xdbc6ec) },
                uLineOuterColor: { value: new THREE.Color(0xA020F0) },
                uMaskOverlayColor: { value: new THREE.Color(0x00ff00) },
                uMaskOverlayOpacity: { value: 0.3 },
                uOpacity: { value: 1.0 },
                uHoveredObject: { value: new THREE.Vector3(0, 0, 0) },
                uSelectedObject: { value: new THREE.Vector3(0, 0, 0) }
            },
            vertexShader: /*glsl*/`
        uniform float uTime;
        varying vec2 vUv;
        
        void main() {
          // Original position and UV
          vec3 pos = position;
          vec2 uvs = uv;
          
           
  
           
           // Breathing/zoom effect
         //   float breathe = 1.0 + sin(uTime * 0.4) * 0.03;
         //   pos *= breathe;
           
      
            vUv = uvs;
      
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
            fragmentShader: /*glsl*/`
        uniform sampler2D uVideoTexture;
        uniform sampler2D uMaskTexture;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uVideoResolution;
        uniform vec2 uMaskResolution;
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
          
          // Calculate texel size based on MASK resolution (for edge detection)
          vec2 maskTexelSize = 1.0 / uMaskResolution;
          
          // Edge detection using Sobel filter
          float gx = 0.0; // Horizontal gradient
          float gy = 0.0; // Vertical gradient
          
          // 3x3 convolution with Sobel kernels
          for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
              vec2 offset = vec2(float(x), float(y)) * maskTexelSize * uOutlineThickness;
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
          
          // Normalize edge score
          float maxSobelOutput = sqrt(32.0);
          edgeScore = clamp(edgeScore / maxSobelOutput, 0.0, 1.0);
          
          // Check if current pixel matches hovered or selected object
          vec3 currentColor = centerMaskColor.rgb;
          bool isHovered = uHoveredObject.x >= 0.0 && distance(currentColor, uHoveredObject) < 0.05;
          bool isSelected = uSelectedObject.x >= 0.0 && distance(currentColor, uSelectedObject) < 0.05;
          
          // Only show outline for hovered or selected objects
        //   bool showOutline = isHovered || isSelected;
          bool showOutline = true;
          
          // Calculate outline strength (how much outline to show)
          float outlineStrength = smoothstep(0.0, uEdgeThreshold, edgeScore);
          
          // Use simple single color for outline (inner color for now)
          vec3 outlineColor = uLineInnerColor;
          
          // Calculate outline opacity based on edge strength and whether object should show outline
          float outlineOpacity = showOutline ? outlineStrength : 0.0;

          // Mix video color with outline color
          vec3 finalColor = mix(videoColor.rgb, outlineColor, outlineOpacity);

        //   vec3 finalColor = videoColor.rgb;
          
          // Apply mask overlay to non-black mask areas
          float maskPresence = length(centerMaskColor.rgb);
          if (maskPresence > 0.1 && isSelected) {
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

interface OutlineSettings {
    thickness: number;
    edgeThreshold: number;
    innerColor: string;
    outerColor: string;
    maskOverlayColor: string;
    maskOverlayOpacity: number;
}

interface VideoMeshProps {
    mainVideoElement: HTMLVideoElement | null;
    maskVideoElement: HTMLVideoElement | null;
    onMaskHover?: (colorInfo: ColorInfo, x: number, y: number) => void;
    onMaskClick?: (colorInfo: ColorInfo, x: number, y: number) => void;
    outlineSettings: OutlineSettings;
    hoveredObject: number | null;
    selectedObject: number | null;
}

interface VideoMeshHandle {
    handleMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
    handleMouseClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const VideoMesh = React.memo(React.forwardRef<VideoMeshHandle, VideoMeshProps>(function VideoMesh({
    mainVideoElement,
    maskVideoElement,
    onMaskHover,
    onMaskClick,
    outlineSettings,
    hoveredObject,
    selectedObject
}, ref) {
    const materialRef = useRef<VideoShaderMaterial>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const { gl, camera, size } = useThree();

    // Create textures from video elements
    const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
    const [maskTexture, setMaskTexture] = useState<THREE.VideoTexture | null>(null);

    // Create textures when video elements are available
    useEffect(() => {
        if (mainVideoElement) {
            console.log('Main video properties:', {
                width: mainVideoElement.videoWidth,
                height: mainVideoElement.videoHeight,
                aspectRatio: mainVideoElement.videoWidth / mainVideoElement.videoHeight,
                duration: mainVideoElement.duration,
                readyState: mainVideoElement.readyState,
                currentSrc: mainVideoElement.currentSrc,
                networkState: mainVideoElement.networkState,
                error: mainVideoElement.error
            });

            try {
                const texture = new THREE.VideoTexture(mainVideoElement);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.format = THREE.RGBFormat;
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;

                // Force texture update
                texture.needsUpdate = true;

                setVideoTexture(texture);
                console.log('✅ Main video texture created successfully');
            } catch (error) {
                console.error('❌ Failed to create main video texture:', error);
            }
        }
    }, [mainVideoElement]);

    useEffect(() => {
        if (maskVideoElement) {
            console.log('Mask video properties:', {
                width: maskVideoElement.videoWidth,
                height: maskVideoElement.videoHeight,
                aspectRatio: maskVideoElement.videoWidth / maskVideoElement.videoHeight,
                duration: maskVideoElement.duration,
                readyState: maskVideoElement.readyState,
                currentSrc: maskVideoElement.currentSrc,
                networkState: maskVideoElement.networkState,
                error: maskVideoElement.error
            });

            // Check if resolutions match
            if (mainVideoElement && maskVideoElement) {
                const mainAspect = mainVideoElement.videoWidth / mainVideoElement.videoHeight;
                const maskAspect = maskVideoElement.videoWidth / maskVideoElement.videoHeight;
                const aspectDiff = Math.abs(mainAspect - maskAspect);

                console.log('Video comparison:', {
                    mainResolution: `${mainVideoElement.videoWidth}x${mainVideoElement.videoHeight}`,
                    maskResolution: `${maskVideoElement.videoWidth}x${maskVideoElement.videoHeight}`,
                    mainAspect,
                    maskAspect,
                    aspectDiff,
                    resolutionMatch: aspectDiff < 0.01
                });

                if (aspectDiff > 0.01) {
                    console.warn('⚠️ Video aspect ratios don\'t match! This may cause alignment issues.');
                }
            }

            try {
                const texture = new THREE.VideoTexture(maskVideoElement);
                // Use NearestFilter to preserve EXACT colors for mask picking
                texture.minFilter = THREE.NearestFilter;
                texture.magFilter = THREE.NearestFilter;
                texture.format = THREE.RGBFormat;
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;

                // Force texture update
                texture.needsUpdate = true;

                setMaskTexture(texture);
                console.log('✅ Mask video texture created successfully with NearestFilter for exact colors');
            } catch (error) {
                console.error('❌ Failed to create mask video texture:', error);
            }
        }
    }, [maskVideoElement, mainVideoElement]);

    // GPU picking setup - NearestFilter for exact color preservation
    const pickingFBO = useFBO(size.width, size.height, {
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        generateMipmaps: false,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter
    });
    const pickingScene = useRef<THREE.Scene>(null);
    const pickingMesh = useRef<THREE.Mesh>(null);

    // Calculate video aspect ratio and plane size
    const videoAspectRatio = useMemo(() => {
        if (mainVideoElement) {
            return mainVideoElement.videoWidth / mainVideoElement.videoHeight;
        }
        return 16 / 9; // Default aspect ratio
    }, [mainVideoElement]);

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
        }
    }, [camera, size.width, size.height]);

    // Create plane geometry with correct aspect ratio
    const planeGeometry = useMemo(() => {
        const containerAspect = size.width / size.height;
        const cameraHeight = 2;
        const cameraWidth = cameraHeight * containerAspect;

        const maxWidth = cameraWidth;
        const maxHeight = cameraHeight;

        let planeWidth, planeHeight;

        if (videoAspectRatio > containerAspect) {
            planeWidth = maxWidth;
            planeHeight = planeWidth / videoAspectRatio;
        } else {
            planeHeight = maxHeight;
            planeWidth = planeHeight * videoAspectRatio;
        }

        return new THREE.PlaneGeometry(planeWidth, planeHeight);
    }, [videoAspectRatio, size.width, size.height]);

    // Set up picking render target and scene
    useEffect(() => {
        if (!pickingScene.current) {
            pickingScene.current = new THREE.Scene();

            const geometry = planeGeometry.clone();
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uMaskTexture: { value: null },
                    uResolution: { value: new THREE.Vector2(1, 1) },
                    uMaskResolution: { value: new THREE.Vector2(1, 1) }
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
                    uniform vec2 uMaskResolution;
                    
                    varying vec2 vUv;
                    
                    void main() {
                        vec4 maskColor = texture2D(uMaskTexture, vUv);
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
        if (!pickingScene.current || !pickingMesh.current || !maskTexture) {
            return;
        }

        if (x < 0 || x >= pickingFBO.width || y < 0 || y >= pickingFBO.height) {
            return;
        }

        // Update picking material uniforms
        const pickingMaterial = pickingMesh.current.material as THREE.ShaderMaterial;
        if (pickingMaterial.uniforms) {
            pickingMaterial.uniforms.uMaskTexture.value = maskTexture;
            pickingMaterial.uniforms.uResolution.value.set(size.width, size.height);
            pickingMaterial.uniforms.uMaskResolution.value.set(
                maskVideoElement?.videoWidth || 1920,
                maskVideoElement?.videoHeight || 1080
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
        const flippedY = pickingFBO.height - y - 1;

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
            rNorm: pixelBuffer[0] / 255,
            gNorm: pixelBuffer[1] / 255,
            bNorm: pixelBuffer[2] / 255,
            aNorm: pixelBuffer[3] / 255,
            hex: `#${pixelBuffer[0].toString(16).padStart(2, '0')}${pixelBuffer[1].toString(16).padStart(2, '0')}${pixelBuffer[2].toString(16).padStart(2, '0')}`,
            objectId: (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2]
        };

        console.log('GPU Picking - Exact color detected:', {
            position: { x, y: flippedY },
            exact_rgb: [pixelBuffer[0], pixelBuffer[1], pixelBuffer[2]],
            exact_hex: colorInfo.hex,
            exact_objectId: colorInfo.objectId
        });

        return colorInfo;
    }, [gl, camera, maskTexture, size.width, size.height, pickingFBO, maskVideoElement]);

    // Mouse event handlers
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

    // Expose handlers via ref
    useImperativeHandle(ref, () => ({
        handleMouseMove,
        handleMouseClick
    }), [handleMouseMove, handleMouseClick]);

    // Update material uniforms
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    useEffect(() => {
        if (materialRef.current && videoTexture && maskTexture) {
            materialRef.current.uniforms.uVideoTexture.value = videoTexture;
            materialRef.current.uniforms.uMaskTexture.value = maskTexture;

            if (mainVideoElement) {
                materialRef.current.uniforms.uVideoResolution.value.set(
                    mainVideoElement.videoWidth || 1920,
                    mainVideoElement.videoHeight || 1080
                );
            }

            if (maskVideoElement) {
                materialRef.current.uniforms.uMaskResolution.value.set(
                    maskVideoElement.videoWidth || 1920,
                    maskVideoElement.videoHeight || 1080
                );
            }
        }
    }, [videoTexture, maskTexture, mainVideoElement, maskVideoElement]);

    // Update outline parameters
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uOutlineThickness.value = outlineSettings.thickness;
            materialRef.current.uniforms.uEdgeThreshold.value = outlineSettings.edgeThreshold;
            materialRef.current.uniforms.uLineInnerColor.value = new THREE.Color(outlineSettings.innerColor);
            materialRef.current.uniforms.uLineOuterColor.value = new THREE.Color(outlineSettings.outerColor);
            materialRef.current.uniforms.uMaskOverlayColor.value = new THREE.Color(outlineSettings.maskOverlayColor);
            materialRef.current.uniforms.uMaskOverlayOpacity.value = outlineSettings.maskOverlayOpacity;

            // Convert object ID back to normalized RGB color
            if (hoveredObject !== null) {
                const r = ((hoveredObject >> 16) & 0xFF) / 255.0;
                const g = ((hoveredObject >> 8) & 0xFF) / 255.0;
                const b = (hoveredObject & 0xFF) / 255.0;
                materialRef.current.uniforms.uHoveredObject.value = new THREE.Vector3(r, g, b);
                console.log('Setting hovered object color:', {
                    objectId: hoveredObject,
                    exact_rgb: [((hoveredObject >> 16) & 0xFF), ((hoveredObject >> 8) & 0xFF), (hoveredObject & 0xFF)],
                    normalized_rgb: [r, g, b],
                    hex: `#${((hoveredObject >> 16) & 0xFF).toString(16).padStart(2, '0')}${((hoveredObject >> 8) & 0xFF).toString(16).padStart(2, '0')}${(hoveredObject & 0xFF).toString(16).padStart(2, '0')}`
                });
            } else {
                materialRef.current.uniforms.uHoveredObject.value = new THREE.Vector3(-1, -1, -1);
            }

            if (selectedObject !== null) {
                const r = ((selectedObject >> 16) & 0xFF) / 255.0;
                const g = ((selectedObject >> 8) & 0xFF) / 255.0;
                const b = (selectedObject & 0xFF) / 255.0;
                materialRef.current.uniforms.uSelectedObject.value = new THREE.Vector3(r, g, b);
                console.log('Setting selected object color:', {
                    objectId: selectedObject,
                    exact_rgb: [((selectedObject >> 16) & 0xFF), ((selectedObject >> 8) & 0xFF), (selectedObject & 0xFF)],
                    normalized_rgb: [r, g, b],
                    hex: `#${((selectedObject >> 16) & 0xFF).toString(16).padStart(2, '0')}${((selectedObject >> 8) & 0xFF).toString(16).padStart(2, '0')}${(selectedObject & 0xFF).toString(16).padStart(2, '0')}`
                });
            } else {
                materialRef.current.uniforms.uSelectedObject.value = new THREE.Vector3(-1, -1, -1);
            }
        }
    }, [outlineSettings, hoveredObject, selectedObject]);

    // Update resolution uniform
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
        }
    }, [size.width, size.height]);

    return (
        <group>
            <mesh ref={meshRef} geometry={planeGeometry}>
                <videoShaderMaterial
                    ref={materialRef}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}));

// Camera breathing effect component
const CameraBreathingEffect = () => {
    const { camera } = useThree();

    useFrame((state) => {
        if (camera && 'zoom' in camera) {
            // Breathing effect: subtle zoom in/out
            const baseZoom = 1.0;
            const breatheAmount = 0.14; // How much to zoom in/out
            const breatheSpeed = 1; // How fast to breathe

            const breathe = baseZoom + breatheAmount * 0.5 * (1 + Math.sin(state.clock.elapsedTime * breatheSpeed));
            (camera as THREE.OrthographicCamera).zoom = breathe;
            camera.updateProjectionMatrix();
        }
    });

    return null;
};

// Main component interface
export interface GpuPickingVideoHandle {
    play: () => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getMainVideoElement: () => HTMLVideoElement | null;
    getMaskVideoElement: () => HTMLVideoElement | null;
}

interface GpuPickingVideoProps {
    videoSrc: string;
    maskSrc: string;
    className?: string;
    onMaskHover?: (colorInfo: ColorInfo, x: number, y: number) => void;
    onMaskClick?: (colorInfo: ColorInfo, x: number, y: number) => void;
    outlineSettings?: Partial<OutlineSettings>;
    onEnded?: () => void;
    loop?: boolean;
}

export const GpuPickingVideo = React.forwardRef<GpuPickingVideoHandle, GpuPickingVideoProps>(
    function GpuPickingVideo({
        videoSrc,
        maskSrc,
        className = '',
        onMaskHover,
        onMaskClick,
        outlineSettings: outlineSettingsProp = {},
        onEnded,
        loop = true
    }, ref) {
        const mainVideoRef = useRef<VideoPlayerHandle>(null);
        const maskVideoRef = useRef<VideoPlayerHandle>(null);
        const videoMeshRef = useRef<VideoMeshHandle>(null);

        const [mainVideoElement, setMainVideoElement] = useState<HTMLVideoElement | null>(null);
        const [maskVideoElement, setMaskVideoElement] = useState<HTMLVideoElement | null>(null);
        const [aspectRatio, setAspectRatio] = useState(16 / 9);
        const [isVideoLoaded, setIsVideoLoaded] = useState(false);
        const [isMaskVideoLoaded, setIsMaskVideoLoaded] = useState(false);
        const [isPlaying, setIsPlaying] = useState(false);
        const [error, setError] = useState<string | null>(null);
        // --- Video Player State ---
        const [volume, setVolume] = useState(1);
        const [progress, setProgress] = useState(0);
        const [isMuted, setIsMuted] = useState(true);
        const [playbackSpeed, setPlaybackSpeed] = useState(1);
        const [currentTime, setCurrentTime] = useState(0);
        const [duration, setDuration] = useState(0);
        // Controls visibility
        const [showControls, setShowControls] = useState(true);

        // Add this useEffect to reset state when the base video changes
        useEffect(() => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
            setDuration(0);
        }, [videoSrc]);




        // State for mask interaction
        const [hoveredObject, setHoveredObject] = useState<number | null>(null);
        const [selectedObject, setSelectedObject] = useState<number | null>(null);
        const [maskInfo, setMaskInfo] = useState<{
            colorInfo: ColorInfo;
            x: number;
            y: number;
        } | null>(null);

        // Merge outline settings with defaults
        const outlineSettings: OutlineSettings = {
            thickness: 2.0,
            edgeThreshold: 0.5,
            innerColor: '#ff0000',
            outerColor: '#A020F0',
            maskOverlayColor: '#00ff00',
            maskOverlayOpacity: 0.3,
            ...outlineSettingsProp
        };






        // // Check if both videos are ready
        // useEffect(() => {
        //     const checkReadiness = () => {
        //         const mainReady = mainVideoElement && mainVideoElement.readyState >= 3;
        //         const maskReady = maskVideoElement && maskVideoElement.readyState >= 3;
        //         setVideosReady(Boolean(mainReady && maskReady));
        //     };

        //     checkReadiness();
        //     const interval = setInterval(checkReadiness, 100);
        //     return () => clearInterval(interval);
        // }, [mainVideoElement, maskVideoElement]);

        const handleLoadedMetadata = useCallback((videoElement: HTMLVideoElement) => {

            setMainVideoElement(videoElement);
            const { videoWidth, videoHeight, duration } = videoElement;
            if (videoWidth && videoHeight) {
                setAspectRatio(videoWidth / videoHeight);

                setIsVideoLoaded(true);
                setDuration(duration);
            }
        }, []);

        const handleMaskLoadedMetadata = useCallback((videoElement: HTMLVideoElement) => {
            setMaskVideoElement(videoElement);
            setIsMaskVideoLoaded(true);
        }, []);



        // Handle mask interaction
        const handleMaskHover = useCallback((colorInfo: ColorInfo, x: number, y: number) => {
            setMaskInfo({ colorInfo, x, y });
            setHoveredObject(colorInfo.objectId);
            onMaskHover?.(colorInfo, x, y);
        }, [onMaskHover]);

        const handleMaskClick = useCallback((colorInfo: ColorInfo, x: number, y: number) => {
            if (selectedObject === colorInfo.objectId) {
                setSelectedObject(null);
            } else {
                setSelectedObject(colorInfo.objectId);
            }
            onMaskClick?.(colorInfo, x, y);
        }, [selectedObject, onMaskClick]);

        // Canvas event handlers
        const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
            videoMeshRef.current?.handleMouseMove(event);
        }, []);

        const handleCanvasMouseClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
            videoMeshRef.current?.handleMouseClick(event);
        }, []);



        const play = useCallback(async () => {
            if (mainVideoRef.current && maskVideoRef.current) {
                await Promise.all([
                    mainVideoRef.current.play(),
                    maskVideoRef.current.play()
                ]);
                setIsPlaying(true);
            }
        }, []);

        // Autoplay when both videos are ready
        useEffect(() => {
            if (isVideoLoaded && isMaskVideoLoaded && !isPlaying) {
                play();
            }
        }, [isVideoLoaded, isMaskVideoLoaded]);

        const pause = useCallback(() => {

            if (mainVideoRef.current && maskVideoRef.current) {
                mainVideoRef.current.pause();
                maskVideoRef.current.pause();
                setIsPlaying(false);
            }
        }, []);

        const togglePlayPause = useCallback(() => {
            console.log('togglePlayPause', isPlaying);
            if (isPlaying) {
                pause();
                setIsPlaying(false)
            } else {
                play();
                setIsPlaying(true)
            }
        }, [isPlaying, play, pause]);

        const seek = useCallback((time: number) => {
            if (mainVideoRef.current && maskVideoRef.current) {
                const t = (time / 100) * duration;

                if (isFinite(t)) {
                    mainVideoRef.current.seek(t);
                    maskVideoRef.current.seek(t);
                    setProgress(time); // Keep progress as percentage
                }
            }
        }, [duration]);

        const getCurrentTime = useCallback(() => {

            return mainVideoRef.current?.getCurrentTime() ?? 0;
        }, []);

        const getDuration = useCallback(() => {
            return mainVideoRef.current?.getDuration() ?? 0;
        }, []);


        const handleVolumeChange = useCallback((value: number) => {
            const newVolume = value / 100;
            // Note: GpuPickingVideo doesn't expose volume controls yet
            // This would need to be implemented in the GpuPickingVideo component
            setVolume(newVolume);

            if (newVolume > 0 && isMuted) {
                setIsMuted(false);
            } else if (newVolume === 0) {
                setIsMuted(true);
            }
        }, [isMuted]);

        const handleMuteToggle = useCallback(() => {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);

            if (!nextMuted && volume === 0) {
                setVolume(1);
            }
        }, [isMuted, volume]);

        const handleSpeedChange = useCallback((speed: number) => {
            // Note: GpuPickingVideo doesn't expose speed controls yet
            // This would need to be implemented in the GpuPickingVideo component
            setPlaybackSpeed(Math.abs(speed));
        }, []);

        // Controls visibility management - following interactive-video pattern
        const handleShowControls = useCallback((show: boolean) => {
            setShowControls(show);
        }, []);

        const handleTimeUpdate = useCallback(
            async (currentTime: number, duration: number) => {
                const currentProgress = (currentTime / duration) * 100;
                setProgress(isFinite(currentProgress) ? currentProgress : 0);
                setCurrentTime(currentTime);
            },
            [isVideoLoaded, isMaskVideoLoaded]
        );




        // Expose API via ref
        useImperativeHandle(ref, () => ({
            play,
            pause,
            seek,
            getCurrentTime,
            getDuration,
            getMainVideoElement: () => mainVideoElement,
            getMaskVideoElement: () => maskVideoElement
        }), [play, pause, seek, getCurrentTime, getDuration, mainVideoElement, maskVideoElement]);



        const handleOnEnded = useCallback(() => {
            if (loop) {
                seek(0);
                play();
            } else {
                onEnded?.();
            }
        }, [loop]);

        return (
            <div className={`relative w-full h-full isolate ${className} `}>
                {/* Hidden video players */}
                <VideoPlayer
                    ref={mainVideoRef}
                    src={videoSrc}

                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    muted
                    playsInline
                    className="hidden"
                    onEnded={handleOnEnded}

                />
                <VideoPlayer
                    ref={maskVideoRef}
                    src={maskSrc}
                    onLoadedMetadata={handleMaskLoadedMetadata}
                    muted
                    playsInline
                    className="hidden"
                />

                <AnimatePresence>
                    {showControls && (
                        <VideoControls
                            isPlaying={isPlaying}
                            volume={volume}
                            progress={progress}
                            isMuted={isMuted}
                            playbackSpeed={playbackSpeed}
                            currentTime={currentTime}
                            duration={duration}
                            onPlayPause={togglePlayPause}
                            onVolumeChange={handleVolumeChange}
                            onSeek={seek}
                            onMuteToggle={handleMuteToggle}
                            onSpeedChange={handleSpeedChange}
                        />
                    )}
                </AnimatePresence>


                {/* 3D Canvas */}
                <div
                    className="w-full h-full"
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
                        <CameraBreathingEffect />
                        <VideoMesh
                            ref={videoMeshRef}
                            mainVideoElement={mainVideoElement}
                            maskVideoElement={maskVideoElement}
                            onMaskHover={handleMaskHover}
                            onMaskClick={handleMaskClick}
                            outlineSettings={outlineSettings}
                            hoveredObject={hoveredObject}
                            selectedObject={selectedObject}
                        />
                    </Canvas>
                </div>

                {/* Status Display */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
                    {error ? (
                        <div className="text-red-400">❌ {error}</div>
                    ) : isVideoLoaded && isMaskVideoLoaded ? (
                        <div className="text-green-400">✅ Videos Ready</div>
                    ) : (
                        <div className="text-yellow-400">⏳ Loading...</div>
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
                                style={{
                                    backgroundColor: `rgb(${maskInfo.colorInfo.r}, ${maskInfo.colorInfo.g}, ${maskInfo.colorInfo.b})`
                                }}
                            />
                        </div>
                        <div className="mt-2 space-y-1">
                            <div className={`text-xs px-2 py-1 rounded ${hoveredObject === maskInfo.colorInfo.objectId
                                ? 'bg-yellow-600/50 text-yellow-200'
                                : 'bg-gray-600/50 text-gray-300'
                                }`}>
                                {hoveredObject === maskInfo.colorInfo.objectId ? '🔍 Hovered' : 'Hover to outline'}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded ${selectedObject === maskInfo.colorInfo.objectId
                                ? 'bg-blue-600/50 text-blue-200'
                                : 'bg-gray-600/50 text-gray-300'
                                }`}>
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
                    <div>Ready: {isVideoLoaded && isMaskVideoLoaded ? 'Yes' : 'No'}</div>
                    <div>GPU Picking: {isVideoLoaded && isMaskVideoLoaded ? 'Active' : 'Inactive'}</div>

                    {/* Video Properties */}
                    {mainVideoElement && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                            <div className="text-yellow-400">Main Video:</div>
                            <div>Resolution: {mainVideoElement.videoWidth}x{mainVideoElement.videoHeight}</div>
                            <div>Aspect: {(mainVideoElement.videoWidth / mainVideoElement.videoHeight).toFixed(3)}</div>
                            <div>Duration: {mainVideoElement.duration?.toFixed(2)}s</div>
                        </div>
                    )}

                    {maskVideoElement && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                            <div className="text-blue-400">Mask Video:</div>
                            <div>Resolution: {maskVideoElement.videoWidth}x{maskVideoElement.videoHeight}</div>
                            <div>Aspect: {(maskVideoElement.videoWidth / maskVideoElement.videoHeight).toFixed(3)}</div>
                            <div>Duration: {maskVideoElement.duration?.toFixed(2)}s</div>

                            {/* Show resolution match warning */}
                            {mainVideoElement && maskVideoElement && (
                                <div className={`text-xs mt-1 px-2 py-1 rounded ${Math.abs((mainVideoElement.videoWidth / mainVideoElement.videoHeight) -
                                    (maskVideoElement.videoWidth / maskVideoElement.videoHeight)) < 0.01
                                    ? 'bg-green-600/50 text-green-200'
                                    : 'bg-red-600/50 text-red-200'
                                    }`}>
                                    {Math.abs((mainVideoElement.videoWidth / mainVideoElement.videoHeight) -
                                        (maskVideoElement.videoWidth / maskVideoElement.videoHeight)) < 0.01
                                        ? '✅ Aspect ratios match'
                                        : '⚠️ Aspect ratios differ'
                                    }
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-gray-600">
                        <div>Hovered: {hoveredObject !== null ? `#${hoveredObject.toString(16).padStart(6, '0')}` : 'None'}</div>
                        <div>Selected: {selectedObject !== null ? `#${selectedObject.toString(16).padStart(6, '0')}` : 'None'}</div>
                    </div>
                </div>
            </div>
        );
    }
);


export default GpuPickingVideo; 