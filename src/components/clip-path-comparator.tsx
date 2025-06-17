import React, { useState, useRef, useCallback } from 'react';

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
  const [sliderPosition, setSliderPosition] = useState(38.04);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    setSliderPosition(percentage);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    setSliderPosition(percentage);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div className="w-full h-full !dark:border !dark:border-gray-400 !dark:shadow-none relative my-8 rounded-xl border-b border-t border-gray-400 bg-white dark:bg-[#0B0B09] sm:border-l sm:border-r sm:border-none sm:shadow-sm">
      <div 
        ref={containerRef}
        className="flex h-full w-full px-4 py-6 sm:rounded-xl overflow-hidden !p-0 relative select-none"
      >
        {/* Before Content (Background) */}
        <div className="absolute inset-0 w-full h-full">
          {beforeContent}
        </div>
        
        {/* After Content (Clipped) */}
        <div 
          style={{ 
            clipPath: `inset(0px ${100 - sliderPosition}% 0px 0px)`,
            transition: isDragging ? 'none' : 'clip-path 0.1s ease-out'
          }}
          className="absolute inset-0 w-full h-full"
        >
          {afterContent}
        </div>
        
        {/* Slider Handle */}
        <button 
          aria-label="Drag to compare content"
          className={`absolute inset-y-0 z-10 flex h-full w-4 cursor-ew-resize outline-none focus-visible:shadow-focus-ring-button md:w-2.5 transition-opacity ${
            isDragging ? 'opacity-100' : 'opacity-75 hover:opacity-100'
          }`}
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="h-full w-1.5 bg-white/60 transition-colors hover:bg-white/80 rounded-full shadow-lg" />
          
          {/* Handle Icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <path d="M8 7L4 12l4 5M16 7l4 5-4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
        
        {/* Labels */}
        {beforeLabel && (
          <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm font-medium">
            {beforeLabel}
          </div>
        )}
        {afterLabel && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm font-medium">
            {afterLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClipPathComparator;