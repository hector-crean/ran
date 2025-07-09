"use client";

import { Drag, HandlerArgs, raise } from "@/components/drag";
import { createDragData, DragDropProvider, useDragDropContext } from '@/components/drag/DragDropContext';
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import {
  getCentroid,
  renderConvexHull,
  renderGeometry
} from "@/components/ui/svg/geometry/render";
import { MaskOutlineProperties } from "@/types/MaskOutlineProperties";
import { OutlineResponse } from "@/types/OutlineResponse";
import { Feature, Geometry } from "geojson";
import { motion } from "motion/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { outline } from "../processed";

const Page = () => {
  return (
    <div className="w-full h-full bg-gray-900 p-12">
      <ResponsiveContainer
        width={1920}
        height={1080}
        scale={true}
        containerClassname="w-full h-full bg-gray-900"
        contentClassname="rounded-2xl overflow-hidden shadow-lg bg-white"
      >
        <DragDropProvider>
          <DragExample outline={outline} />
        </DragDropProvider>
      </ResponsiveContainer>
    </div>
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
    const dragDropContext = useDragDropContext();

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
    const handleDragStart = useCallback((args: HandlerArgs) => {
      onReorder(index);

      // Create drag data and start drag in context
      const dragData = createDragData(
        `item-${item.id}`,
        {
          id: item.id,
          properties: item.properties,
          geometry: item.geometry,
        },
        { x: args.x || 0, y: args.y || 0 }
      );

      dragDropContext.startDrag(dragData);
    }, [index, onReorder, item, dragDropContext]);

    const onDragEnd = useCallback((args: HandlerArgs) => {
      console.log('Drag ended:', args);

      // Convert SVG coordinates to screen coordinates for proper drop detection
      const svgElement = document.querySelector('svg');
      if (svgElement) {
        const rect = svgElement.getBoundingClientRect();
        const screenX = rect.left + (args.x || 0) * (rect.width / width);
        const screenY = rect.top + (args.y || 0) * (rect.height / height);

        dragDropContext.endDrag({ x: screenX, y: screenY });
      } else {
        dragDropContext.endDrag();
      }
    }, [dragDropContext, width, height]);

    const onDragMove = useCallback((args: HandlerArgs) => {
      // Convert SVG coordinates to screen coordinates for proper collision detection
      const svgElement = document.querySelector('svg');
      if (svgElement) {
        const rect = svgElement.getBoundingClientRect();
        const screenX = rect.left + (args.x || 0) * (rect.width / width);
        const screenY = rect.top + (args.y || 0) * (rect.height / height);

        dragDropContext.updateDragPosition({ x: screenX, y: screenY });
      }
    }, [dragDropContext, width, height]);

    return (
      <Drag
        key={`drag-${item.id}`}
        width={width}
        height={height}
        x={centroid.x}
        y={centroid.y}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
      >
        {({ dragStart, dragEnd, dragMove, isDragging, dx, dy }) => (
          <motion.g
            layoutId={`geometry-${item.id}`}
            layout
            animate={{
              scale: isDragging ? 1.05 : 1,
            }}
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

// Context-aware drop zone component
const ContextDropZone = React.memo(({
  id,
  x,
  y,
  width,
  height,
  onDrop,
  accepts,
  children,
}: {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onDrop: (dragData: any, position: { x: number; y: number }) => void;
  accepts: (dragData: any) => boolean;
  children: (state: { isOver: boolean; canDrop: boolean }) => React.ReactNode;
}) => {
  const dragDropContext = useDragDropContext();
  const dropZoneRef = useRef<SVGRectElement>(null);

  // Use refs to store the latest function references to avoid re-registration
  const onDropRef = useRef(onDrop);
  const acceptsRef = useRef(accepts);

  // Update refs when functions change
  onDropRef.current = onDrop;
  acceptsRef.current = accepts;

  // Register drop zone with context
  useEffect(() => {
    if (!dropZoneRef.current) return;

    const dropZone = {
      id,
      bounds: dropZoneRef.current.getBoundingClientRect(),
      accepts: (dragData: any) => acceptsRef.current(dragData),
      onDrop: (dragData: any, position: { x: number; y: number }) => onDropRef.current(dragData, position),
      element: dropZoneRef.current,
    };

    const cleanup = dragDropContext.registerDropZone(dropZone);

    // Update bounds when the component moves or resizes
    const updateBounds = () => {
      if (dropZoneRef.current) {
        dragDropContext.updateDropZoneBounds(id, dropZoneRef.current.getBoundingClientRect());
      }
    };

    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(dropZoneRef.current);

    return () => {
      cleanup();
      resizeObserver.disconnect();
    };
  }, [id, dragDropContext]); // Removed onDrop and accepts from dependencies

  // Get current drop zone state
  const dropZoneState = dragDropContext.getDropZoneState(id);

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Background drop zone indicator */}
      <motion.rect
        ref={dropZoneRef}
        width={width}
        height={height}
        rx={4}
        initial={{ opacity: 0 }}
        animate={{
          opacity: dropZoneState.isOver ? 1 : 0.6,
          scale: dropZoneState.isOver ? 1.02 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        fill={dropZoneState.isOver && dropZoneState.canDrop
          ? "rgba(34, 197, 94, 0.2)"
          : dropZoneState.isOver
            ? "rgba(239, 68, 68, 0.2)"
            : "rgba(59, 130, 246, 0.1)"
        }
        stroke={dropZoneState.isOver && dropZoneState.canDrop
          ? "rgb(34, 197, 94)"
          : dropZoneState.isOver
            ? "rgb(239, 68, 68)"
            : "rgba(59, 130, 246, 0.3)"
        }
        strokeWidth={dropZoneState.isOver ? 2 : 1}
        strokeDasharray={dropZoneState.isOver ? "8,4" : "4,4"}
      />

      {/* Render children */}
      {children(dropZoneState)}

      {/* Drop zone label when active */}
      {dropZoneState.isOver && (
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
          fill={dropZoneState.canDrop ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
        >
          {dropZoneState.canDrop ? 'Drop here' : 'Cannot drop'}
        </motion.text>
      )}
    </g>
  );
});

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

  // Handle drop events
  const handleDrop = useCallback((dragData: any, position: { x: number; y: number }) => {
    console.log('Item dropped:', { dragData, position });
    // Here you could move items between containers, validate drops, etc.
  }, []);

  return (
    <div
      className="relative w-full group cursor-pointer overflow-hidden"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* Example Drop Zones */}
        <ContextDropZone
          id="drop-zone-1"
          x={50}
          y={50}
          width={150}
          height={100}
          onDrop={handleDrop}
          accepts={(dragData) => dragData?.id !== undefined}
        >
          {({ isOver, canDrop }) => (
            <text
              x={75}
              y={55}
              textAnchor="middle"
              fontSize={12}
              fill={isOver && canDrop ? 'green' : 'gray'}
            >
              Drop Zone 1
            </text>
          )}
        </ContextDropZone>

        <ContextDropZone
          id="drop-zone-2"
          x={width - 170}
          y={height - 130}
          width={120}
          height={80}
          onDrop={handleDrop}
          accepts={(dragData) => dragData?.id !== undefined}

        >
          {({ isOver, canDrop }) => (
            <text
              x={60}
              y={45}
              textAnchor="middle"
              fontSize={12}
              fill={isOver && canDrop ? 'green' : 'gray'}
            >
              Drop Zone 2
            </text>
          )}
        </ContextDropZone>

        {/* Draggable Items */}
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
