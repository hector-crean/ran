"use client";

import {
  animate,
  DragHandler,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const IPhoneLockSlider = () => {
  const SLIDER_WIDTH = 300;
  const HANDLE_SIZE = 50;
  const DRAG_THRESHOLD = 0.7; // 70% of the way across

  const sliderRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const dragX = useMotionValue(0);
  const [completed, setCompleted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate progress from 0 to 1
  const progress = useTransform(dragX, [0, SLIDER_WIDTH - HANDLE_SIZE], [0, 1]);

  // Text opacity that fades as user drags
  const textOpacity = useTransform(dragX, [0, 100], [1, 0]);

  // Handle glow effect based on progress
  const glowIntensity = useTransform(progress, [0, 1], [0, 20]);

  const handleDragEnd: DragHandler = (event, info) => {
    setIsDragging(false);
    const currentProgress = progress.get();

    if (currentProgress >= DRAG_THRESHOLD && !completed) {
      // Complete the unlock
      setCompleted(true);
      animate(dragX, SLIDER_WIDTH - HANDLE_SIZE, {
        type: "spring",
        stiffness: 400,
        damping: 30,
      }).then(() => {
        setIsUnlocked(true);
      });
    } else if (!completed) {
      // Snap back to start
      animate(dragX, 0, {
        type: "spring",
        stiffness: 400,
        damping: 30,
      });
    }
  };

  const resetSlider = () => {
    setCompleted(false);
    setIsUnlocked(false);
    animate(dragX, 0, {
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!completed && !isUnlocked) {
      setIsDragging(true);
      dragControls.start(event);
    }
  };

  return (
    <div
      className="flex h-screen w-screen items-center justify-center bg-black"
      onPointerDown={startDrag}
      style={{ touchAction: "none", cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* iPhone Lock Screen Simulation */}
      <div className="pointer-events-none flex flex-col items-center space-y-8">
        {/* Status Text */}
        <div className="text-center">
          {isUnlocked ? (
            <div className="text-xl font-medium text-green-400">✓ Unlocked</div>
          ) : (
            <div className="text-lg font-light text-white select-none">
              iPhone
            </div>
          )}
        </div>

        {/* Lock Slider Container */}
        <div className="relative">
          {/* Slider Track */}
          <div
            ref={sliderRef}
            className="relative overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
            style={{
              width: SLIDER_WIDTH,
              height: HANDLE_SIZE,
            }}
            // onPointerDown={startDrag}
          >
            {/* Background Text */}
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/60 select-none"
              style={{ opacity: textOpacity }}
            >
              slide to unlock
            </motion.div>

            {/* Arrow Icons */}
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{ opacity: textOpacity }}
            >
              <div className="flex space-x-2 text-white/40">
                <span>›</span>
                <span>›</span>
                <span>›</span>
              </div>
            </motion.div>

            {/* Drag Handle */}
            <motion.div
              className="absolute top-0 left-0 flex cursor-grab items-center justify-center rounded-full bg-white shadow-lg active:cursor-grabbing"
              style={{
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                x: dragX,
                boxShadow: useTransform(
                  glowIntensity,
                  intensity => `0 0 ${intensity}px rgba(59, 130, 246, 0.6)`
                ),
              }}
              drag={completed ? false : "x"}
              dragConstraints={{ left: 0, right: SLIDER_WIDTH - HANDLE_SIZE }}
              dragControls={dragControls}
              dragListener={false}
              dragElastic={0}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05 }}
            >
              {/* Handle Icon */}
              {isUnlocked ? (
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
            </motion.div>

            {/* Progress Fill */}
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500/30 to-green-500/30"
              style={{
                width: useTransform(dragX, x => Math.max(0, x + HANDLE_SIZE)),
              }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-xs text-center text-sm text-white/50">
          {isUnlocked ? "Locked" : "Drag the slider to the right to unlock"}
        </div>

        {/* Manual Reset Button */}
        {(completed || isUnlocked) && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={resetSlider}
            className="pointer-events-auto rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
          >
            Reset
          </motion.button>
        )}
      </div>
    </div>
  );
};

const Page = () => {
  return <IPhoneLockSlider />;
};

export default Page;
