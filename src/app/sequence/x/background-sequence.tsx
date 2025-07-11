"use client";

import LockSlider, { useLockSlider } from "@/components/ui/lock-slider";
import { RotationIndicator } from "@/components/ui/rotation-indicator";
import { Sequence } from "@/components/ui/sequence";
import { useImageSequence } from "@/hooks/use-image-sequence";
import { cn } from "@/lib/utils";
import { useTransform } from "motion/react";
import { useState, useMemo, ComponentProps } from "react";

// Background Sequence Component that connects to LockSlider progress

interface BackgroundSequenceProps extends ComponentProps<"div"> {
  baseUrl: string;
  totalFrames: number;
  format: "png" | "jpg" | "jpeg" | "webp";
}

const BackgroundSequence = ({
  baseUrl,
  totalFrames,
  format,
  className,
  ...props
}: BackgroundSequenceProps) => {
  const { progress } = useLockSlider();

  // Generate paths for Scene_2.2.1 sequence (100 frames)
  const paths = useMemo(() => {
    return Array.from(
      { length: totalFrames },
      (_, i) => `${baseUrl}_${(i + 1).toString().padStart(5, "0")}.png`
    );
  }, [baseUrl, totalFrames]);

  const { images, loaded, firstImageLoaded } = useImageSequence(paths, {
    enableFallback: true,
  });

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
      {...props}
    >
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
          className="aspect-[1920/1080] h-full w-full object-contain"
        />
      )}
    </div>
  );
};

export { BackgroundSequence };
