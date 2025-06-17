'use client';

import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

interface FocusImageWebkitProps {
  src: string;
  alt: string;
  className?: string;
  focusX?: number;
  focusY?: number;
  size?: number;
  interactive?: boolean;
  animate?: boolean;
  dimOpacity?: number;
}

const FocusImageWebkit = ({
  src,
  alt,
  className = '',
  focusX = 50,
  focusY = 50,
  size = 200,
  interactive = false,
  animate = false,
  dimOpacity = 0.3
}: FocusImageWebkitProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update container size on mount and resize
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setMousePosition({ x, y });
  };

  // Calculate position for non-interactive mode
  const staticX = (focusX / 100) * (containerSize.width || 400);
  const staticY = (focusY / 100) * (containerSize.height || 300);

  const currentX = interactive ? mousePosition.x : staticX;
  const currentY = interactive ? mousePosition.y : staticY;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Base dimmed image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ filter: `brightness(${dimOpacity})` }}
      />
      
      {/* Focused overlay with WebKit mask */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
          maskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }}
        animate={{
          WebkitMaskPosition: `${currentX - (size/2)}px ${currentY - (size/2)}px`,
          WebkitMaskSize: `${size}px`,
          maskPosition: `${currentX - (size/2)}px ${currentY - (size/2)}px`,
          maskSize: `${size}px`,
          ...(animate ? {
            WebkitMaskSize: [`${size - 20}px`, `${size + 20}px`, `${size - 20}px`],
            maskSize: [`${size - 20}px`, `${size + 20}px`, `${size - 20}px`]
          } : {})
        }}
        transition={{
          WebkitMaskPosition: { type: "spring", stiffness: 300, damping: 30 },
          maskPosition: { type: "spring", stiffness: 300, damping: 30 },
          ...(animate ? {
            WebkitMaskSize: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            maskSize: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          } : {})
        }}
      />

      {/* Focus indicator ring */}
      <motion.div
        className="absolute pointer-events-none border-2 border-white rounded-full shadow-lg"
        style={{
          width: `${size * 0.8}px`,
          height: `${size * 0.8}px`,
        }}
        animate={{
          left: `${currentX - (size * 0.8)/2}px`,
          top: `${currentY - (size * 0.8)/2}px`,
          ...(animate ? {
            scale: [0.9, 1.1, 0.9],
            opacity: [0.7, 1, 0.7]
          } : {})
        }}
        transition={{
          left: { type: "spring", stiffness: 300, damping: 30 },
          top: { type: "spring", stiffness: 300, damping: 30 },
          ...(animate ? {
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          } : {})
        }}
      />

      {/* Interactive indicator */}
      {interactive && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded z-30">
          Move mouse to focus
        </div>
      )}
    </div>
  );
};

export default FocusImageWebkit; 