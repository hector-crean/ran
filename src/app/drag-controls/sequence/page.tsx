"use client";

import {
  LockSlider,
  LockSliderDragArea,
  LockSliderHandle,
  LockSliderProgress,
  LockSliderText,
  LockSliderTrack,
  useLockSlider,
} from "@/components/ui/lock-slider";
import { Sequence } from "@/components/ui/sequence";
import { useImageSequence } from "@/hooks/use-image-sequence";
import { useState, useMemo } from "react";

// Background Sequence Component that connects to LockSlider progress
const BackgroundSequence = () => {
  const { progress } = useLockSlider();

  // Generate paths for Scene_2.2.1 sequence (100 frames)
  const paths = useMemo(() => {
    return Array.from(
      { length: 100 },
      (_, i) => `/assets/Scene_2.2.1_${(i + 1).toString().padStart(5, "0")}.png`
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

const Page = () => {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
      <LockSlider
        width={300}
        handleSize={50}
        threshold={0.7}
        onUnlock={() => setUnlocked(true)}
        onReset={() => setUnlocked(false)}
      >
        {/* Background sequence that responds to drag progress */}

        <LockSliderDragArea fullScreen>
          <BackgroundSequence />
        </LockSliderDragArea>

        <LockSliderTrack className="border border-white/20 bg-white/10 backdrop-blur-sm">
          <LockSliderProgress className="bg-gradient-to-r from-blue-500/30 to-green-500/30" />
          <LockSliderText className="text-white/60">
            slide to progress
          </LockSliderText>
          <LockSliderText className="text-white/40">
            <div className="flex space-x-2">
              <span>›</span>
              <span>›</span>
              <span>›</span>
            </div>
          </LockSliderText>
        </LockSliderTrack>

        <LockSliderHandle className="bg-white shadow-lg">
          {unlocked ? (
            <div className="text-xl text-green-500">✓</div>
          ) : (
            <div className="text-gray-600">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 5a3 3 0 013-3 3 3 0 013 3v4h1a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2h1V5zm3-1a1 1 0 00-1 1v4h2V5a1 1 0 00-1-1z" />
              </svg>
            </div>
          )}
        </LockSliderHandle>
      </LockSlider>

      {/* Status and Instructions - positioned absolutely over the drag area */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-8">
          {/* Status Text */}
          <div className="text-center">
            {unlocked ? (
              <div className="text-xl font-medium text-green-400">
                ✓ Unlocked
              </div>
            ) : (
              <div className="text-lg font-light text-white select-none">
                Sequence
              </div>
            )}
          </div>

          {/* Spacer for slider */}
          <div className="h-12" />

          {/* Instructions */}
          <div className="max-w-xs text-center text-sm text-white/50">
            {unlocked
              ? "Will reset automatically..."
              : "Click anywhere on screen to start dragging"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
