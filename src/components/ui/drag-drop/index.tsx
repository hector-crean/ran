"use client";

import { useRef, ReactNode } from "react";

import * as motion from "motion/react-client";
import { useDragControls } from "motion/react";

import { HollowButton } from "@/components/ui/hollow-button";

type Vec2 = { x: number; y: number };

interface DragDropGridProps {
  poster: string;
  instructions: ReactNode;
  positionedElements?: Array<{ screenCoords: Vec2; node: ReactNode }>;
}

function DragDropGrid({
  instructions,
  poster,
  positionedElements,
}: DragDropGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef(null);
  const controls = useDragControls();

  return (
    <div ref={containerRef} className="relative isolate h-full w-full">
      <img
        src={poster}
        alt="Freeze Frame"
        className="-z-0 h-full w-full object-cover"
      />
      {positionedElements?.map(({ screenCoords, node }) => (
        <div
          key={screenCoords.x + screenCoords.y}
          className="pointer-events-none absolute object-contain"
          style={{
            top: `${screenCoords.y * 100}%`,
            left: `${screenCoords.x * 100}%`,
          }}
        >
          {node}
        </div>
      ))}
      <motion.div
        className="pointer-events-none absolute right-0 bottom-16 left-0 z-10 flex w-full items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HollowButton>{instructions}</HollowButton>
      </motion.div>
      <div
        ref={containerRef2}
        style={{
          width: "300px",
          height: "300px",
          border: "1px solid black",
          overflow: "hidden",
          position: "absolute",
          zIndex: 100,
          top: 0,
        }}
      >
        <motion.div
          drag
          dragConstraints={containerRef2}
          style={{
            width: "100px",
            height: "100px",
            background: "blue",
            cursor: "grab",
          }}
          onPointerDown={e => controls.start(e)}
          dragControls={controls}
        />
      </div>
    </div>
  );
}

export { DragDropGrid };
export type { DragDropGridProps };
