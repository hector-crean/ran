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
          
          // Normalize edge score
          float maxSobelOutput = sqrt(32.0);
          edgeScore = clamp(edgeScore / maxSobelOutput, 0.0, 1.0);
          
          // Check if current pixel matches hovered or selected object
          vec3 currentColor = centerMaskColor.rgb;
          bool isHovered = uHoveredObject.x >= 0.0 && distance(currentColor, uHoveredObject) < 0.01;
          bool isSelected = uSelectedObject.x >= 0.0 && distance(currentColor, uSelectedObject) < 0.01;
          
          // Only show outline for hovered or selected objects
          bool showOutline = isHovered || isSelected;
          
          // Calculate outline strength (how much outline to show)
          float outlineStrength = smoothstep(0.0, uEdgeThreshold, edgeScore);
          
          // Use simple single color for outline (inner color for now)
          vec3 outlineColor = uLineInnerColor;
          
          // Calculate outline opacity based on edge strength and whether object should show outline
          float outlineOpacity = showOutline ? outlineStrength : 0.0;

          // Mix video color with outline color
          vec3 finalColor = mix(videoColor.rgb, outlineColor, outlineOpacity);
          
          // Apply mask overlay to non-black mask areas
          float maskPresence = length(centerMaskColor.rgb);
          if (maskPresence > 0.01) {
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
            const texture = new THREE.VideoTexture(mainVideoElement);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBFormat;
            setVideoTexture(texture);
        }
    }, [mainVideoElement]);

    useEffect(() => {
        if (maskVideoElement) {
            const texture = new THREE.VideoTexture(maskVideoElement);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBFormat;
            setMaskTexture(texture);
        }
    }, [maskVideoElement]);

    // GPU picking setup
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
            pickingMaterial.uniforms.uVideoResolution.value.set(
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
        }
    }, [videoTexture, maskTexture, mainVideoElement]);

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
            } else {
                materialRef.current.uniforms.uHoveredObject.value = new THREE.Vector3(-1, -1, -1);
            }

            if (selectedObject !== null) {
                const r = ((selectedObject >> 16) & 0xFF) / 255.0;
                const g = ((selectedObject >> 8) & 0xFF) / 255.0;
                const b = (selectedObject & 0xFF) / 255.0;
                materialRef.current.uniforms.uSelectedObject.value = new THREE.Vector3(r, g, b);
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
}

export const GpuPickingVideo = React.forwardRef<GpuPickingVideoHandle, GpuPickingVideoProps>(
    function GpuPickingVideo({
        videoSrc,
        maskSrc,
        className = '',
        onMaskHover,
        onMaskClick,
        outlineSettings: outlineSettingsProp = {},
        onEnded
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
                    onEnded={onEnded}

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