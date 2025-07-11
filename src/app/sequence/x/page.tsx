"use client";

import LockSlider, { useLockSlider } from "@/components/ui/lock-slider";
import { RotationIndicator } from "@/components/ui/rotation-indicator";
import { Sequence } from "@/components/ui/sequence";
import { useImageSequence } from "@/hooks/use-image-sequence";
import { useTransform } from "motion/react";
import { useState, useMemo } from "react";
import { BackgroundSequence } from "./background-sequence";

const RotationGUI = () => {
  const { progress, isDragging } = useLockSlider();
  const dragAngle = useTransform(progress, [0, 1], [0, 270]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
      <RotationIndicator
        dragAngle={dragAngle}
        dragging={isDragging}
        radius={48}
      />
    </div>
  );
};

const Page = () => {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
      <LockSlider.Root
        width={300}
        handleSize={50}
        threshold={0.7}
        onUnlock={() => setUnlocked(true)}
        onReset={() => setUnlocked(false)}
      >
        {/* Decoupled drag area that can contain background content */}
        <LockSlider.DragArea fullScreen className="z-50" />

        {/* Visual slider container - positioned independently */}
        <LockSlider.Container className="relative z-10 opacity-45">
          <LockSlider.Track className="border border-white/20 bg-white/10 backdrop-blur-sm">
            <LockSlider.Progress className="bg-gradient-to-r from-blue-500/30 to-green-500/30" />
            <LockSlider.Text className="text-white/60">
              slide to progress
            </LockSlider.Text>
            <LockSlider.Text className="text-white/40">
              <div className="flex space-x-2">
                <span>›</span>
                <span>›</span>
                <span>›</span>
              </div>
            </LockSlider.Text>
          </LockSlider.Track>

          <LockSlider.Handle className="bg-white shadow-lg">
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
          </LockSlider.Handle>
        </LockSlider.Container>

        <BackgroundSequence
          className="fixed inset-0 -z-0"
          baseUrl="/assets/Scene_2.2.1"
          totalFrames={100}
          format="png"
        />

        {/* Status and Instructions - positioned absolutely over everything */}
        <RotationGUI />
      </LockSlider.Root>
    </div>
  );
};

export default Page;
