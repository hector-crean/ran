"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const CustomSlider = ({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn(
        "relative w-full h-1 bg-white/20 rounded-full cursor-pointer group py-2",
        className
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        onChange(Math.min(Math.max(percentage, 0), 100));
      }}
    >
      <div className="relative h-1 w-full bg-white/20 rounded-full">
        <motion.div
          className="absolute top-0 left-0 h-full bg-white rounded-full"
          style={{ width: `${value}%` }}
        />
        <motion.div
          className="absolute w-3 h-3 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${value}% - 6px)` }}
        />
      </div>
    </motion.div>
  );
};

interface VideoControlsProps {
  isPlaying: boolean;
  volume: number;
  progress: number;
  isMuted: boolean;
  playbackSpeed: number;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onVolumeChange: (value: number) => void;
  onSeek: (value: number) => void;
  onMuteToggle: () => void;
  onSpeedChange: (speed: number) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  volume,
  progress,
  isMuted,
  playbackSpeed,
  currentTime,
  duration,
  onPlayPause,
  onVolumeChange,
  onSeek,
  onMuteToggle,
  onSpeedChange,
}) => {
  return (
    <motion.div
      className="absolute bottom-0 mx-auto max-w-xl left-0 right-0 p-4 m-2 bg-[#11111198] backdrop-blur-md rounded-2xl z-30"
      initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      exit={{ y: 20, opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling up to the viewer div
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-white text-sm w-12 text-center">
          {formatTime(currentTime)}
        </span>
        <CustomSlider
          value={progress}
          onChange={onSeek}
          className="flex-1"
        />
        <span className="text-white text-sm w-12 text-center">
          {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              onClick={onPlayPause}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-[#111111d1] hover:text-white"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
          <div className="flex items-center gap-x-1">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={onMuteToggle}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-[#111111d1] hover:text-white"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : volume > 0.5 ? (
                  <Volume2 className="h-5 w-5" />
                ) : volume > 0 ? (
                  <Volume1 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>
            </motion.div>

            <div className="w-24">
              <CustomSlider
                value={isMuted ? 0 : volume * 100}
                onChange={onVolumeChange}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[0.5, 1, 1.5, 2].map((speed) => (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              key={speed}
            >
              <Button
                onClick={() => onSpeedChange(speed)}
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white hover:bg-[#111111d1] hover:text-white text-xs h-8 w-8",
                  playbackSpeed === speed && "bg-[#111111d1]"
                )}
              >
                {speed}x
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export { VideoControls }; 