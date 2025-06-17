"use client";

import { Drag, HandlerArgs, raise } from "@/components/drag";
import { DropEvent } from "@/components/drag/useDroppable";
import { Droppable } from '@/components/drag/Droppable'
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
import { useState, useMemo, useCallback, useEffect } from "react";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import React from "react";

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
      <DragExample outline={outline} />
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
    checkCollisions,
  }: {
    item: { geometry: Geometry; id: number; properties: MaskOutlineProperties };
    index: number;
    width: number;
    height: number;
    onReorder: (index: number) => void;
    checkCollisions?: (dragData: any, dragBbox: any) => string[];
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

    // Create drag data for dropzones
    const dragData = useMemo(() => ({
      id: item.id,
      properties: item.properties,
      geometry: item.geometry,
    }), [item]);

    const onDragEnd = useCallback((args: HandlerArgs) => {
      console.log('Drag ended:', args);
      
      // Check for collisions on drag end
      const dragBbox = transformBoundingBox(
        getBoundingBox(item.geometry),
        args.dx,
        args.dy
      );
      
      if (checkCollisions) {
        const collidingZones = checkCollisions(dragData, dragBbox);
        console.log('Colliding with zones:', collidingZones);
        
        if (collidingZones.length > 0) {
          console.log(`Item ${item.id} dropped on zones:`, collidingZones);
          // Here you would handle the drop logic
        }
      }
      
      console.log('Final drag position:', { dx: args.dx, dy: args.dy });
      console.log('Transformed bounding box:', dragBbox);
    }, [item.geometry, checkCollisions, dragData, item.id]);

    const onDragMove = useCallback((args: HandlerArgs) => {
      // Check for collisions during drag movement
      const dragBbox = transformBoundingBox(
        getBoundingBox(item.geometry),
        args.dx,
        args.dy
      );

      
      if (checkCollisions) {
        const collidingZones = checkCollisions(dragData, dragBbox);
        // Could use this for visual feedback, hover effects, etc.
        if (collidingZones.length > 0) {
          console.log(`Item ${item.id} hovering over:`, collidingZones);
        }
      }
    }, [item.geometry, checkCollisions, dragData, item.id]);

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
              // TODO: Add collision detection here to communicate with drop zones
              // You could track mouse position and check against drop zone bounds
            >
              {renderConvexHull(item.geometry, convexHullProps)}
            </motion.g>
          </motion.g>
        )}
      </Drag>
    );
  }
);

// Add these utility functions before the DragItem component

// Calculate bounding box for any geometry
const getBoundingBox = (geometry: Geometry): { minX: number; minY: number; maxX: number; maxY: number } => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  const processPoint = (coord: number[]) => {
    const [x, y] = coord;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };
  
  switch (geometry.type) {
    case "Point":
      processPoint(geometry.coordinates);
      break;
    case "MultiPoint":
      geometry.coordinates.forEach(processPoint);
      break;
    case "LineString":
      geometry.coordinates.forEach(processPoint);
      break;
    case "MultiLineString":
      geometry.coordinates.forEach(line => line.forEach(processPoint));
      break;
    case "Polygon":
      geometry.coordinates.forEach(ring => ring.forEach(processPoint));
      break;
    case "MultiPolygon":
      geometry.coordinates.forEach(polygon => 
        polygon.forEach(ring => ring.forEach(processPoint))
      );
      break;
    case "GeometryCollection":
      geometry.geometries.forEach(geom => {
        const bbox = getBoundingBox(geom);
        minX = Math.min(minX, bbox.minX);
        minY = Math.min(minY, bbox.minY);
        maxX = Math.max(maxX, bbox.maxX);
        maxY = Math.max(maxY, bbox.maxY);
      });
      break;
  }
  
  return { minX, minY, maxX, maxY };
};

// Transform bounding box by drag offset
const transformBoundingBox = (
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  dx: number,
  dy: number
) => ({
  minX: bbox.minX + dx,
  minY: bbox.minY + dy,
  maxX: bbox.maxX + dx,
  maxY: bbox.maxY + dy,
});

// Check if two bounding boxes intersect
const boundingBoxesIntersect = (
  bbox1: { minX: number; minY: number; maxX: number; maxY: number },
  bbox2: { minX: number; minY: number; maxX: number; maxY: number }
): boolean => {
  return !(
    bbox1.maxX < bbox2.minX ||
    bbox2.maxX < bbox1.minX ||
    bbox1.maxY < bbox2.minY ||
    bbox2.maxY < bbox1.minY
  );
};

