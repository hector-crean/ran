"use client";

import React from "react";
import { motion } from "motion/react";
import { useDroppable, UseDroppableOptions } from "./useDroppable";

export type DroppableProps = UseDroppableOptions & {
  /** Children render function or React node */
  children: (state: {
    isOver: boolean;
    canDrop: boolean;
    dropRef: React.RefObject<SVGRectElement | null>;
  }) => React.ReactNode;
  /** Width of the drop zone */
  width: number;
  /** Height of the drop zone */
  height: number;
  /** X position of the drop zone */
  x?: number;
  /** Y position of the drop zone */
  y?: number;
  /** Additional CSS class names */
  className?: string;
  /** Whether to show visual feedback */
  showFeedback?: boolean;
};

export function Droppable({
  children,
  width,
  height,
  x = 0,
  y = 0,
  className = "",
  showFeedback = true,
  ...droppableOptions
}: DroppableProps) {
  const drop = useDroppable(droppableOptions);

  // Default visual styles based on state
  const getDropZoneStyles = () => {
    if (!showFeedback) return {};

    if (drop.isOver && drop.canDrop) {
      return {
        fill: "rgba(34, 197, 94, 0.2)", // green
        stroke: "rgb(34, 197, 94)",
        strokeWidth: 2,
        strokeDasharray: "8,4",
      };
    } else if (drop.isOver && !drop.canDrop) {
      return {
        fill: "rgba(239, 68, 68, 0.2)", // red
        stroke: "rgb(239, 68, 68)",
        strokeWidth: 2,
        strokeDasharray: "8,4",
      };
    } else if (drop.canDrop) {
      return {
        fill: "rgba(59, 130, 246, 0.1)", // blue
        stroke: "rgba(59, 130, 246, 0.3)",
        strokeWidth: 1,
        strokeDasharray: "4,4",
      };
    }

    return {
      fill: "transparent",
      stroke: "rgba(156, 163, 175, 0.3)", // gray
      strokeWidth: 1,
      strokeDasharray: "2,2",
    };
  };

  return (
    <g transform={`translate(${x}, ${y})`} className={className}>
      {/* Background drop zone indicator */}
      {showFeedback && (
        <motion.rect
          ref={drop.dropRef}
          width={width}
          height={height}
          rx={4}
          initial={{ opacity: 0 }}
          animate={{
            opacity: drop.isOver ? 1 : 0.6,
            scale: drop.isOver ? 1.02 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          {...getDropZoneStyles()}
        />
      )}

      {/* Hidden rect for accurate collision detection */}
      {!showFeedback && (
        <rect
          ref={drop.dropRef}
          width={width}
          height={height}
          fill="transparent"
          pointerEvents="none"
        />
      )}

      {/* Render children */}
      {children(drop)}

      {/* Drop zone label when active */}
      {showFeedback && drop.isOver && (
        <motion.text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fontWeight="bold"
          initial={{ opacity: 0, y: height / 2 + 10 }}
          animate={{ opacity: 1, y: height / 2 }}
          transition={{ duration: 0.2 }}
          fill={drop.canDrop ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
        >
          {drop.canDrop ? "Drop here" : "Cannot drop"}
        </motion.text>
      )}
    </g>
  );
}
