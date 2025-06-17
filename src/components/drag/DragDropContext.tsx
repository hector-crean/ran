"use client";

import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

export type DragData<T = any> = {
  id: string;
  data: T;
  position: { x: number; y: number };
};

export type DropZone<T = any> = {
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

export function useDragDropContext<T = any>(): DragDropContextType {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDropContext must be used within a DragDropProvider');
  }
  return context;
}

// Helper functions for working with typed drag data
export function createDragData<T>(id: string, data: T, position: { x: number; y: number }): DragData<T> {
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
export function isDragDataOfType<T>(dragData: DragData, predicate: (data: any) => data is T): dragData is DragData<T> {
  return predicate(dragData.data);
}

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [activeDrag, setActiveDrag] = useState<DragData | null>(null);
  const dropZones = useRef<Map<string, DropZone>>(new Map());
  const [dropZoneStates, setDropZoneStates] = useState<Map<string, { isOver: boolean; canDrop: boolean }>>(new Map());

  // Register a drop zone
  const registerDropZone = useCallback((dropZone: DropZone) => {
    dropZones.current.set(dropZone.id, dropZone);
    
    // Return cleanup function
    return () => {
      dropZones.current.delete(dropZone.id);
      setDropZoneStates(prev => {
        const next = new Map(prev);
        next.delete(dropZone.id);
        return next;
      });
    };
  }, []);

  // Update drop zone bounds (called when elements resize/move)
  const updateDropZoneBounds = useCallback((id: string, bounds: DOMRect) => {
    const dropZone = dropZones.current.get(id);
    if (dropZone) {
      dropZones.current.set(id, { ...dropZone, bounds });
    }
  }, []);

  // Check if a point intersects with a drop zone
  const getDropZoneAtPoint = useCallback((x: number, y: number): DropZone | null => {
    for (const dropZone of dropZones.current.values()) {
      const { bounds } = dropZone;
      if (x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom) {
        return dropZone;
      }
    }
    return null;
  }, []);

  // Start dragging
  const startDrag = useCallback((dragData: DragData) => {
    setActiveDrag(dragData);
    
    // Initialize drop zone states
    const initialStates = new Map();
    for (const [id, dropZone] of dropZones.current) {
      initialStates.set(id, {
        isOver: false,
        canDrop: dropZone.accepts(dragData.data),
      });
    }
    setDropZoneStates(initialStates);
  }, []);

  // Update drag position and check for collisions
  const updateDragPosition = useCallback((position: { x: number; y: number }) => {
    if (!activeDrag) return;

    setActiveDrag(prev => prev ? { ...prev, position } : null);

    const dropZoneAtPoint = getDropZoneAtPoint(position.x, position.y);
    
    setDropZoneStates(prev => {
      const next = new Map(prev);
      
      // Update all drop zones
      for (const [id, dropZone] of dropZones.current) {
        const currentState = prev.get(id) || { isOver: false, canDrop: false };
        const isCurrentlyOver = dropZone === dropZoneAtPoint;
        const wasOver = currentState.isOver;
        
        // Handle enter/leave events
        if (isCurrentlyOver && !wasOver) {
          dropZone.onDragEnter?.(activeDrag.data);
        } else if (!isCurrentlyOver && wasOver) {
          dropZone.onDragLeave?.(activeDrag.data);
        }
        
        next.set(id, {
          ...currentState,
          isOver: isCurrentlyOver,
        });
      }
      
      return next;
    });
  }, [activeDrag, getDropZoneAtPoint]);

  // End dragging
  const endDrag = useCallback((position?: { x: number; y: number }) => {
    if (!activeDrag) return;

    const finalPosition = position || activeDrag.position;
    const dropZoneAtPoint = getDropZoneAtPoint(finalPosition.x, finalPosition.y);
    
    // Handle drop
    if (dropZoneAtPoint && dropZoneAtPoint.accepts(activeDrag.data)) {
      dropZoneAtPoint.onDrop(activeDrag.data, finalPosition);
    }
    
    // Clean up
    setActiveDrag(null);
    setDropZoneStates(new Map());
    
    // Send drag leave to all zones
    for (const dropZone of dropZones.current.values()) {
      dropZone.onDragLeave?.(activeDrag.data);
    }
  }, [activeDrag, getDropZoneAtPoint]);

  // Get current state for a drop zone
  const getDropZoneState = useCallback((id: string) => {
    return dropZoneStates.get(id) || { isOver: false, canDrop: false };
  }, [dropZoneStates]);

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