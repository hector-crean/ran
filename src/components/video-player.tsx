"use client";

import { 
  forwardRef, 
  useImperativeHandle, 
  useRef, 
  useEffect,
  useState
} from "react";

export interface VideoPlayerHandle {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoElement: () => HTMLVideoElement | null;
}

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  onLoadedMetadata?: (videoElement: HTMLVideoElement) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  loop?: boolean;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ 
    src, 
    poster,
    onLoadedMetadata, 
    onTimeUpdate, 
    onPlay, 
    onPause, 
    className = "hidden",
    autoPlay = true,
    muted = true,
    playsInline = true,
    loop = false
  }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleLoadedMetadata = () => {
      if (videoRef.current && onLoadedMetadata) {
        onLoadedMetadata(videoRef.current);
      }
    };

    const handleTimeUpdate = () => {
      if (videoRef.current && onTimeUpdate) {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        onTimeUpdate(currentTime, duration);
      }
    };

    const handlePlay = () => {
      if (onPlay) {
        onPlay();
      }
    };

    const handlePause = () => {
      if (onPause) {
        onPause();
      }
    };

    useImperativeHandle(ref, () => ({
      play: async () => {
        if (videoRef.current) {
          await videoRef.current.play();
        }
      },
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      },
      seek: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      setVolume: (volume: number) => {
        if (videoRef.current) {
          videoRef.current.volume = volume;
        }
      },
      setMuted: (muted: boolean) => {
        if (videoRef.current) {
          videoRef.current.muted = muted;
        }
      },
      setPlaybackRate: (rate: number) => {
        if (videoRef.current) {
          videoRef.current.playbackRate = rate;
        }
      },
      getCurrentTime: () => {
        return videoRef.current?.currentTime ?? 0;
      },
      getDuration: () => {
        return videoRef.current?.duration ?? 0;
      },
      getVideoElement: () => videoRef.current,
    }), []);

    // Update src when prop changes
    useEffect(() => {
      if (videoRef.current && src) {
        videoRef.current.src = src;
      }
    }, [src]);

    return (
      <video
        ref={videoRef}
        poster={poster}
        muted={muted}
        autoPlay={autoPlay}
        playsInline={playsInline}
        loop={loop}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className={className}
      >
        Your browser does not support the video tag.
      </video>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer"; 