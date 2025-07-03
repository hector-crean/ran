"use client";

import {
  Handle,
  Position,
  NodeProps,
  useNodes,
  useEdges,
  Node,
} from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import {
  VideoMaskCanvas,
  VideoMaskCanvasHandle,
} from "@/components/webgpu-canvas";
import { VideoPlayer, VideoPlayerHandle } from "@/components/video-player";
import { VideoControls } from "@/components/ui/video-controls";
import { AnimatePresence } from "framer-motion";
import {
  ColorProbeOverlay,
  ColorProbeOverlayHandle,
} from "@/components/color-probe-overlay";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ObjectMapping } from "@/components/interactive-video-flow/object-mapping-node";

const KERNEL_SIZE = 15;
const KERNEL_PIXELS = KERNEL_SIZE * KERNEL_SIZE;

interface InteractiveVideoProps {
  baseSrc: string;
  maskSrc: string;
  objectMappings: Array<ObjectMapping>;
  ar: number
}
export const InteractiveVideo = ({
  baseSrc,
  maskSrc,
  objectMappings,
  ar = 16 / 9,
}: InteractiveVideoProps) => {
  const videoMaskCanvasRef = useRef<VideoMaskCanvasHandle>(null);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  const maskVideoPlayerRef = useRef<VideoPlayerHandle>(null);

  const [aspectRatio, setAspectRatio] = useState(ar);

  // --- Component State ---
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMaskVideoLoaded, setIsMaskVideoLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SHOW_CONTROLS_OVERIDE = false;
  const handleShowControls = useCallback((show: boolean) => {
    if (SHOW_CONTROLS_OVERIDE) {
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
  const mousePositionRef = useRef<{
    normX: number;
    normY: number;
    pixelX: number;
    pixelY: number;
  } | null>(null);
  const lastReadTimestampRef = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollingPositionRef = useRef<{
    normX: number;
    normY: number;
    pixelX: number;
    pixelY: number;
  } | null>(null);

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

  // --- Mouse Handlers ---
  const handleMouseMove = useCallback(
    (normX: number, normY: number, pixelX: number, pixelY: number) => {
      mousePositionRef.current = { normX, normY, pixelX, pixelY };
    },
    []
  );

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

  const handleTimeUpdate = useCallback(
    async (currentTime: number, duration: number) => {
      const currentProgress = (currentTime / duration) * 100;
      setProgress(isFinite(currentProgress) ? currentProgress : 0);
      setCurrentTime(currentTime);
    },
    [isVideoLoaded, isMaskVideoLoaded]
  );

  // --- Video Control Handlers ---
  const handlePlayPause = async () => {
    if (SHOW_CONTROLS_OVERIDE) {
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

    const kernelResult = await videoMaskCanvasRef.current?.readKernelAt(
      mousePositionRef.current?.normX || 0.5,
      mousePositionRef.current?.normY || 0.5
    );
    if (kernelResult && kernelResult.length > 0) {
      const centerIndex = Math.floor(KERNEL_PIXELS / 2);
      const newCenterColor = kernelResult[centerIndex];

      toast.success(
        `Color: ${newCenterColor.r}, ${newCenterColor.g}, ${newCenterColor.b}`
      );
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
    // if (controlsTimeoutRef.current) {
    //     clearTimeout(controlsTimeoutRef.current);
    // }
    // handleShowControls(true);
    // controlsTimeoutRef.current = setTimeout(() => {
    //     setShowControls(false);
    // }, 3000);
    // const now = performance.now();
    // if (mousePositionRef.current && now - lastReadTimestampRef.current > 100) { // 100ms throttle
    //     lastReadTimestampRef.current = now;
    //     processMousePosition();
    // }
  };

  const handleViewerMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(false);
  };

  useEffect(() => {
    if (isVideoLoaded && isMaskVideoLoaded) {
      // Set initial playback rate
      videoPlayerRef.current?.setPlaybackRate(Math.abs(playbackSpeed));
      videoPlayerRef.current?.play();
      maskVideoPlayerRef.current?.play();
      setIsPlaying(true);
    }
  }, [isVideoLoaded, isMaskVideoLoaded, playbackSpeed]);

  return (
    <>
      <div
        onMouseMove={handleViewerMouseMove}
        onMouseLeave={handleViewerMouseLeave}
        onClick={handlePlayPause}
        className="w-full h-full isolate"
      >
        <VideoMaskCanvas
          ref={videoMaskCanvasRef}
          videoElement={videoPlayerRef.current?.getVideoElement() || null}
          maskVideoElement={
            maskVideoPlayerRef.current?.getVideoElement() || null
          }
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
      <VideoPlayer
        ref={videoPlayerRef}
        src={baseSrc || ""}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
      <VideoPlayer
        ref={maskVideoPlayerRef}
        src={maskSrc || ""}
        onLoadedMetadata={handleMaskLoadedMetadata}
        onTimeUpdate={() => {}}
        onPlay={() => {}}
        onPause={() => {}}
        muted={true}
        className="hidden"
      />
    </>
  );
};


export type { InteractiveVideoProps };