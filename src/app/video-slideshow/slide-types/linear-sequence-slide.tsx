"use client";

import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useMemo, useRef, useState } from "react";

import { Drag, HandlerArgs } from "@/components/ui/drag";
import { LinearIndicator } from "@/components/ui/linear-indicator";
import { Sequence } from "@/components/ui/sequence";
import { useImageSequence } from "@/hooks/use-image-sequence";
import { clamp } from "@/lib/utils";

interface LinearSequenceSlideProps {
  baseUrl: string;
  frameCount: number;
  format: string;
  sliderText: string;
}

export const LinearSequenceSlide = ({
  baseUrl,
  frameCount,
  format,
  sliderText,
}: LinearSequenceSlideProps) => {
  console.log(sliderText);
  const paths = useMemo(() => {
    return Array.from(
      { length: frameCount },
      (_, i) => `${baseUrl}${(i + 1).toString().padStart(5, "0")}.${format}`
    );
  }, [baseUrl, frameCount, format]);

  const slider = useRef<HTMLDivElement>(null);

  const progress = useMotionValue(0);

  const dragAngle = useTransform(progress, [0, 1], [0, 360]);

  const memoizedImagePaths = useMemo(() => paths, [paths]);

  const {
    images,
    loaded,
    firstImageLoaded,
    progress: sequenceLoadProgress,
  } = useImageSequence(memoizedImagePaths, {
    enableFallback: false, // Keep original behavior for this component
  });

  const width = 1920;
  const height = 1080;
  const dragKnobRef = useRef<SVGGElement>(null);

  const DRAG_SCALE_FACTOR = 3 / 2;

  const [dragging, setDragging] = useState(false);

  const dragX = useTransform(progress, [0, 1], [0, width]);

  const handleDragMove = (args: HandlerArgs) => {
    const newProgress = clamp((DRAG_SCALE_FACTOR * args.dx) / width, 0, 1);
    progress.set(newProgress);
  };

  const handleDragEnd = () => {
    setDragging(false);
    const currentProgress = progress.get();

    if (currentProgress < 0.75) {
      animate(progress, 0, { type: "spring", stiffness: 300, damping: 30 });
    } else {
      animate(progress, 1, { type: "spring", stiffness: 300, damping: 30 });
      progress.set(0);
    }
  };

  const handleDragStart = () => {
    setDragging(true);
  };

  return (
    <div
      className="relative flex h-full max-h-screen w-full items-center justify-center select-none"
      ref={slider}
    >
      <motion.div
        key="loading-frame"
        className="absolute inset-0 flex items-center justify-center"
        // initial={{ opacity: 1 }}
        // exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.5 } }}
      >
        <img
          src={paths[0]}
          alt="Sequence"
          className="aspect-[1920/1080] h-full w-full object-contain"
        />
      </motion.div>
      {loaded && (
        <AnimatePresence mode="wait">
          <motion.div
            key="sequence-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sequence
              frames={images}
              value={progress}
              className={"aspect-[1920/1080] w-full"}
            />
          </motion.div>

          {/* <RotationIndicator
            dragAngle={dragAngle}
            dragging={dragging}
            strokeWidth={1.5}
            radius={48}
          /> */}

          <motion.div
            key="linear-indicator"
            className="pointer-events-none absolute right-0 bottom-16 left-0 z-10 flex w-full items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LinearIndicator
              progressRatio={progress}
              className="w-2/3"
              sliderText={sliderText}
            />
          </motion.div>

          <motion.div
            key="drag-overlay"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg className="h-full w-full" viewBox={`0 0 ${width} ${height}`}>
              <Drag
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                x={0}
                y={height / 2}
                width={width}
                height={height}
                // restrictToPath={pathRef.current ?? undefined}
                resetOnStart
              >
                {({ dragStart, dragEnd, dragMove, isDragging }) => (
                  <motion.g
                    key="drag-handle"
                    ref={dragKnobRef}
                    style={{
                      cursor: isDragging ? "grabbing" : "grab",
                      x: dragX,
                      y: 0,
                    }}
                    onPointerDown={dragStart}
                    onPointerUp={dragEnd}
                    onPointerMove={dragMove}
                    animate={{ scale: isDragging || dragging ? 1.2 : 1 }}
                  >
                    {/* <motion.circle r="20" fill="white" /> */}
                    <motion.rect
                      key="drag-area"
                      width={width}
                      height={height}
                      fill="rgba(255,255,255,0.0)"
                      style={{ pointerEvents: dragging ? "none" : "auto" }}
                    />
                  </motion.g>
                )}
              </Drag>
            </svg>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export type { LinearSequenceSlideProps };
