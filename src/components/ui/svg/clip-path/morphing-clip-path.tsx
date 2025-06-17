"use client";
import { interpolate } from 'flubber';
import { motion, animate, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

// Utility function to calculate bounding box of an SVG path
function getPathBounds(pathString: string): [number, number, number, number] {
  // Create a temporary SVG element to measure the path
  if (typeof document === 'undefined') {
    // Fallback for SSR - return full bounds
    return [0, 0, 100, 100];
  }
  
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathString);
    svg.appendChild(path);
    svg.style.position = 'absolute';
    svg.style.visibility = 'hidden';
    svg.style.width = '100px';
    svg.style.height = '100px';
    svg.setAttribute('viewBox', '0 0 100 100');
    document.body.appendChild(svg);
    
    const bbox = path.getBBox();
    document.body.removeChild(svg);
    
    // Add padding (10% of the smaller dimension)
    const padding = Math.min(bbox.width, bbox.height) * 0.1;
    
    return [
      Math.max(0, bbox.x - padding),
      Math.max(0, bbox.y - padding), 
      Math.min(100, bbox.width + padding * 2),
      Math.min(100, bbox.height + padding * 2)
    ];
  } catch (error) {
    console.warn('Failed to calculate path bounds:', error);
    return [0, 0, 100, 100];
  }
}

export interface ClipPathContent {
  content: React.ReactNode;
  label?: string;
  /** Optional manual focus box override [x, y, width, height] as ratios (0-1) */
  focusBox?: [number, number, number, number];
}

interface MorphingClipPathProps {
  /** Array of SVG path strings to morph between */
  clipPaths: string[];
  /** Array of content to show for each clip path */
  contentGroups: ClipPathContent[];
  width: number;
  height: number;
  /** Container className */
  className?: string;
  /** Whether to show manual controls */
  showControls?: boolean;
  /** Whether to auto-cycle through shapes */
  autoCycle?: boolean;
  /** Auto-cycle interval in milliseconds */
  cycleInterval?: number;
  /** Animation duration for morphing */
  morphDuration?: number;
  /** Whether to show the clip path outline */
  showOutline?: boolean;
  /** Background pattern or color */
  background?: React.ReactNode;
  /** Initial path index */
  initialIndex?: number;
  /** Whether to apply clipping (useful for comparisons) */
  clipContent?: boolean;
  /** Mask effect type: 'solid' | 'gradient' | 'pattern' | 'feathered' | 'glow' */
  maskEffect?: 'solid' | 'gradient' | 'pattern' | 'feathered' | 'glow';
  /** Opacity of the masked (hidden) areas (0-1). Default is 0 (fully hidden) */
  maskedOpacity?: number;
  /** Blur amount for feathered effect (px) */
  featherAmount?: number;
}

