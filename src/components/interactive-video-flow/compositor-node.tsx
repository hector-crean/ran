"use client";

import { Handle, Position, NodeProps, useNodes, useEdges, Node } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { VideoSourceData } from './video-source-node';
import { VideoMaskCanvas, VideoMaskCanvasHandle } from '@/components/webgpu-canvas';
import { VideoPlayer, VideoPlayerHandle } from '@/components/video-player';
import { VideoControls } from '@/components/ui/video-controls';
import { AnimatePresence } from 'framer-motion';
import { ColorProbeOverlay, ColorProbeOverlayHandle } from '@/components/color-probe-overlay';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ObjectMappingData } from './object-mapping-node';



const KERNEL_SIZE = 15;
const KERNEL_PIXELS = KERNEL_SIZE * KERNEL_SIZE;

export const CompositorNode = ({ id, isConnectable }: NodeProps<Node<VideoSourceData>>) => {
    const nodes = useNodes();
    const edges = useEdges();
    const videoMaskCanvasRef = useRef<VideoMaskCanvasHandle>(null);
    const videoPlayerRef = useRef<VideoPlayerHandle>(null);
    const maskVideoPlayerRef = useRef<VideoPlayerHandle>(null);
    const colorProbeOverlayRef = useRef<ColorProbeOverlayHandle>(null);

    // --- Component State ---
    const [aspectRatio, setAspectRatio] = useState(16 / 9);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [isMaskVideoLoaded, setIsMaskVideoLoaded] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [sampleLayer, setSampleLayer] = useState<'output' | 'base' | 'mask'>('output');

    const SHOW_CONTROLS_OVERIDE = false;
    const handleShowControls = useCallback((show: boolean) => {
        if(SHOW_CONTROLS_OVERIDE) {
            setShowControls(show);
        } else {
            setShowControls(false);
        }
    }, []);

    // --- Video Player State ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    // Ping-pong feature removed; videos loop forward only

    // --- Refs for throttling and mouse position ---
    const mousePositionRef = useRef<{ normX: number; normY: number; pixelX: number; pixelY: number; } | null>(null);
    const lastReadTimestampRef = useRef(0);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastPollingPositionRef = useRef<{ normX: number; normY: number; pixelX: number; pixelY: number; } | null>(null);

    const { baseSrc, maskSrc, objectMappings } = useMemo(() => {
        const connectedEdges = edges.filter((edge) => edge.target === id);
        
        const getSourceVideo = (handleId: string) => {
            const edge = connectedEdges.find((edge) => edge.targetHandle === handleId);
            if (!edge) return undefined;
            const sourceNode = nodes.find((node) => node.id === edge.source);
            return (sourceNode?.data as VideoSourceData)?.videoSrc;
        }

        const getObjectMappings = () => {
            const edge = connectedEdges.find((edge) => edge.targetHandle === 'object-mappings');
            if (!edge) return null;
            const sourceNode = nodes.find((node) => node.id === edge.source);
            return (sourceNode?.data as ObjectMappingData) || null;
        }

        return {
            baseSrc: getSourceVideo('video-base'),
            maskSrc: getSourceVideo('video-mask'),
            objectMappings: getObjectMappings(),
        };

    }, [id, nodes, edges]);

    // Add this useEffect to reset state when the base video changes
    useEffect(() => {
        setIsVideoLoaded(false);
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
    }, [baseSrc]);

    // Add this useEffect to reset state for the mask video
    useEffect(() => {
        setIsMaskVideoLoaded(false);
    }, [maskSrc]);

    // --- Non-blocking color probe reading ---
    const processColorProbe = useCallback(async (position: { normX: number; normY: number; pixelX: number; pixelY: number; }) => {
        if (!videoMaskCanvasRef.current) return;

        try {
            const kernelResult = await videoMaskCanvasRef.current.readKernelAt(position.normX, position.normY);
            if (kernelResult.length === 0) return;

            const centerIndex = Math.floor(KERNEL_PIXELS / 2);
            const newCenterColor = kernelResult[centerIndex];
            const newPosition = {
                x: Math.floor(position.pixelX),
                y: Math.floor(position.pixelY),
            };

            colorProbeOverlayRef.current?.updateProbe(kernelResult, newCenterColor, newPosition);
        } catch (error) {
            // Silently ignore errors
        }
    }, []);

    const processMousePosition = useCallback(async () => {
        if (!mousePositionRef.current) return;
        const position = mousePositionRef.current;
        mousePositionRef.current = null; // Consume
        lastPollingPositionRef.current = position;
        await processColorProbe(position);
    }, [processColorProbe]);
    
    // --- Polling for video playback ---
    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) return;
        pollingIntervalRef.current = setInterval(() => {
            if (!lastPollingPositionRef.current || !isVideoLoaded || !isMaskVideoLoaded) return;
            const now = performance.now();
            if (now - lastReadTimestampRef.current > 500) { // 500ms polling throttle
                lastReadTimestampRef.current = now;
                processColorProbe(lastPollingPositionRef.current);
            }
        }, 100);
    }, [isVideoLoaded, isMaskVideoLoaded, processColorProbe]);

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isPlaying && isVideoLoaded && isMaskVideoLoaded && lastPollingPositionRef.current) {
            startPolling();
        } else {
            stopPolling();
        }
        return stopPolling;
    }, [isPlaying, isVideoLoaded, isMaskVideoLoaded, startPolling, stopPolling]);

    // --- Mouse Handlers ---
    const handleMouseMove = useCallback((normX: number, normY: number, pixelX: number, pixelY: number) => {
        mousePositionRef.current = { normX, normY, pixelX, pixelY };
    }, []);

    const handleLoadedMetadata = useCallback((videoElement: HTMLVideoElement) => {
        const { videoWidth, videoHeight, duration } = videoElement;
        if (videoWidth && videoHeight) {
          setAspectRatio(videoWidth / videoHeight);
          videoMaskCanvasRef.current?.updateVideoTexture(videoWidth, videoHeight);
          setIsVideoLoaded(true);
          setDuration(duration);
        }
      }, []);
    
      const handleMaskLoadedMetadata = useCallback(() => {
        setIsMaskVideoLoaded(true);
      }, []);

      const handleTimeUpdate = useCallback(async (currentTime: number, duration: number) => {
        const currentProgress = (currentTime / duration) * 100;
        setProgress(isFinite(currentProgress) ? currentProgress : 0);
        setCurrentTime(currentTime);

        // Conventional looping handled by HTML video 'loop' attribute; no reverse playback

        if (lastPollingPositionRef.current && isVideoLoaded && isMaskVideoLoaded) {
            const now = performance.now();
            if (now - lastReadTimestampRef.current > 100) { // 100ms throttle for time updates
                lastReadTimestampRef.current = now;
                processColorProbe(lastPollingPositionRef.current);
            }
        }
      }, [isVideoLoaded, isMaskVideoLoaded, processColorProbe]);

    // --- Video Control Handlers ---
    const handlePlayPause = async () => {

        if(SHOW_CONTROLS_OVERIDE) {
            if (isPlaying) {
                videoPlayerRef.current?.pause();
                maskVideoPlayerRef.current?.pause();
                } else {
                // Ensure correct playback rate when resuming
                videoPlayerRef.current?.setPlaybackRate(Math.abs(playbackSpeed));
                maskVideoPlayerRef.current?.setPlaybackRate(Math.abs(playbackSpeed));
                videoPlayerRef.current?.play();
                maskVideoPlayerRef.current?.play();
                }
                setIsPlaying(!isPlaying);

        }

      

        const kernelResult = await videoMaskCanvasRef.current?.readKernelAt(mousePositionRef.current?.normX || 0.5, mousePositionRef.current?.normY || 0.5);
        if (kernelResult && kernelResult.length > 0) {
            const centerIndex = Math.floor(KERNEL_PIXELS / 2);
            const newCenterColor = kernelResult[centerIndex];
            
            // Use object mappings to identify the clicked object
            if (objectMappings?.findObjectByColor) {
                const matchedObject = objectMappings.findObjectByColor(newCenterColor);
                if (matchedObject) {
                    toast.success(`Clicked on: ${matchedObject.name}`, {
                        description: `RGB(${newCenterColor.r}, ${newCenterColor.g}, ${newCenterColor.b})`,
                    });
                } else {
                    toast.info(`Unknown object`, {
                        description: `RGB(${newCenterColor.r}, ${newCenterColor.g}, ${newCenterColor.b})`,
                    });
                }
            } else {
                toast.success(`Color: ${newCenterColor.r}, ${newCenterColor.g}, ${newCenterColor.b}`);
            }
        }


    };

    const handleSeek = (value: number) => {
        if (videoPlayerRef.current && maskVideoPlayerRef.current && duration) {
        const time = (value / 100) * duration;
        if (isFinite(time)) {
            videoPlayerRef.current.seek(time);
            maskVideoPlayerRef.current.seek(time);
            setProgress(value);
        }
        }
    };

    const handleVolumeChange = (value: number) => {
        const newVolume = value / 100;
        videoPlayerRef.current?.setVolume(newVolume);
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
          videoPlayerRef.current?.setMuted(false);
          setIsMuted(false);
        } else if (newVolume === 0) {
          videoPlayerRef.current?.setMuted(true);
          setIsMuted(true);
        }
      };
    
      const handleMuteToggle = () => {
        const nextMuted = !isMuted;
        videoPlayerRef.current?.setMuted(nextMuted);
        setIsMuted(nextMuted);
        if (!nextMuted && volume === 0) {
          videoPlayerRef.current?.setVolume(1);
          setVolume(1);
        }
      };
    
      const handleSpeedChange = (speed: number) => {
        videoPlayerRef.current?.setPlaybackRate(Math.abs(speed));
        maskVideoPlayerRef.current?.setPlaybackRate(Math.abs(speed));
        setPlaybackSpeed(Math.abs(speed));
      };

      const handleViewerMouseMove = () => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        handleShowControls(true);
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);

        const now = performance.now();
        if (mousePositionRef.current && now - lastReadTimestampRef.current > 100) { // 100ms throttle
            lastReadTimestampRef.current = now;
            processMousePosition();
        }
      };

      const handleViewerMouseLeave = () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        setShowControls(false);
      };

    useEffect(() => {
        if(isVideoLoaded && isMaskVideoLoaded){
            // Set initial playback rate
            videoPlayerRef.current?.setPlaybackRate(Math.abs(playbackSpeed));
            videoPlayerRef.current?.play();
            maskVideoPlayerRef.current?.play();
            setIsPlaying(true);
        }
    }, [isVideoLoaded, isMaskVideoLoaded, playbackSpeed])

  return (
    <Card className="w-[1080px]">
       <CardHeader className="p-2 bg-gray-100 rounded-t-lg">
        <CardTitle className="text-sm text-center">Compositor</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex justify-between items-center p-2 border rounded-md mb-2">
            <div className="flex flex-col gap-2">
                <div className='flex items-center h-8 gap-4'>
                    <Handle
                        className='bg-red-500 w-4 h-4'
                        type="target"
                        position={Position.Top}
                        id="video-base"
                        isConnectable={isConnectable}
                    />
                    <Label>Base Video</Label>
                </div>
                <div className='flex items-center h-8 gap-4'>
                    <Handle
                        type="target"
                        position={Position.Bottom}
                        id="video-mask"
                        isConnectable={isConnectable}
                    />
                    <Label>Mask Video</Label>
                </div>
                <div className='flex items-center h-8 gap-4'>
                    <Handle
                        className='bg-blue-500 w-4 h-4'
                        type="target"
                        position={Position.Left}
                        id="object-mappings"
                        isConnectable={isConnectable}
                    />
                    <Label>Object Mappings</Label>
                </div>
            </div>
            <div className="flex items-center space-x-2 p-2">
                <Label>Color Picker Source:</Label>
                <RadioGroup defaultValue="output" onValueChange={(value: 'output' | 'base' | 'mask') => setSampleLayer(value)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="output" id={`r1-${id}`} />
                    <Label htmlFor={`r1-${id}`}>Output</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="base" id={`r2-${id}`} />
                    <Label htmlFor={`r2-${id}`}>Base</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mask" id={`r3-${id}`} />
                    <Label htmlFor={`r3-${id}`}>Mask</Label>
                    </div>
                </RadioGroup>
            </div>
        </div>

        {baseSrc && maskSrc ? (
            <ColorProbeOverlay
                ref={colorProbeOverlayRef}
                kernelSize={KERNEL_SIZE}
                onMouseMove={handleMouseMove}
                className="relative group w-full"
                style={{ aspectRatio: `${aspectRatio}` }}
            >
                <div
                    onMouseMove={handleViewerMouseMove}
                    onMouseLeave={handleViewerMouseLeave}
                    onClick={handlePlayPause}
                    className="w-full h-full isolate"
                >
                    <VideoMaskCanvas
                        ref={videoMaskCanvasRef}
                        videoElement={videoPlayerRef.current?.getVideoElement() || null}
                        maskVideoElement={maskVideoPlayerRef.current?.getVideoElement() || null}
                        isVideoLoaded={isVideoLoaded}
                        isMaskVideoLoaded={isMaskVideoLoaded}
                        onPointerMove={() => {}}
                        className="border-2 border-gray-700 cursor-crosshair block rounded-lg w-full h-full"
                        // sampleLayer={sampleLayer}
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
                                onPlayPause={handlePlayPause}
                                onVolumeChange={handleVolumeChange}
                                onSeek={handleSeek}
                                onMuteToggle={handleMuteToggle}
                                onSpeedChange={handleSpeedChange}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </ColorProbeOverlay>
        ) : (
            <div className='h-48 bg-gray-200 mt-2 rounded flex items-center justify-center p-2 text-xs text-gray-500'>
                <p>Connect a base and mask video source.</p>
            </div>
        )}
         <VideoPlayer
            ref={videoPlayerRef}
            src={baseSrc || ''}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className='hidden'
          />
          <VideoPlayer
            ref={maskVideoPlayerRef}
            src={maskSrc || ''}
            onLoadedMetadata={handleMaskLoadedMetadata}
            onTimeUpdate={() => {}}
            onPlay={() => {}}
            onPause={() => {}}
            muted={true}
            className="hidden"
          />
      </CardContent>
    </Card>
  );
}; 