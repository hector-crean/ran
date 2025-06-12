"use client";

import { Drag, raise } from "@/components/drag";
import {
  reduceGeojson,
  renderGeometry,
  getCentroid,
  renderConvexHull,
} from "@/components/ui/svg/geometry/render";
import { OutlineResponse } from "@/types/OutlineResponse";
import { Geometry, Feature } from "geojson";
import { MaskOutlineProperties } from "@/types/MaskOutlineProperties";
import { motion } from "motion/react";
import { outline } from "../processed";
import { useState, useMemo, useCallback } from "react";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import React from "react";

const Page = () => {
  return (
    <ResponsiveContainer
      width={1920}
      height={1080}
      scale={true}
      containerClassname="w-full h-full bg-gray-900"
      contentClassname="rounded-2xl overflow-hidden shadow-lg bg-white"
    >
      <DragExample outline={outline} />
    </ResponsiveContainer>
  );
};

export default Page;

interface DragExampleProps {
  outline: OutlineResponse;
}

// Memoized individual drag item component
const DragItem = React.memo(
  ({
    item,
    index,
    width,
    height,
    onReorder,
  }: {
    item: { geometry: Geometry; id: number; properties: MaskOutlineProperties };
    index: number;
    width: number;
    height: number;
    onReorder: (index: number) => void;
  }) => {
    // Memoize expensive calculations
    const centroid = useMemo(() => getCentroid(item.geometry), [item.geometry]);

    // Memoize convex hull for dragging
    const convexHullProps = useMemo(
      () => ({
        fill: "rgba(59, 130, 246, 0.2)",
        stroke: "rgb(59, 130, 246)",
        strokeWidth: 2,
        strokeDasharray: "5,5",
      }),
      []
    );

    // Memoize animation configs
    const springTransition = useMemo(
      () => ({
        type: "spring" as const,
        stiffness: 400,
        damping: 40,
        mass: 0.8,
      }),
      []
    );

    const fadeTransition = useMemo(
      () => ({
        duration: 0.3,
        ease: "easeInOut" as const,
      }),
      []
    );

    // Memoized drag start handler
    const handleDragStart = useCallback(() => {
      onReorder(index);
    }, [index, onReorder]);

    return (
      <Drag
        key={`drag-${item.id}`}
        width={width}
        height={height}
        x={centroid.x}
        y={centroid.y}
        onDragStart={handleDragStart}
      >
        {({ dragStart, dragEnd, dragMove, isDragging, dx, dy }) => (
          <motion.g
            layoutId={`geometry-${item.id}`}
            layout
            animate={{
              // x: dx,
              // y: dy,
              scale: isDragging ? 1.05 : 1,
            }}
            //   transition={springTransition}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              x: dx,
              y: dy,
            }}
          >
            {/* Geometry with smooth opacity transition */}
            <motion.g
              animate={{ opacity: isDragging ? 0.8 : 1 }}
              transition={{ duration: 0.2 }}
              pointerEvents="none"
            >
              {renderGeometry(item.geometry)}
            </motion.g>

            {/* Convex hull with smooth fade in/out */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: isDragging ? 1 : 0 }}
              transition={fadeTransition}
              onMouseMove={dragMove}
              onMouseUp={dragEnd}
              onMouseDown={dragStart}
              onTouchStart={dragStart}
              onTouchMove={dragMove}
              onTouchEnd={dragEnd}
            >
              {renderConvexHull(item.geometry, convexHullProps)}
            </motion.g>
          </motion.g>
        )}
      </Drag>
    );
  }
);

const DragExample = ({ outline }: DragExampleProps) => {
  const { width, height } = outline.image_dimensions;

  const [draggingItems, setDraggingItems] = useState(() => {
    if (outline.geojson.type === "FeatureCollection") {
      return outline.geojson.features.map(
        (feature: Feature<Geometry, MaskOutlineProperties>) => ({
          geometry: feature.geometry,
          id: feature.properties.id,
          properties: feature.properties,
        })
      );
    }
    return [];
  });

  // Memoized reorder handler
  const handleReorder = useCallback((index: number) => {
    setDraggingItems((current) => raise(current, index));
  }, []);

  return (
    <div
      className="relative w-full group cursor-pointer overflow-hidden"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {/* <img src={src} alt="outline" className="absolute inset-0 w-full h-full" /> */}

      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {draggingItems.map((item, index) => (
          <DragItem
            key={`drag-${item.id}`}
            item={item}
            index={index}
            width={width}
            height={height}
            onReorder={handleReorder}
          />
        ))}
      </motion.svg>
    </div>
  );
};
