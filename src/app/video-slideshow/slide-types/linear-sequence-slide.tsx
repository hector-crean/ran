"use client";

import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { useMemo, useRef, useState } from "react";

import { Drag, HandlerArgs } from "@/components/drag";
import { Sequence } from "@/components/sequence";
import { useImageSequence } from "@/hooks/use-image-sequence";
import { clamp } from "@/lib/utils";
import { Slide } from "@/types/slides";
import { RotationIndicator } from "@/components/ui/rotation-indicator";





interface SequenceSlideProps {
  slide: Slide;
  baseUrl: string;
  frameCount: number;
  format: string;
}

export const SequenceSlide = ({
  slide,
  baseUrl,
  frameCount,
  format,
}: SequenceSlideProps) => {
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
  const pathRef = useRef<SVGPathElement>(null);
  const dragKnobRef = useRef<SVGGElement>(null);

  const [dragging, setDragging] = useState(false);

  const dragX = useTransform(progress, [0, 1], [0, width]);

  const handleDragMove = (args: HandlerArgs) => {
    const newProgress = clamp(args.dx / width, 0, 1);
    progress.set(newProgress);
  };

  const handleDragEnd = () => {
    setDragging(false);
    const currentProgress = progress.get();

    if (currentProgress < 0.95) {
      animate(progress, 0, { type: "spring", stiffness: 300, damping: 30 });
    } else {
      animate(progress, 1, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  const handleDragStart = () => {
    setDragging(true);
  };

  return (
    <div className="w-full h-full max-h-screen max-w-screen relative flex items-center justify-center" ref={slider}>
      <motion.div
        key="loading"
        className="absolute inset-0 flex items-center justify-center"
      // initial={{ opacity: 1 }}
      // exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.5 } }}
      >
        <img src={paths[0]} alt="Sequence" className="w-full h-full object-contain aspect-[1920/1080]" />
      </motion.div>
      {loaded && (
        <AnimatePresence>
          <motion.div
            key="sequence"
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

          <RotationIndicator
            dragAngle={dragAngle}
            dragging={dragging}
            strokeWidth={1.5}
            radius={48}
          />
          <motion.div className="absolute inset-0" initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}

          >
            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
              <path
                ref={pathRef}
                d={`M 50 ${height / 2} H ${width - 50}`}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
              <rect
                x={width - 100}
                y={height / 2 - 50}
                width="100"
                height="100"
                fill="rgba(255,255,255,0.1)"
              />

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
                    ref={dragKnobRef}
                    style={{
                      cursor: isDragging ? "grabbing" : "grab",
                      x: dragX,
                      y: 0
                    }}
                    onPointerDown={dragStart}
                    onPointerUp={dragEnd}
                    onPointerMove={dragMove}
                    animate={{ scale: isDragging || dragging ? 1.2 : 1 }}
                  >
                    {/* <motion.circle r="20" fill="white" /> */}
                    <motion.rect
                      width={width}
                      height={height}
                      fill="rgba(255,255,255,0.1)"
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



export type { SequenceSlideProps };

