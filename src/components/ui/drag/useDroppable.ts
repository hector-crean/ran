"use client";

import { useCallback, useRef, useState } from "react";

export type DropEvent = {
  /** The dragged item's data */
  dragData?: unknown;
  /** The drop zone ID */
  dropZoneId: string;
  /** The position where the drop occurred */
  position: { x: number; y: number };
};

export type UseDroppableOptions = {
  /** Unique identifier for this drop zone */
  id: string;
  /** Optional callback when an item is dropped */
  onDrop?: (event: DropEvent) => void;
  /** Optional callback when an item enters the drop zone */
  onDragEnter?: (dragData?: unknown) => void;
  /** Optional callback when an item leaves the drop zone */
  onDragLeave?: (dragData?: unknown) => void;
  /** Function to determine if a dragged item can be dropped here */
  accepts?: (dragData?: unknown) => boolean;
  /** Custom data associated with this drop zone */
  data?: unknown;
};

export type UseDroppable = {
  /** Whether an item is currently hovering over this drop zone */
  isOver: boolean;
  /** Whether the current dragged item can be dropped here */
  canDrop: boolean;
  /** Reference to attach to the drop zone element */
  dropRef: React.RefObject<SVGRectElement | null>;
  /** Function to check if a point is within the drop zone */
  isPointInside: (x: number, y: number) => boolean;
  /** Function to manually trigger drop (called by drag component) */
  handleDrop: (dragData?: unknown, position?: { x: number; y: number }) => void;
  /** Function to handle drag enter (called by drag component) */
  handleDragEnter: (dragData?: unknown) => void;
  /** Function to handle drag leave (called by drag component) */
  handleDragLeave: (dragData?: unknown) => void;
};

export function useDroppable({
  id,
  onDrop,
  onDragEnter,
  onDragLeave,
  accepts = () => true,
  data,
}: UseDroppableOptions): UseDroppable {
  const dropRef = useRef<SVGRectElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [currentDragData, setCurrentDragData] = useState<unknown>(null);

  const canDrop = currentDragData ? accepts(currentDragData) : false;

  const isPointInside = useCallback((x: number, y: number): boolean => {
    if (!dropRef.current) return false;

    const rect = dropRef.current.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }, []);

  const handleDrop = useCallback(
    (dragData?: unknown, position?: { x: number; y: number }) => {
      if (canDrop && onDrop) {
        onDrop({
          dragData,
          dropZoneId: id,
          position: position || { x: 0, y: 0 },
        });
      }
      setIsOver(false);
      setCurrentDragData(null);
    },
    [canDrop, onDrop, id]
  );

  const handleDragEnter = useCallback(
    (dragData?: unknown) => {
      setCurrentDragData(dragData);
      setIsOver(true);
      if (onDragEnter) {
        onDragEnter(dragData);
      }
    },
    [onDragEnter]
  );

  const handleDragLeave = useCallback(
    (dragData?: unknown) => {
      setIsOver(false);
      setCurrentDragData(null);
      if (onDragLeave) {
        onDragLeave(dragData);
      }
    },
    [onDragLeave]
  );

  return {
    isOver,
    canDrop,
    dropRef,
    isPointInside,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
  };
}
