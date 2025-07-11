"use client";

import { AnimatePresence, motion } from "motion/react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Point } from "../drag/point";

// Types for the infinite canvas
export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

export interface InteractionModes {
  selectable: boolean;
  draggable: boolean;
  hoverable?: boolean;
}

export type CanvasItemBase = {
  type: "HTML" | "SVG";
  x: number;
  y: number;
  width: number;
  height: number;
  interaction: InteractionModes;
  render: (props: {
    selected: boolean;
    viewport: ViewportState;
    item: CanvasItem;
    isDragging: boolean;
    isPanning: boolean;
    isAnimating: boolean;
  }) => React.ReactNode;
};

export type CanvasItemExpansion = {
  dx: number;
  dy: number;
  width: number;
  height: number;
  render: (props: {
    selected: boolean;
    viewport: ViewportState;
    parent: CanvasItem;
    isDragging: boolean;
    isPanning: boolean;
    isAnimating: boolean;
  }) => React.ReactNode;
};

export type CanvasItem = CanvasItemBase & {
  id: string;
  selected?: boolean;
  expansion?: CanvasItemExpansion;
};

export interface ViewportAnimation {
  from: ViewportState;
  to: ViewportState;
  startTime: number;
  duration: number;
  easing?: (t: number) => number;
}

export interface InfiniteCanvasProps {
  items: CanvasItem[];
  onItemsChange: (items: CanvasItem[]) => void;
  className?: string;
  minZoom?: number;
  maxZoom?: number;
  zoomSensitivity?: number;
  children?: React.ReactNode;
  initialViewport?: ViewportState;
}

export interface InfiniteCanvasAPI {
  /** Set viewport to specific coordinates and scale */
  setViewport: (
    viewport: Partial<ViewportState>,
    options?: { animate?: boolean; duration?: number }
  ) => void;
  /** Fit one or more items in view */
  fitToItems: (
    itemIds: string[],
    options?: { padding?: number; animate?: boolean; duration?: number }
  ) => void;
  /** Fit one or more items in view and select them */
  fitToItemsAndSelect: (
    itemIds: string[],
    options?: { padding?: number; animate?: boolean; duration?: number }
  ) => void;
  /** Select specific items */
  selectItems: (itemIds: string[]) => void;
  deselectItems: (itemIds: string[]) => void;
  /** Fit all items in view */
  fitAll: (options?: {
    padding?: number;
    animate?: boolean;
    duration?: number;
  }) => void;
  /** Get current viewport state */
  getViewport: () => ViewportState;
  /** Reset viewport to origin */
  reset: (options?: { animate?: boolean; duration?: number }) => void;
  /** Zoom to a specific point */
  zoomToPoint: (
    point: { x: number; y: number },
    scale: number,
    options?: { animate?: boolean; duration?: number }
  ) => void;
}

// Utility functions for coordinate transformations
const screenToCanvas = (screenPoint: Point, viewport: ViewportState): Point => {
  return new Point({
    x: (screenPoint.x - viewport.x) / viewport.scale,
    y: (screenPoint.y - viewport.y) / viewport.scale,
  });
};

const canvasToScreen = (canvasPoint: Point, viewport: ViewportState): Point => {
  return new Point({
    x: canvasPoint.x * viewport.scale + viewport.x,
    y: canvasPoint.y * viewport.scale + viewport.y,
  });
};

// Get point from mouse or touch event
const getEventPoint = (event: MouseEvent | TouchEvent): Point => {
  if ("touches" in event && event.touches.length > 0) {
    const touch = event.touches[0];
    return new Point({ x: touch.clientX, y: touch.clientY });
  }
  return new Point({
    x: (event as MouseEvent).clientX,
    y: (event as MouseEvent).clientY,
  });
};

// Get distance between two touch points for pinch zoom
const getTouchDistance = (event: TouchEvent): number => {
  if (event.touches.length < 2) return 0;
  const touch1 = event.touches[0];
  const touch2 = event.touches[1];
  return Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
  );
};