const MorphingClipPath: React.FC<MorphingClipPathProps> = ({
  clipPaths,
  contentGroups,
  width,
  height,
  className = "w-96 h-96 border rounded-lg bg-gray-50",
  showControls = true,
  autoCycle = false,
  cycleInterval = 4000,
  morphDuration = 1.2,
  showOutline = true,
  background,
  initialIndex = 0,
  clipContent = true,
  maskEffect = 'solid',
  maskedOpacity = 0,
  featherAmount = 10
}) => {
  const [pathIndex, setPathIndex] = useState(initialIndex);
  const [clipPathId] = useState(() => `morphingClipper-${Math.random().toString(36).substr(2, 9)}`);
  
  // Flubber-based morphing setup
  const progress = useMotionValue(pathIndex);
  const arrayOfIndex = clipPaths.map((_, i) => i);
  
  const morphingPath = useTransform(progress, arrayOfIndex, clipPaths, {
    mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 1 })
  });

  const viewBox = `0 0 ${width} ${height}`;

  // ViewBox morphing setup - calculate focus boxes automatically or use manual overrides
  const focusViewBoxes = contentGroups.map((group, index) => {
    if (group.focusBox) {
      // Use manual override
      return `${group.focusBox[0] * width} ${group.focusBox[1] * height} ${group.focusBox[2] * width} ${group.focusBox[3] * height}`;
    } else {
      // Calculate automatically based on clip path bounds
      const bounds = getPathBounds(clipPaths[index]);
      return `${bounds[0] * width / 100} ${bounds[1] * height / 100} ${bounds[2] * width / 100} ${bounds[3] * height / 100}`;
    }
  });
  
  const hasFocusViewBoxes = true; // Always enabled now with automatic calculation
  
  const morphingViewBox = useTransform(
    progress, 
    arrayOfIndex, 
    focusViewBoxes,
    {
      mixer: (a, b) => {
        // Parse viewBox strings (format: "x y width height")
        const parseViewBox = (vb: string) => vb.split(' ').map(Number);
        const aValues = parseViewBox(a);
        const bValues = parseViewBox(b);
        
        // Interpolate each value
        return (t: number) => {
          const interpolated = aValues.map((aVal, i) => 
            aVal + (bValues[i] - aVal) * t
          );
          return interpolated.join(' ');
        };
      }
    }
  );

  // Animation logic
  useEffect(() => {
    const animation = animate(progress, pathIndex, {
      duration: morphDuration,
      ease: "easeInOut",
      delay: 0.3,
    });
    return () => { animation.stop(); };
  }, [pathIndex, progress, morphDuration]);

  // Auto-cycle through shapes
  useEffect(() => {
    if (!autoCycle) return;
    
    const interval = setInterval(() => {
      setPathIndex((prev) => (prev + 1) % clipPaths.length);
    }, cycleInterval);
    
    return () => clearInterval(interval);
  }, [clipPaths.length, autoCycle, cycleInterval]);

  const defaultBackground = (
    <>
      <defs>
        <pattern id="morphingBackgroundPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#f8f9fa" />
          <circle cx="5" cy="5" r="1" fill="#e9ecef" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#morphingBackgroundPattern)" />
    </>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.svg 
        viewBox={hasFocusViewBoxes ? morphingViewBox : viewBox} 
        className={className}
        // style={{ aspectRatio: `${width} / ${height}` }}
        width={width}
        height={height}
      >
        {/* Background */}
        {background || defaultBackground}
        
        {/* Filters for effects */}
        <defs>
          <filter id={`${clipPathId}-blur`}>
            <feGaussianBlur stdDeviation={featherAmount} />
          </filter>

          <linearGradient id={`${clipPathId}-gradient`} gradientTransform="rotate(45)">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>

          <pattern id={`${clipPathId}-pattern`} patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="8" fill="white" />
            <circle cx="10" cy="10" r="4" fill="black" />
          </pattern>

          <filter id={`${clipPathId}-glow`}>
            <feGaussianBlur stdDeviation="2" />
            <feComposite operator="over" in="SourceGraphic" />
          </filter>
        </defs>

        {/* Mask definition */}
        <defs>
          <mask id={clipPathId}>
            {/* Background with base opacity */}
            <rect 
              x="0" 
              y="0" 
              width={width} 
              height={height} 
              fill={`rgb(${maskedOpacity * 255}, ${maskedOpacity * 255}, ${maskedOpacity * 255})`} 
            />
            
            {/* Effect-specific path rendering */}
            {maskEffect === 'solid' && (
              <motion.path d={morphingPath} fill="white" />
            )}
            
            {maskEffect === 'gradient' && (
              <motion.path d={morphingPath} fill={`url(#${clipPathId}-gradient)`} />
            )}
            
            {maskEffect === 'pattern' && (
              <motion.path d={morphingPath} fill={`url(#${clipPathId}-pattern)`} />
            )}
            
            {maskEffect === 'feathered' && (
              <motion.path 
                d={morphingPath} 
                fill="white"
                filter={`url(#${clipPathId}-blur)`}
              />
            )}
            
            {maskEffect === 'glow' && (
              <motion.path 
                d={morphingPath} 
                fill="white"
                filter={`url(#${clipPathId}-glow)`}
              />
            )}
          </mask>
        </defs>

        {/* Content that gets masked */}
        <g mask={`url(#${clipPathId})`}>
          <AnimatePresence mode="wait">
            <image href="https://placehold.co/100x100" x="0" y="0" width={width} height={height} />
            <motion.g
              key={pathIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              {contentGroups[pathIndex]?.content}
            </motion.g>
          </AnimatePresence>
        </g>

        {/* Optional: Show the morphing mask outline */}
        {showOutline && (
          <motion.path
            d={morphingPath}
            fill="none"
            stroke="#666"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity={0.3}
          />
        )}
      </motion.svg>

      {/* Manual controls */}
      {showControls && (
        <div className="flex gap-2 flex-wrap">
          {contentGroups.map((group, index) => (
            <button
              key={index}
              onClick={() => setPathIndex(index)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                pathIndex === index
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {group.label || `Shape ${index + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MorphingClipPath;