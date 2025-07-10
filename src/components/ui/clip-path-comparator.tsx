import {
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

interface ClipPathComparatorProps {
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
}

const ClipPathComparator: React.FC<ClipPathComparatorProps> = ({
  beforeContent,
  afterContent,
  beforeLabel = "Before",
  afterLabel = "After",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Use motion value for smooth dragging
  const [containerWidth, setContainerWidth] = useState(1920);
  const previousWidthRef = useRef(1920); // Store previous width for ratio calculation

  const x = useMotionValue(containerWidth / 2);

  // Transform x position directly to pixels for clip path
  const clipPath = useTransform(
    x,
    value => `inset(0px ${containerWidth - value}px 0px 0px)`
  );

  // Update container width on mount and resize
  React.useEffect(() => {
    const updateWidth = () => {
      console.log("updateWidth");
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const ratio = x.get() / previousWidthRef.current; // Use previous width for ratio
        x.set(ratio * width);
        setContainerWidth(width);
        previousWidthRef.current = width; // Update previous width after calculation
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Handle clicks anywhere on the container
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      // Animate to the clicked position
      x.set(clickX);
    },
    [x]
  );

  // Start drag from anywhere in the container
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      // Set position immediately and start drag
      x.set(clickX);
      dragControls.start(e);
    },
    [x, dragControls]
  );

  return (
    <div className="!dark:border !dark:border-gray-400 !dark:shadow-none relative my-8 h-full w-full border-t border-b border-gray-400 bg-white sm:border-r sm:border-l sm:border-none sm:shadow-sm dark:bg-[#0B0B09]">
      <div
        ref={containerRef}
        className="relative flex h-full w-full cursor-ew-resize overflow-hidden !p-0 px-4 py-6 select-none"
        onClick={handleContainerClick}
        onPointerDown={handlePointerDown}
        style={{ touchAction: "none" }}
      >
        {/* Before Content (Background) */}
        <div className="pointer-events-none absolute inset-0 h-full w-full">
          {afterContent}
        </div>

        {/* After Content (Clipped) */}
        <motion.div
          style={{
            clipPath: clipPath,
          }}
          initial={{
            clipPath: `inset(0px ${containerWidth - x.get()}px 0px 0px)`,
          }}
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {beforeContent}
        </motion.div>

        {/* Draggable Slider Handle */}
        <motion.div
          drag="x"
          dragControls={dragControls}
          dragConstraints={{ left: 0, right: containerWidth }}
          dragElastic={0}
          dragMomentum={false}
          style={{
            x,
          }}
          className="focus-visible:shadow-focus-ring-button absolute top-1/2 z-10 flex h-16 w-32 -translate-x-1/2 -translate-y-1/2 transform cursor-ew-resize outline-none"
          whileHover={{ filter: "brightness(1.2)" }}
          initial={{ filter: "brightness(1)" }}
        >
          <div className="bg-purple-light flex h-full w-full items-center justify-center gap-4 rounded-sm shadow-lg transition-colors hover:bg-white/80">
            <ChevronLeft className="h-16 w-16 text-white" />
            <ChevronRight className="h-16 w-16 text-white" />
          </div>

          {/* Handle Icon */}
        </motion.div>

        {/* Labels */}
        {beforeLabel && (
          <div className="pointer-events-none absolute top-4 left-4 rounded bg-black/50 px-2 py-1 text-sm font-medium text-white">
            {beforeLabel}
          </div>
        )}
        {afterLabel && (
          <div className="pointer-events-none absolute top-4 right-4 rounded bg-black/50 px-2 py-1 text-sm font-medium text-white">
            {afterLabel}
          </div>
        )}

        {/* Visual hints for draggable areas */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/5 to-transparent opacity-0 transition-opacity hover:opacity-100" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/5 to-transparent opacity-0 transition-opacity hover:opacity-100" />
      </div>
    </div>
  );
};

export default ClipPathComparator;

export type { ClipPathComparatorProps };
