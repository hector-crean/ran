// TODO: add user feedback to draggable
// TODO: add user feedback to correctly dropping, and transition to next slide

"use client";

import { useRef, ReactNode, useState } from "react";

import * as motion from "motion/react-client";
import { useDragControls } from "motion/react";

import { HollowButton } from "@/components/ui/hollow-button";

import { Hotspot } from "../hotspot";

interface DragDropGridProps {
  poster: string;
  instructions: ReactNode;
  draggable: object;
  dropzone: object;
  showIndication: boolean;
}

const Indicator = ({ colour, start, end }) => {
  return (
    <>
      <svg
        height="100%"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", left: 0, zIndex: 0 }}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={colour} />
          </marker>
        </defs>
        <line
          x1={`${start.x}`}
          y1={`${start.y}`}
          x2={`${end.x}`}
          y2={`${end.y}`}
          stroke={colour}
          strokeWidth="4"
          stroke-dasharray="6"
          markerEnd="url(#arrow)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: start.y,
          left: start.x,
          transform: "translate(-50%, -50%)",
          border: "5px dotted lightgray",
          width: start.radius,
          aspectRatio: "1 / 1",
          padding: "6%",
          borderRadius: "1rem",
        }}
      ></div>
    </>
  );
};

function DragDropGrid({
  instructions,
  poster,
  draggable,
  dropzone,
  showIndication,
}: DragDropGridProps) {
  const controls = useDragControls();

  const [isOver, setIsOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragContainerRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleDragging = () => {
    if (isDragging) return;
    setIsDragging(true);
  };

  const handleIsOver = () => {
    if (!isDragging) return;
    setIsOver(true);
  };

  const handleIsNotOver = () => {
    if (!isDragging) return;
    setIsOver(false);
  };

  const handleDrop = e => {
    if (isDragging && isOver) {
      setIsDragging(false);
      console.log("dropped corectly!");
    }
  };

  return (
    <div ref={containerRef} className="relative isolate h-full w-full">
      <img
        src={poster}
        alt="Freeze Frame"
        className="-z-0 h-full w-full object-cover"
      />
      <motion.div
        className="pointer-events-none absolute right-0 bottom-16 left-0 z-10 flex w-full items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HollowButton>{instructions}</HollowButton>
      </motion.div>
      <motion.div
        ref={dragContainerRef}
        className="absolute top-0 z-20 h-full w-full overflow-hidden"
      >
        {showIndication ? (
          <Indicator colour="lightgray" start={draggable} end={dropzone} />
        ) : null}

        <motion.div
          ref={dropZoneRef}
          onMouseEnter={() => handleIsOver()}
          onMouseLeave={() => handleIsNotOver()}
          className={`absolute bottom-0 z-10 aspect-square -translate-[50%] w-[${dropzone.radius}]`}
          style={{
            border: "1px solid red",
            left: dropzone.x,
            top: dropzone.y,
          }}
        ></motion.div>

        <motion.div
          drag
          dragConstraints={dragContainerRef}
          className={`absolute aspect-square cursor-grab touch-none`}
          style={{
            width: draggable.radius,
            top: draggable.y,
            left: draggable.x,
          }}
          onPointerDown={e => controls.start(e)}
          dragControls={controls}
          onDrag={() => handleDragging()}
          onDragEnd={e => handleDrop(e)}
        >
          <img
            className="user-select-none pointer-events-none"
            style={{
              filter:
                "drop-shadow(0 0 4px #bb67e4) drop-shadow(0 0 8px #bb67e4) drop-shadow(0 0 10px #bb67e4)",
            }}
            src={draggable.icon}
          />
          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              top: "60%",
              left: "-30%",
            }}
          >
            <Hotspot
              color="#bb67e4"
              icon="/touch_long_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"
              size="xl"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export { DragDropGrid };
export type { DragDropGridProps };
