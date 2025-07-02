"use client";

import { VideoControls } from "@/components/ui/video-controls";
import { VideoPlayer, VideoPlayerHandle } from "@/components/video-player";
import { useCallback, useEffect, useRef, useState } from "react";

interface VideoSlideProps {
    slide: any;
    url: string;
    poster: string;
    autoplay: boolean;
}

export function VideoSlide({ slide, url, autoplay, poster }: VideoSlideProps) {

    const videoPlayerRef = useRef<VideoPlayerHandle>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const handleLoadedMetadata = (videoElement: HTMLVideoElement) => {
        setDuration(videoElement.duration);
        setIsVideoLoaded(true);
    };

    useEffect(() => {
        setIsVideoLoaded(false);
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
    }, [url]);

    const handleTimeUpdate = useCallback(async (currentTime: number, duration: number) => {
        const currentProgress = (currentTime / duration) * 100;
        setProgress(isFinite(currentProgress) ? currentProgress : 0);
        setCurrentTime(currentTime);
    }, [isVideoLoaded]);

    const handleSeek = (value: number) => {
        if (videoPlayerRef.current && duration) {
            const time = (value / 100) * duration;
            if (isFinite(time)) {
                videoPlayerRef.current.seek(time);
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
        setPlaybackSpeed(Math.abs(speed));
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            {/* Option 1: object-contain - Maintains aspect ratio, fits entirely within container */}

            <VideoPlayer
                ref={videoPlayerRef}
                src={url || ''}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                muted={true}
                className="w-full h-full object-contain"
                poster={poster}
                preload="metadata"
                crossOrigin="anonymous"
                playsInline={true}
            />
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


        </div>
    );
}

export type { VideoSlideProps };