// Get center point between two touches
const getTouchCenter = (event: TouchEvent): Point => {
  if (event.touches.length < 2) return getEventPoint(event);
  const touch1 = event.touches[0];
  const touch2 = event.touches[1];
  return new Point({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  });
};

// Easing functions
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Calculate bounding box for a set of items
const getItemsBounds = (items: CanvasItem[], itemIds: string[]) => {
  const targetItems = items.filter(item => itemIds.includes(item.id));
  if (targetItems.length === 0) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  targetItems.forEach(item => {
    minX = Math.min(minX, item.x);
    minY = Math.min(minY, item.y);
    maxX = Math.max(maxX, item.x + item.width);
    maxY = Math.max(maxY, item.y + item.height);
  });

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

// const selectItem = (items: CanvasItem[], itemId: string) => {
//   return items.map((item) => ({
//     ...item,
//     selected: item.id === itemId,
//   }));
// };
// const deselectItem = (items: CanvasItem[], itemId: string) => {
//   return items.map((item) => ({
//     ...item,
//     selected: item.id !== itemId,
//   }));
// };

export const InfiniteCanvas = forwardRef<
  InfiniteCanvasAPI,
  InfiniteCanvasProps
>(
  (
    {
      items,
      onItemsChange,
      className = "",
      minZoom = 0.1,
      maxZoom = 5,
      zoomSensitivity = 0.002,
      initialViewport,
      children,
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Viewport state
    const [viewport, setViewport] = useState<ViewportState>(
      initialViewport ?? {
        x: 0,
        y: 0,
        scale: 1,
      }
    );

    // Interaction state
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<Point>(new Point({ x: 0, y: 0 }));
    const [viewportStart, setViewportStart] = useState<ViewportState>({
      x: 0,
      y: 0,
      scale: 1,
    });
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isDraggingItem, setIsDraggingItem] = useState(false);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [itemDragStart, setItemDragStart] = useState<Point>(
      new Point({ x: 0, y: 0 })
    );

    // Touch state for pinch zoom
    const [touchStart, setTouchStart] = useState<{
      distance: number;
      center: Point;
      viewport: ViewportState;
    } | null>(null);

    // Animation state
    const [animation, setAnimation] = useState<ViewportAnimation | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Handle wheel events for zoom
    const handleWheel = useCallback(
      (event: WheelEvent) => {
        event.preventDefault();

        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mousePoint = new Point({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });

        // Handle trackpad pinch (ctrlKey indicates pinch gesture)
        if (event.ctrlKey) {
          const scaleFactor = 1 - event.deltaY * zoomSensitivity;

          setViewport(prev => {
            const newScale = Math.max(
              minZoom,
              Math.min(maxZoom, prev.scale * scaleFactor)
            );
            const scaleRatio = newScale / prev.scale;

            return {
              x: mousePoint.x - (mousePoint.x - prev.x) * scaleRatio,
              y: mousePoint.y - (mousePoint.y - prev.y) * scaleRatio,
              scale: newScale,
            };
          });
        } else {
          // Regular scroll for panning
          setViewport(prev => ({
            ...prev,
            x: prev.x - event.deltaX,
            y: prev.y - event.deltaY,
          }));
        }
      },
      [zoomSensitivity, minZoom, maxZoom]
    );

    // Handle mouse down for panning or item selection
    const handleMouseDown = useCallback(
      (event: React.MouseEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const screenPoint = new Point({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });

        const canvasPoint = screenToCanvas(screenPoint, viewport);

        // Check if clicking on an item
        const clickedItem = items.find(
          item =>
            canvasPoint.x >= item.x &&
            canvasPoint.x <= item.x + item.width &&
            canvasPoint.y >= item.y &&
            canvasPoint.y <= item.y + item.height
        );

        if (clickedItem) {
          // Handle selection - only for selectable items
          if (clickedItem.interaction.selectable) {
            if (!selectedItems.has(clickedItem.id)) {
              if (event.metaKey || event.ctrlKey) {
                setSelectedItems(prev => new Set([...prev, clickedItem.id]));
              } else {
                setSelectedItems(new Set([clickedItem.id]));
                fitToItemsAndSelect([clickedItem.id]);
              }
            }
          }

          // Handle dragging - only for draggable items
          if (clickedItem.interaction.draggable) {
            setIsDraggingItem(true);
            setDraggedItemId(clickedItem.id);
            setItemDragStart(canvasPoint);
          }
        } else {
          // Canvas panning - either no item clicked or non-selectable item
          if (!event.metaKey && !event.ctrlKey) {
            setSelectedItems(new Set());
            // fitAll({ animate: true, duration: 600 });
          }

          setIsPanning(true);
          setPanStart(screenPoint);
          setViewportStart(viewport);
        }
      },
      [viewport, items, selectedItems]
    );

    // Handle mouse move for panning or item dragging
    const handleMouseMove = useCallback(
      (event: React.MouseEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const screenPoint = new Point({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });

        if (isPanning) {
          setViewport({
            ...viewportStart,
            x: viewportStart.x + (screenPoint.x - panStart.x),
            y: viewportStart.y + (screenPoint.y - panStart.y),
          });
        } else if (isDraggingItem && draggedItemId) {
          const canvasPoint = screenToCanvas(screenPoint, viewport);
          const deltaX = canvasPoint.x - itemDragStart.x;
          const deltaY = canvasPoint.y - itemDragStart.y;

          const updatedItems = items.map(item => {
            // Only move items that are selected AND draggable
            if (selectedItems.has(item.id) && item.interaction.draggable) {
              return {
                ...item,
                x: item.x + deltaX,
                y: item.y + deltaY,
              };
            }
            return item;
          });

          onItemsChange(updatedItems);
          setItemDragStart(canvasPoint);
        }
      },
      [
        isPanning,
        isDraggingItem,
        draggedItemId,
        panStart,
        viewportStart,
        viewport,
        itemDragStart,
        items,
        selectedItems,
        onItemsChange,
      ]
    );

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
      setIsPanning(false);
      setIsDraggingItem(false);
      setDraggedItemId(null);
    }, []);

    // Touch event handlers
    const handleTouchStart = useCallback(
      (event: TouchEvent) => {
        event.preventDefault();

        if (event.touches.length === 1) {
          // Single touch - treat like mouse down
          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) return;

          const screenPoint = new Point({
            x: event.touches[0].clientX - rect.left,
            y: event.touches[0].clientY - rect.top,
          });

          setIsPanning(true);
          setPanStart(screenPoint);
          setViewportStart(viewport);
        } else if (event.touches.length === 2) {
          // Pinch zoom
          const distance = getTouchDistance(event);
          const center = getTouchCenter(event);
          const rect = svgRef.current?.getBoundingClientRect();

          if (rect) {
            setTouchStart({
              distance,
              center: new Point({
                x: center.x - rect.left,
                y: center.y - rect.top,
              }),
              viewport,
            });
          }
          setIsPanning(false);
        }
      },
      [viewport]
    );

    const handleTouchMove = useCallback(
      (event: TouchEvent) => {
        event.preventDefault();

        if (event.touches.length === 1 && isPanning) {
          // Single touch pan
          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) return;

          const screenPoint = new Point({
            x: event.touches[0].clientX - rect.left,
            y: event.touches[0].clientY - rect.top,
          });

          setViewport({
            ...viewportStart,
            x: viewportStart.x + (screenPoint.x - panStart.x),
            y: viewportStart.y + (screenPoint.y - panStart.y),
          });
        } else if (event.touches.length === 2 && touchStart) {
          // Pinch zoom
          const currentDistance = getTouchDistance(event);
          const currentCenter = getTouchCenter(event);
          const rect = svgRef.current?.getBoundingClientRect();

          if (rect) {
            const scaleFactor = currentDistance / touchStart.distance;
            const newScale = Math.max(
              minZoom,
              Math.min(maxZoom, touchStart.viewport.scale * scaleFactor)
            );
            const scaleRatio = newScale / touchStart.viewport.scale;

            const centerPoint = new Point({
              x: currentCenter.x - rect.left,
              y: currentCenter.y - rect.top,
            });

            setViewport({
              x:
                centerPoint.x -
                (centerPoint.x - touchStart.viewport.x) * scaleRatio,
              y:
                centerPoint.y -
                (centerPoint.y - touchStart.viewport.y) * scaleRatio,
              scale: newScale,
            });
          }
        }
      },
      [isPanning, panStart, viewportStart, touchStart, minZoom, maxZoom]
    );

    const handleTouchEnd = useCallback(() => {
      setIsPanning(false);
      setTouchStart(null);
      setIsDraggingItem(false);
      setDraggedItemId(null);
    }, []);

    // Add global event listeners and prevent browser zoom
    useEffect(() => {
      // Add CSS to prevent browser zoom globally when canvas is mounted
      const style = document.createElement("style");
      style.textContent = `
      .infinite-canvas-active {
        -webkit-user-zoom: none !important;
        -moz-user-zoom: none !important;
        -ms-user-zoom: none !important;
        user-zoom: none !important;
        zoom: reset !important;
      }
      
      .infinite-canvas-active * {
        -webkit-user-zoom: none !important;
        -moz-user-zoom: none !important;
        -ms-user-zoom: none !important;
        user-zoom: none !important;
      }
    `;
      document.head.appendChild(style);
      document.body.classList.add("infinite-canvas-active");

      return () => {
        document.head.removeChild(style);
        document.body.classList.remove("infinite-canvas-active");
      };
    }, []);

    // Add event listeners with proper passive/non-passive configuration
    useEffect(() => {
      const svgElement = svgRef.current;
      if (!svgElement) return;

      // Native DOM event handlers - properly typed
      const handleNativeWheel = (event: WheelEvent) => {
        handleWheel(event);
      };

      const handleNativeTouchStart = (event: TouchEvent) => {
        handleTouchStart(event);
      };

      const handleNativeTouchMove = (event: TouchEvent) => {
        handleTouchMove(event);
      };

      const handleNativeTouchEnd = (event: TouchEvent) => {
        handleTouchEnd();
      };

      // Non-passive event listeners for preventDefault support
      svgElement.addEventListener("wheel", handleNativeWheel, {
        passive: false,
      });
      svgElement.addEventListener("touchstart", handleNativeTouchStart, {
        passive: false,
      });
      svgElement.addEventListener("touchmove", handleNativeTouchMove, {
        passive: false,
      });
      svgElement.addEventListener("touchend", handleNativeTouchEnd, {
        passive: false,
      });

      return () => {
        svgElement.removeEventListener("wheel", handleNativeWheel);
        svgElement.removeEventListener("touchstart", handleNativeTouchStart);
        svgElement.removeEventListener("touchmove", handleNativeTouchMove);
        svgElement.removeEventListener("touchend", handleNativeTouchEnd);
      };
    }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

    // Add global event listeners
    useEffect(() => {
      const handleGlobalMouseMove = (event: MouseEvent) => {
        if (isPanning || isDraggingItem) {
          handleMouseMove(event as unknown as React.MouseEvent);
        }
      };

      const handleGlobalMouseUp = () => {
        handleMouseUp();
      };

      // Prevent swipe navigation on macOS
      const preventSwipeNavigation = (event: TouchEvent) => {
        if (event.touches.length > 1) {
          event.preventDefault();
        }
      };

      // Prevent trackpad swipe navigation
      const preventTrackpadSwipe = (event: WheelEvent) => {
        // Prevent horizontal scrolling that triggers swipe navigation
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
          event.preventDefault();
        }
      };

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("touchmove", preventSwipeNavigation, {
        passive: false,
      });
      document.addEventListener("wheel", preventTrackpadSwipe, {
        passive: false,
      });

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
        document.removeEventListener("touchmove", preventSwipeNavigation);
        document.removeEventListener("wheel", preventTrackpadSwipe);
      };
    }, [isPanning, isDraggingItem, handleMouseMove, handleMouseUp]);

    // Animation effect
    useEffect(() => {
      if (!animation) return;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - animation.startTime;
        const progress = Math.min(elapsed / animation.duration, 1);

        const easedProgress = animation.easing
          ? animation.easing(progress)
          : easeInOutCubic(progress);

        const currentViewport = {
          x:
            animation.from.x +
            (animation.to.x - animation.from.x) * easedProgress,
          y:
            animation.from.y +
            (animation.to.y - animation.from.y) * easedProgress,
          scale:
            animation.from.scale +
            (animation.to.scale - animation.from.scale) * easedProgress,
        };

        setViewport(currentViewport);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setAnimation(null);
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }, [animation]);

    // API methods
    const setViewportAnimated = useCallback(
      (
        newViewport: Partial<ViewportState>,
        options: { animate?: boolean; duration?: number } = {}
      ) => {
        const { animate = false, duration = 500 } = options;
        const targetViewport = { ...viewport, ...newViewport };

        // Clamp scale to limits
        targetViewport.scale = Math.max(
          minZoom,
          Math.min(maxZoom, targetViewport.scale)
        );

        if (animate) {
          setAnimation({
            from: viewport,
            to: targetViewport,
            startTime: Date.now(),
            duration,
            easing: easeInOutCubic,
          });
        } else {
          setViewport(targetViewport);
        }
      },
      [viewport, minZoom, maxZoom]
    );

    const fitToItems = useCallback(
      (
        itemIds: string[],
        options: { padding?: number; animate?: boolean; duration?: number } = {}
      ) => {
        const { padding = 50, animate = true, duration = 500 } = options;
        const bounds = getItemsBounds(items, itemIds);

        if (!bounds || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // Calculate scale to fit with padding
        const scaleX = (containerWidth - padding * 2) / bounds.width;
        const scaleY = (containerHeight - padding * 2) / bounds.height;
        const scale = Math.max(
          minZoom,
          Math.min(maxZoom, Math.min(scaleX, scaleY))
        );

        // Calculate center position
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;

        const targetViewport = {
          x: containerWidth / 2 - centerX * scale,
          y: containerHeight / 2 - centerY * scale,
          scale,
        };

        setViewportAnimated(targetViewport, { animate, duration });
      },
      [items, minZoom, maxZoom, setViewportAnimated]
    );

    const fitAll = useCallback(
      (
        options: { padding?: number; animate?: boolean; duration?: number } = {}
      ) => {
        const allItemIds = items.map(item => item.id);
        fitToItems(allItemIds, options);
      },
      [items, fitToItems]
    );

    const zoomToPoint = useCallback(
      (
        point: { x: number; y: number },
        scale: number,
        options: { animate?: boolean; duration?: number } = {}
      ) => {
        const { animate = true, duration = 500 } = options;
        const clampedScale = Math.max(minZoom, Math.min(maxZoom, scale));

        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

        const targetViewport = {
          x: centerX - point.x * clampedScale,
          y: centerY - point.y * clampedScale,
          scale: clampedScale,
        };

        setViewportAnimated(targetViewport, { animate, duration });
      },
      [minZoom, maxZoom, setViewportAnimated]
    );

    const reset = useCallback(
      (options: { animate?: boolean; duration?: number } = {}) => {
        setViewportAnimated({ x: 0, y: 0, scale: 1 }, options);
      },
      [setViewportAnimated]
    );

    const getViewport = useCallback(() => viewport, [viewport]);

    const selectItems = useCallback((itemIds: string[]) => {
      setSelectedItems(new Set(itemIds));
    }, []);

    const fitToItemsAndSelect = useCallback(
      (
        itemIds: string[],
        options: { padding?: number; animate?: boolean; duration?: number } = {}
      ) => {
        // First select the items
        selectItems(itemIds);
        // Then fit to them
        fitToItems(itemIds, options);
      },
      [selectItems, fitToItems]
    );

    const deselectItems = useCallback((itemIds: string[]) => {
      setSelectedItems(new Set(itemIds));
    }, []);

    // Expose API through ref
    useImperativeHandle(
      ref,
      () => ({
        setViewport: setViewportAnimated,
        fitToItems,
        fitAll,
        getViewport,
        reset,
        zoomToPoint,
        selectItems,
        fitToItemsAndSelect,
        deselectItems,
      }),
      [
        setViewportAnimated,
        fitToItems,
        fitAll,
        getViewport,
        reset,
        zoomToPoint,
        selectItems,
        fitToItemsAndSelect,
        deselectItems,
      ]
    );

    // Calculate transform string
    const transform = `translate(${viewport.x}, ${viewport.y}) scale(${viewport.scale})`;

    console.log(viewport);
    return (
      <div
        ref={containerRef}
        className={`relative h-full w-full cursor-grab overflow-hidden active:cursor-grabbing ${className}`}
        style={
          {
            touchAction: "none",
            overscrollBehavior: "none",
            WebkitOverscrollBehavior: "none",
            WebkitUserZoom: "none",
            WebkitTouchCallout: "none",
            WebkitTapHighlightColor: "transparent",
            userZoom: "none",
            zoom: "reset",
          } as React.CSSProperties
        }
      >
        <svg
          ref={svgRef}
          className="h-full w-full"
          onMouseDown={handleMouseDown}
        >
          {/* Background pattern for visual reference */}
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
              patternTransform={transform}
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <defs>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
            </filter>

            {/* Animated pulsing filter for selected elements */}
            <filter
              id="selectedPulse"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="3"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.02
                        0 0 0 0 0.48
                        0 0 0 0 1
                        0 0 0 0.8 0"
                result="glow"
              />
              <feOffset in="glow" dx="0" dy="0" result="glowOffset" />
              <feMerge>
                <feMergeNode in="glowOffset" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>

              {/* Pulsing animation */}
              <animate
                attributeName="stdDeviation"
                values="3;6;3"
                dur="2s"
                repeatCount="indefinite"
              />
            </filter>

            {/* Alternative subtle glow filter */}
            <filter
              id="selectedGlow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="4"
                floodColor="#007AFF"
                floodOpacity="0.6"
              >
                <animate
                  attributeName="stdDeviation"
                  values="2;6;2"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="flood-opacity"
                  values="0.3;0.8;0.3"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </feDropShadow>
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Additional children */}

          {/* Main canvas content */}
          <g transform={transform}>
            {children}

            {/* Render items */}
            {items.map(item => (
              <g key={item.id}>
                {/* Selection indicator - only for selectable items */}
                {selectedItems.has(item.id) && item.interaction.selectable && (
                  <rect
                    x={item.x - 2}
                    y={item.y - 2}
                    width={item.width + 4}
                    height={item.height + 4}
                    fill="none"
                    stroke="#007AFF"
                    strokeWidth={2 / viewport.scale}
                    strokeDasharray={`${4 / viewport.scale} ${
                      2 / viewport.scale
                    }`}
                  />
                )}

                {/* Non-interactive indicator */}
                {!item.interaction.selectable &&
                  !item.interaction.draggable && (
                    <rect
                      x={item.x - 1}
                      y={item.y - 1}
                      width={item.width + 2}
                      height={item.height + 2}
                      fill="none"
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth={1 / viewport.scale}
                      strokeDasharray={`${2 / viewport.scale} ${2 / viewport.scale}`}
                    />
                  )}

                {/* Draggable-only indicator */}
                {!item.interaction.selectable && item.interaction.draggable && (
                  <rect
                    x={item.x - 1}
                    y={item.y - 1}
                    width={item.width + 2}
                    height={item.height + 2}
                    fill="none"
                    stroke="rgba(255,165,0,0.5)"
                    strokeWidth={1 / viewport.scale}
                    strokeDasharray={`${3 / viewport.scale} ${1 / viewport.scale}`}
                  />
                )}

                {/* Item background */}
                {/* <rect
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  fill="rgba(255,255,255,0.5)"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={1 / viewport.scale}
                  rx={4 / viewport.scale}
                /> */}

                {/* Item content */}

                <foreignObject
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  style={{
                    pointerEvents: "all",
                    cursor: item.interaction.draggable
                      ? "grab"
                      : item.interaction.selectable
                        ? "pointer"
                        : "default",
                  }}
                >
                  <div
                    className={`h-full w-full p-2 text-sm ${
                      item.interaction.selectable || item.interaction.draggable
                        ? item.interaction.draggable
                          ? "cursor-grab"
                          : "cursor-pointer"
                        : "cursor-default opacity-75"
                    }`}
                  >
                    {item.render({
                      selected: selectedItems.has(item.id),
                      viewport,
                      item,
                      isDragging: draggedItemId === item.id,
                      isPanning,
                      isAnimating: animation !== null,
                    })}
                  </div>
                </foreignObject>

                {/** Item reveal on select content */}
                <AnimatePresence>
                  {selectedItems.has(item.id) && Boolean(item?.expansion) && (
                    <foreignObject
                      x={item.x + item.expansion!.dx}
                      y={item.y + item.expansion!.dy}
                      width={item.expansion!.width}
                      height={item.expansion!.height}
                      transform={`translate(${item.x + item.expansion!.dx}, ${item.y + item.expansion!.dy}) scale(${1 / viewport.scale}) translate(${-(item.x + item.expansion!.dx)}, ${-(item.y + item.expansion!.dy)})`}
                    >
                      <motion.div
                        className="h-full w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{
                          opacity: 0,
                          transition: { duration: 0.5, delay: 0 },
                        }}
                        transition={{ duration: 1, delay: 1 }}
                      >
                        {item.expansion?.render({
                          selected: selectedItems.has(item.id),
                          parent: item,
                          viewport,
                          isDragging: draggedItemId === item.id,
                          isPanning,
                          isAnimating: animation !== null,
                        })}
                      </motion.div>
                    </foreignObject>
                  )}
                </AnimatePresence>
              </g>
            ))}
          </g>
        </svg>

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() =>
              setViewport(prev => ({
                ...prev,
                scale: Math.min(maxZoom, prev.scale * 1.2),
              }))
            }
            className="rounded bg-white p-2 shadow hover:bg-gray-50"
          >
            +
          </button>
          <button
            onClick={() =>
              setViewport(prev => ({
                ...prev,
                scale: Math.max(minZoom, prev.scale / 1.2),
              }))
            }
            className="rounded bg-white p-2 shadow hover:bg-gray-50"
          >
            −
          </button>
          <button
            onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}
            className="rounded bg-white p-2 text-xs shadow hover:bg-gray-50"
          >
            ⌂
          </button>
        </div>

        {/* Zoom indicator */}
        <div className="absolute right-4 bottom-4 rounded bg-white px-2 py-1 text-xs shadow">
          {Math.round(viewport.scale * 100)}%
        </div>
      </div>
    );
  }
);

InfiniteCanvas.displayName = "InfiniteCanvas";

export default InfiniteCanvas;
