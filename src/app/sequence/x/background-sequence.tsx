"use client";

import LockSlider, { useLockSlider } from "@/components/ui/lock-slider";
import { RotationIndicator } from "@/components/ui/rotation-indicator";
import { Sequence } from "@/components/ui/sequence";
import { useImageSequence } from "@/hooks/use-image-sequence";
import { useTransform } from "motion/react";
import { useState, useMemo } from "react";

// Background Sequence Component that connects to LockSlider progress

interface BackgroundSequenceProps {
  baseUrl: string;
  totalFrames: number;
  format: "png" | "jpg";
}

const BackgroundSequence = ({
  baseUrl,
  totalFrames,
  format,
}: BackgroundSequenceProps) => {
  const { progress } = useLockSlider();

  // Generate paths for Scene_2.2.1 sequence (100 frames)
  const paths = useMemo(() => {
    return Array.from(
      { length: totalFrames },
      (_, i) => `${baseUrl}_${(i + 1).toString().padStart(5, "0")}.png`
    );
  }, []);

  const { images, loaded, firstImageLoaded } = useImageSequence(paths, {
    enableFallback: true,
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Loading state with first frame */}
      {!loaded && firstImageLoaded && (
        <img
          src={paths[0]}
          alt="Sequence"
          className="aspect-[1920/1080] h-full w-full object-contain opacity-50"
        />
      )}

      {/* Interactive sequence display */}
      {loaded && (
        <Sequence
          frames={images}
          value={progress}
          className="aspect-[1920/1080] h-full w-full object-contain opacity-60"
        />
      )}
    </div>
  );
};

export { BackgroundSequence };
