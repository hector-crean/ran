"use client";

import { useState, useCallback } from "react";
import JoyStick, {
  useJoyStickState,
  useJoyStickPosition,
  useJoyStick,
} from "@/components/ui/joystick";
import { motion, useMotionValueEvent, useTransform } from "motion/react";
import { BackgroundSequence } from "./background-sequence";

// Demo component showing joystick values
function Metrics() {
  const { isDragging, progressX, progressY, normalizedDistance, progress } =
    useJoyStick();

  const [progressValue, setProgressValue] = useState(0);
  useMotionValueEvent(progress, "change", latestValue => {
    setProgressValue(latestValue);
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>Progress: {progressValue.toFixed(3)}</div>
      </div>
    </div>
  );
}

// Progress direction arrow component
function ProgressDirectionArrow() {
  const { progressDirection, normalizedDistance } = useJoyStick();

  // Calculate angle from progress direction
  const angle =
    (Math.atan2(progressDirection.y, progressDirection.x) * 180) / Math.PI;

  // Arrow length based on joystick size
  const arrowLength = 60;

  // Calculate opacity based on normalized distance
  const arrowOpacity = useTransform(normalizedDistance, [0, 0.1], [0.7, 0.3]);

  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      {/* Arrow line */}
      <motion.div
        className="absolute h-0.5 origin-left bg-gradient-to-r from-green-400 to-transparent transition-opacity duration-300"
        style={{
          width: `${arrowLength}px`,
          transform: `rotate(${angle}deg)`,
          opacity: arrowOpacity,
        }}
      />

      {/* Center dot */}
      <div className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400" />
    </div>
  );
}

const normaliseVector = (vector: { x: number; y: number }) => {
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
  return {
    x: vector.x / length,
    y: vector.y / length,
  };
};

export default function XYDragPage() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleReset = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <div className="container mx-auto p-8">
      {/* Joystick Demo */}

      <JoyStick.Root
        size={600}
        handleSize={40}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onReset={handleReset}
        className="isolate mx-auto"
        progressDirection={normaliseVector({ x: 2, y: 1 })}
      >
        <JoyStick.DragArea fullScreen className="z-10">
          <BackgroundSequence
            baseUrl="/assets/Scene_5.3"
            totalFrames={75}
            format="png"
          />
        </JoyStick.DragArea>

        <JoyStick.Container className="relative -z-0 flex flex-col items-center justify-center">
          <JoyStick.Track>
            <JoyStick.Progress />
            <ProgressDirectionArrow />
            <JoyStick.ProjectedProgress />
            <JoyStick.Text fadeOnDrag>Drag me!</JoyStick.Text>
            <JoyStick.Handle>
              <div className="h-6 w-6 rounded-full bg-blue-500" />
            </JoyStick.Handle>
          </JoyStick.Track>
        </JoyStick.Container>

        <div className="absolute top-0 left-0 -z-0">
          <Metrics />
        </div>

        {/* Visual Feedback */}
      </JoyStick.Root>
    </div>
  );
}
