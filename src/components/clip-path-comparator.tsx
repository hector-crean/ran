import { motion, useDragControls, useMotionValue, useTransform } from 'framer-motion';
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
  const x = useMotionValue(0);
  const [containerWidth, setContainerWidth] = useState(1000);

  // Transform x position to percentage
  const sliderPosition = useTransform(x,
    [0, containerWidth],
    [0, 100]
  );

  // Update container width on mount and resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        // Set initial position to 38.04% of width
        x.set(width * 0.3804);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [x]);

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
    <div className="w-full h-full !dark:border !dark:border-gray-400 !dark:shadow-none relative my-8 rounded-xl border-b border-t border-gray-400 bg-white dark:bg-[#0B0B09] sm:border-l sm:border-r sm:border-none sm:shadow-sm">
      <div
        ref={containerRef}
        className="flex h-full w-full px-4 py-6 sm:rounded-xl overflow-hidden !p-0 relative select-none cursor-ew-resize"
        onClick={handleContainerClick}
        onPointerDown={handlePointerDown}
        style={{ touchAction: 'none' }}
      >
        {/* Before Content (Background) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {beforeContent}
        </div>

        {/* After Content (Clipped) */}
        <motion.div
          style={{
            clipPath: useTransform(sliderPosition, (pos) => `inset(0px ${100 - pos}% 0px 0px)`)
          }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {afterContent}
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
            left: 0,
            transform: 'translateX(-50%)'
          }}
          className="absolute inset-y-0 z-10 flex h-full w-4 cursor-ew-resize outline-none focus-visible:shadow-focus-ring-button md:w-2.5"
          whileHover={{ opacity: 1 }}
          initial={{ opacity: 0.75 }}
        >
          <div className="h-full w-1.5 bg-white/60 transition-colors hover:bg-white/80 rounded-full shadow-lg" />

          {/* Handle Icon */}
          <div className="cursor-pointer absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <path d="M8 7L4 12l4 5M16 7l4 5-4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
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
