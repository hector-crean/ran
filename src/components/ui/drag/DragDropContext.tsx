"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type DragData<T = unknown> = {
  id: string;
  data: T;
  position: { x: number; y: number };
};

export type DropZone<T = unknown> = {
  id: string;
  bounds: DOMRect;
  accepts: (dragData: T) => boolean;
  onDrop: (dragData: T, position: { x: number; y: number }) => void;
  onDragEnter?: (dragData: T) => void;
  onDragLeave?: (dragData: T) => void;
  element: HTMLElement | SVGElement | null;
};

export type DragDropContextType = {
  // Current drag state
  activeDrag: DragData | null;

  // Drop zone management
  registerDropZone: (dropZone: DropZone) => () => void;
  updateDropZoneBounds: (id: string, bounds: DOMRect) => void;

  // Drag operations
  startDrag: (dragData: DragData) => void;
  updateDragPosition: (position: { x: number; y: number }) => void;
  endDrag: (position?: { x: number; y: number }) => void;

  // Drop zone states
  getDropZoneState: (id: string) => { isOver: boolean; canDrop: boolean };
};

const DragDropContext = createContext<DragDropContextType | null>(null);

export function useDragDropContext<T = unknown>(): DragDropContextType {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error(
      "useDragDropContext must be used within a DragDropProvider"
    );
  }
  return context;
}

// Helper functions for working with typed drag data
export function createDragData<T>(
  id: string,
  data: T,
  position: { x: number; y: number }
): DragData<T> {
  return {
    id,
    data,
    position,
  };
}

export function createDropZone<T>(
  id: string,
  element: HTMLElement | SVGElement | null,
  config: {
    accepts: (dragData: T) => boolean;
    onDrop: (dragData: T, position: { x: number; y: number }) => void;
    onDragEnter?: (dragData: T) => void;
    onDragLeave?: (dragData: T) => void;
  }
): DropZone<T> {
  return {
    id,
    bounds: element?.getBoundingClientRect() || new DOMRect(),
    element,
    ...config,
  };
}

// Utility type guards for type safety
export function isDragDataOfType<T>(
  dragData: DragData,
  predicate: (data: unknown) => data is T
): dragData is DragData<T> {
  return predicate(dragData.data);
}

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [activeDrag, setActiveDrag] = useState<DragData | null>(null);

  // Use refs to avoid unnecessary rerenders
  const activeDragRef = useRef<DragData | null>(null);
  const dropZonesRef = useRef<DropZone[]>([]);
  const currentlyOverDropZoneRef = useRef<DropZone | null>(null);
  const dropZoneStatesRef = useRef<
    Array<{ id: string; isOver: boolean; canDrop: boolean }>
  >([]);

  // Keep refs in sync with state
  useEffect(() => {
    activeDragRef.current = activeDrag;
  }, [activeDrag]);

  // Register a drop zone
  const registerDropZone = useCallback((dropZone: DropZone) => {
    dropZonesRef.current = [...dropZonesRef.current, dropZone];

    // Return cleanup function
    return () => {
      dropZonesRef.current = dropZonesRef.current.filter(
        zone => zone.id !== dropZone.id
      );
      dropZoneStatesRef.current = dropZoneStatesRef.current.filter(
        state => state.id !== dropZone.id
      );
    };
  }, []);

  // Update drop zone bounds (called when elements resize/move)
  const updateDropZoneBounds = useCallback((id: string, bounds: DOMRect) => {
    const dropZoneIndex = dropZonesRef.current.findIndex(
      zone => zone.id === id
    );
    if (dropZoneIndex !== -1) {
      dropZonesRef.current[dropZoneIndex] = {
        ...dropZonesRef.current[dropZoneIndex],
        bounds,
      };
    }
  }, []);

  // Check if a point intersects with a drop zone
  const getDropZoneAtPoint = useCallback(
    (x: number, y: number): DropZone | null => {
      for (const dropZone of dropZonesRef.current) {
        const { bounds } = dropZone;
        if (
          x >= bounds.left &&
          x <= bounds.right &&
          y >= bounds.top &&
          y <= bounds.bottom
        ) {
          return dropZone;
        }
      }
      return null;
    },
    []
  );

  // Start dragging
  const startDrag = useCallback((dragData: DragData) => {
    setActiveDrag(dragData);

    // Initialize drop zone states
    dropZoneStatesRef.current = dropZonesRef.current.map(dropZone => ({
      id: dropZone.id,
      isOver: false,
      canDrop: dropZone.accepts(dragData.data),
    }));

    currentlyOverDropZoneRef.current = null;
  }, []);

  // Update drag position and check for collisions
  const updateDragPosition = useCallback(
    (position: { x: number; y: number }) => {
      const currentActiveDrag = activeDragRef.current;
      if (!currentActiveDrag) return;

      setActiveDrag(prev => (prev ? { ...prev, position } : null));

      const dropZoneAtPoint = getDropZoneAtPoint(position.x, position.y);
      const previousDropZone = currentlyOverDropZoneRef.current;

      // Only update if the drop zone has changed
      if (dropZoneAtPoint !== previousDropZone) {
        // Handle leave event for previous drop zone
        if (previousDropZone) {
          previousDropZone.onDragLeave?.(currentActiveDrag.data);

          // Update state for previous drop zone
          const prevStateIndex = dropZoneStatesRef.current.findIndex(
            state => state.id === previousDropZone.id
          );
          if (prevStateIndex !== -1) {
            dropZoneStatesRef.current[prevStateIndex] = {
              ...dropZoneStatesRef.current[prevStateIndex],
              isOver: false,
            };
          }
        }

        // Handle enter event for new drop zone
        if (dropZoneAtPoint) {
          dropZoneAtPoint.onDragEnter?.(currentActiveDrag.data);

          // Update state for new drop zone
          const newStateIndex = dropZoneStatesRef.current.findIndex(
            state => state.id === dropZoneAtPoint.id
          );
          if (newStateIndex !== -1) {
            dropZoneStatesRef.current[newStateIndex] = {
              ...dropZoneStatesRef.current[newStateIndex],
              isOver: true,
            };
          }
        }

        currentlyOverDropZoneRef.current = dropZoneAtPoint;
      }
    },
    [getDropZoneAtPoint]
  );

  // End dragging
  const endDrag = useCallback(
    (position?: { x: number; y: number }) => {
      const currentActiveDrag = activeDragRef.current;
      if (!currentActiveDrag) return;

      const finalPosition = position || currentActiveDrag.position;
      const dropZoneAtPoint = getDropZoneAtPoint(
        finalPosition.x,
        finalPosition.y
      );

      // Handle drop
      if (dropZoneAtPoint && dropZoneAtPoint.accepts(currentActiveDrag.data)) {
        dropZoneAtPoint.onDrop(currentActiveDrag.data, finalPosition);
      }

      // Clean up
      setActiveDrag(null);
      dropZoneStatesRef.current = [];
      currentlyOverDropZoneRef.current = null;

      // Send drag leave to all zones that might still be listening
      for (const dropZone of dropZonesRef.current) {
        dropZone.onDragLeave?.(currentActiveDrag.data);
      }
    },
    [getDropZoneAtPoint]
  );

  // Get current state for a drop zone
  const getDropZoneState = useCallback((id: string) => {
    const state = dropZoneStatesRef.current.find(state => state.id === id);
    return state || { isOver: false, canDrop: false };
  }, []);

  const contextValue: DragDropContextType = {
    activeDrag,
    registerDropZone,
    updateDropZoneBounds,
    startDrag,
    updateDragPosition,
    endDrag,
    getDropZoneState,
  };

  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
}
