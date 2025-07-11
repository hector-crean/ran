"use client";

import { useState, useCallback } from "react";
import JoyStick, {
  useJoyStickState,
  useJoyStickPosition,
  useJoyStick,
} from "@/components/ui/joystick";
import { motion, useMotionValueEvent, useTransform } from "motion/react";
import { BackgroundSequence } from "./background-sequence";
import MotionDebugUI, {
  defaultFormatters,
} from "@/components/ui/motion-debug-ui";

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

interface SequenceXYProps {
  baseUrl: string;
  totalFrames: number;
  format: "png" | "jpg" | "jpeg" | "webp";
  progressDirection: { x: number; y: number };
  sliderText?: string;
}

const SequenceXY = ({
  baseUrl,
  totalFrames,
  format,
  progressDirection,
}: SequenceXYProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [showDebug, setShowDebug] = useState(true);

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
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed top-4 left-4 z-50 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
      >
        {showDebug ? "Hide Debug" : "Show Debug"}
      </button>

      <JoyStick.Root
        size={600}
        handleSize={40}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onReset={handleReset}
        className="isolate mx-auto"
        progressDirection={normaliseVector(progressDirection)}
      >
        <JoyStick.DragArea fullScreen className="z-20" />

        <JoyStick.Container className="relative z-10 flex flex-col items-center justify-center opacity-45">
          <JoyStick.Track>
            <JoyStick.Progress />
            <ProgressDirectionArrow />
            <Metrics />

            <JoyStick.ProjectedProgress />
            <JoyStick.Text fadeOnDrag>Drag me!</JoyStick.Text>
            <JoyStick.Handle>
              <div className="h-6 w-6 rounded-full bg-blue-500" />
            </JoyStick.Handle>
          </JoyStick.Track>
        </JoyStick.Container>

        <BackgroundSequence
          className="fixed inset-0 -z-0"
          baseUrl={baseUrl}
          totalFrames={totalFrames}
          format={format}
        />

        <JoyStickDebugPanel visible={showDebug} />
      </JoyStick.Root>
    </div>
  );
};

// Debug panel component specifically for JoyStick
function JoyStickDebugPanel({ visible }: { visible: boolean }) {
  const {
    dragX,
    dragY,
    progressX,
    progressY,
    progress,
    normalizedDistance,
    isDragging,
    completed,
    threshold,
  } = useJoyStick();

  const motionValues = [
    {
      label: "Progress",
      value: progress,
      range: [0, 1] as [number, number],
      color: "#22c55e",
      format: defaultFormatters.decimal,
    },
    {
      label: "DragX",
      value: dragX,
      range: [-280, 280] as [number, number],
      color: "#3b82f6",
      unit: "px",
      format: defaultFormatters.integer,
    },
    {
      label: "DragY",
      value: dragY,
      range: [-280, 280] as [number, number],
      color: "#8b5cf6",
      unit: "px",
      format: defaultFormatters.integer,
    },
    {
      label: "Distance",
      value: normalizedDistance,
      range: [0, 1] as [number, number],
      color: "#f59e0b",
      format: defaultFormatters.decimal,
    },
  ];

  const states = [
    { label: "Dragging", value: isDragging },
    { label: "Completed", value: completed },
  ];

  const thresholds = [
    {
      label: "Threshold",
      value: threshold,
      range: [0, 1] as [number, number],
      color: "#fbbf24",
    },
  ];

  return (
    <MotionDebugUI
      title="JoyStick Debug"
      motionValues={motionValues}
      states={states}
      thresholds={thresholds}
      visible={visible}
      position="top-right"
    />
  );
}

const Page = () => {
  return (
    <SequenceXY
      baseUrl="/assets/Scene_5.3"
      totalFrames={75}
      format="png"
      progressDirection={{ x: 2, y: 1 }}
    />
  );
};

export default Page;

export { SequenceXY };
export type { SequenceXYProps };
