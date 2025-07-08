import { motion, useDragControls, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

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
  afterLabel = "After"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Use motion value for smooth dragging
  const [containerWidth, setContainerWidth] = useState(1920);
  const previousWidthRef = useRef(1920); // Store previous width for ratio calculation

  const x = useMotionValue(containerWidth / 2);


  // Transform x position directly to pixels for clip path
  const clipPath = useTransform(x, (value) => `inset(0px ${containerWidth - value}px 0px 0px)`);


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
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Handle clicks anywhere on the container
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    // Animate to the clicked position
    x.set(clickX);
  }, [x]);

  // Start drag from anywhere in the container
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    // Set position immediately and start drag
    x.set(clickX);
    dragControls.start(e);
  }, [x, dragControls]);

  return (
    <div className="w-full h-full !dark:border !dark:border-gray-400 !dark:shadow-none relative my-8  border-b border-t border-gray-400 bg-white dark:bg-[#0B0B09] sm:border-l sm:border-r sm:border-none sm:shadow-sm">
      <div
        ref={containerRef}
        className="flex h-full w-full px-4 py-6  overflow-hidden !p-0 relative select-none cursor-ew-resize"
        onClick={handleContainerClick}
        onPointerDown={handlePointerDown}
        style={{ touchAction: 'none' }}
      >
        {/* Before Content (Background) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {afterContent}
        </div>

        {/* After Content (Clipped) */}
        <motion.div
          style={{
            clipPath: clipPath
          }}
          initial={{ clipPath: `inset(0px ${containerWidth - x.get()}px 0px 0px)` }}
          className="absolute inset-0 w-full h-full pointer-events-none"
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
          className="absolute z-10 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex w-32 h-16 cursor-ew-resize outline-none focus-visible:shadow-focus-ring-button "
          whileHover={{ filter: "brightness(1.2)" }}
          initial={{ filter: "brightness(1)" }}
        >
          <div className="h-full w-full bg-purple-light transition-colors hover:bg-white/80 rounded-sm shadow-lg flex items-center justify-center gap-4">
            <ChevronLeft className="w-16 h-16 text-white" />
            <ChevronRight className="w-16 h-16 text-white" />
          </div>

          {/* Handle Icon */}

        </motion.div>

        {/* Labels */}
        {beforeLabel && (
          <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm font-medium pointer-events-none">
            {beforeLabel}
          </div>
        )}
        {afterLabel && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm font-medium pointer-events-none">
            {afterLabel}
          </div>
        )}

        {/* Visual hints for draggable areas */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/5 to-transparent pointer-events-none opacity-0 hover:opacity-100 transition-opacity" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/5 to-transparent pointer-events-none opacity-0 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default ClipPathComparator;

export type { ClipPathComparatorProps };