// Drop zone manager implementation
const createDropZoneManager = (): DropZoneManager => {
  const dropZones = new Map<DropZoneId, DropZone>();
  
  return {
    dropZones,
    registerDropZone: (dropZone: DropZone) => {
      dropZones.set(dropZone.id, dropZone);
      return () => dropZones.delete(dropZone.id);
    },
    getDropZone: (id: DropZoneId) => dropZones.get(id),
    getDropZoneIds: () => Array.from(dropZones.keys()),
    getDropZoneCount: () => dropZones.size,
    getDropZoneById: (id: DropZoneId) => dropZones.get(id),
    getDropZoneByIndex: (index: number) => {
      const ids = Array.from(dropZones.keys());
      const id = ids[index];
      return id ? dropZones.get(id) : undefined;
    },
    getDropZoneByDragItemId: (id: DragItemId) => {
      // This would need to be implemented based on your logic
      // For now, return undefined
      return undefined;
    },
  };
};

type DropZoneId = string;
type DragItemId = string;

interface DropZone {
    id: DropZoneId;
    collisionFn: (dragData: any) => boolean;
}

interface DropZoneManager {
    dropZones: Map<DropZoneId, DropZone>;
    registerDropZone: (dropZone: DropZone) => () => void;
    getDropZone: (id: DropZoneId) => DropZone | undefined;
    getDropZoneIds: () => DropZoneId[];
    getDropZoneCount: () => number;
    getDropZoneById: (id: DropZoneId) => DropZone | undefined;
    getDropZoneByIndex: (index: number) => DropZone | undefined;
    getDropZoneByDragItemId: (id: DragItemId) => DropZone | undefined;
}

// On drag end of a drag item, we need to check if it collides with any drop zones
// While dragging, we need to check if the drag item collides with any drop zones
// We need to compare the two geometries and see if they intersect? 

const DragExample = ({ outline }: DragExampleProps) => {
  const { width, height } = outline.image_dimensions;

  // Create drop zone manager
  const dropZoneManager = useMemo(() => createDropZoneManager(), []);

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

  // Create drop zones for other geometries (items can be dropped on other items)
  const registerGeometryDropZones = useCallback(() => {
    draggingItems.forEach((item) => {
      const dropZone: DropZone = {
        id: `geometry-${item.id}`,
        collisionFn: (dragData: any) => {
          if (dragData.id === item.id) return false; // Can't drop on self
          
          // Get bounding boxes
          const dragBbox = getBoundingBox(dragData.geometry);
          const dropBbox = getBoundingBox(item.geometry);
          
          // Transform drag bbox by current position (if we had access to it)
          // For now, just check basic intersection
          return boundingBoxesIntersect(dragBbox, dropBbox);
        },
      };
      
      dropZoneManager.registerDropZone(dropZone);
    });
  }, [draggingItems, dropZoneManager]);

  // Register drop zones when items change
  useEffect(() => {
    registerGeometryDropZones();
  }, [registerGeometryDropZones]);

  // Memoized reorder handler
  const handleReorder = useCallback((index: number) => {
    setDraggingItems((current) => raise(current, index));
  }, []);

  // Handle drop events
  const handleDrop = useCallback((event: DropEvent) => {
    console.log('Item dropped:', event);
    // Here you could move items between containers, validate drops, etc.
  }, []);

  // Check collisions during drag
  const checkCollisions = useCallback((dragData: any, dragBbox: any) => {
    const collidingZones: string[] = [];
    
    dropZoneManager.getDropZoneIds().forEach(zoneId => {
      const zone = dropZoneManager.getDropZone(zoneId);
      if (zone && zone.collisionFn(dragData)) {
        collidingZones.push(zoneId);
      }
    });
    
    return collidingZones;
  }, [dropZoneManager]);

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
        <Droppable
          id="drop-zone-1"
          width={150}
          height={100}
          x={50}
          y={50}
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
        </Droppable>

        <Droppable
          id="drop-zone-2"
          width={120}
          height={80}
          x={width - 170}
          y={height - 130}
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
        </Droppable>

        {/* Draggable Items */}
        {draggingItems.map((item, index) => (
          <DragItem
            key={`drag-${item.id}`}
            item={item}
            index={index}
            width={width}
            height={height}
            onReorder={handleReorder}
            checkCollisions={checkCollisions}
          />
        ))}
      </motion.svg>
    </div>
  );
};
