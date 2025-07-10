"use client";
import { interpolate } from "flubber";
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useDragControls,
  useMotionTemplate,
} from "motion/react";
import { useState, useEffect } from "react";

interface MorphingMaskItem {
  path: string;
  content: React.ReactNode;
  viewbox: [number, number, number, number];
  centroid: [number, number];
  id: string;
  /** Optional manual focus box override [x, y, width, height] as ratios (0-1) */
  focusBox?: [number, number, number, number];
}

interface MorphingMaskProps {
  masks: MorphingMaskItem[];
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
  maskEffect?: "solid" | "gradient" | "pattern" | "feathered" | "glow";
  /** Opacity of the masked (hidden) areas (0-1). Default is 0 (fully hidden) */
  maskedOpacity?: number;
  /** Blur amount for feathered effect (px) */
  featherAmount?: number;
}

const MorphingMask: React.FC<MorphingMaskProps> = ({
  masks,
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
  maskEffect = "solid",
  maskedOpacity = 0,
  featherAmount = 10,
}) => {
  // Find initial id
  const initialId = masks[initialIndex]?.id || masks[0]?.id;
  const [prevId, setPrevId] = useState(initialId);
  const [currentId, setCurrentId] = useState(initialId);
  const [clipPathId] = useState(
    () => `morphingClipper-${Math.random().toString(36).substr(2, 9)}`
  );

  const transitionProgress = useMotionValue(1);

  // Find mask objects by id
  const prevMask = masks.find(m => m.id === prevId) || masks[0];
  const currentMask = masks.find(m => m.id === currentId) || masks[0];

  const morphingPath = useTransform(
    transitionProgress,
    [0, 1],
    [prevMask.path, currentMask.path],
    {
      mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 1 }),
    }
  );

  const viewbox = useMotionValue<[number, number, number, number]>([
    0,
    0,
    width,
    height,
  ]);
  const viewboxStr = useTransform(
    viewbox,
    v => `${v[0]} ${v[1]} ${v[2]} ${v[3]}`
  );

  // const PADDING = 100;

  // const currentViewBox = padViewBox(prevMask?.viewbox, PADDING, width, height);
  // const nextViewBox = padViewBox(currentMask?.viewbox, PADDING, width, height);

  // const morphingViewBox = useTransform(
  //   transitionProgress,
  //   [0, 1],
  //   [currentViewBox, nextViewBox],
  //   {
  //     mixer: (a, b) => {
  //       return (t: number) => {
  //         return [
  //           a[0] + (b[0] - a[0]) * t,
  //           a[1] + (b[1] - a[1]) * t,
  //           a[2] + (b[2] - a[2]) * t,
  //           a[3] + (b[3] - a[3]) * t,
  //         ];
  //       };
  //     },
  //   }
  // );

  // Animation logic
  useEffect(() => {
    if (prevId !== currentId) {
      transitionProgress.set(0);
      const animation = animate(transitionProgress, 1, {
        duration: morphDuration,
        ease: "easeInOut",
        delay: 0.3,
        onComplete: () => setPrevId(currentId),
      });
      return () => animation.stop();
    }
  }, [currentId]);

  // Auto-cycle through shapes
  useEffect(() => {
    if (!autoCycle) return;
    const ids = masks.map(m => m.id);
    const interval = setInterval(() => {
      const currentIdx = ids.indexOf(currentId);
      const nextIdx = (currentIdx + 1) % ids.length;
      setCurrentId(ids[nextIdx]);
    }, cycleInterval);
    return () => clearInterval(interval);
  }, [masks, autoCycle, cycleInterval, currentId]);

  const defaultBackground = (
    <>
      <defs>
        <pattern
          id="morphingBackgroundPattern"
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <rect width="10" height="10" fill="#f8f9fa" />
          <circle cx="5" cy="5" r="1" fill="#e9ecef" />
        </pattern>
      </defs>
      <rect
        width={width}
        height={height}
        fill="url(#morphingBackgroundPattern)"
      />
    </>
  );

  const dragControls = useDragControls();

  const transform3d = useTransform(viewbox, v => `translate(0,0)`);
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      style={{ touchAction: "none" }}
      onPointerDown={event => dragControls.start(event)}
    >
      <motion.div
        drag
        dragListener={false}
        className="h-full w-full cursor-grab items-center justify-center rounded-lg border bg-gray-50 active:cursor-grabbing"
        style={{ transform: transform3d }}
        dragControls={dragControls}
        onDrag={(e, info) => {
          viewbox.set([
            viewbox.get()[0] - info.delta.x,
            viewbox.get()[1] - info.delta.y,
            viewbox.get()[2],
            viewbox.get()[3],
          ]);
        }}
      >
        <motion.svg
          viewBox={viewboxStr}
          // viewBox={viewBox}
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

            <linearGradient
              id={`${clipPathId}-gradient`}
              gradientTransform="rotate(45)"
            >
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="black" />
            </linearGradient>

            <pattern
              id={`${clipPathId}-pattern`}
              patternUnits="userSpaceOnUse"
              width="20"
              height="20"
            >
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
                fill={`rgb(${maskedOpacity * 255}, ${maskedOpacity * 255}, ${
                  maskedOpacity * 255
                })`}
              />

              {/* Effect-specific path rendering */}
              {maskEffect === "solid" && (
                <motion.path d={morphingPath} fill="white" />
              )}

              {maskEffect === "gradient" && (
                <motion.path
                  d={morphingPath}
                  fill={`url(#${clipPathId}-gradient)`}
                />
              )}

              {maskEffect === "pattern" && (
                <motion.path
                  d={morphingPath}
                  fill={`url(#${clipPathId}-pattern)`}
                />
              )}

              {maskEffect === "feathered" && (
                <motion.path
                  d={morphingPath}
                  fill="white"
                  filter={`url(#${clipPathId}-blur)`}
                />
              )}

              {maskEffect === "glow" && (
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
            <image
              href="/world-image.png"
              x="0"
              y="0"
              width={width}
              height={height}
            />
            <AnimatePresence mode="wait">
              <motion.g
                key={currentId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                {currentMask?.content}
              </motion.g>
            </AnimatePresence>
          </g>

          <motion.g>
            {masks.map(mask => (
              <g key={mask.id} onPointerDown={() => setCurrentId(mask.id)}>
                <motion.path
                  whileHover={{
                    fill: "rgba(1,0,0,0.8)",
                    transition: { duration: 0.2 },
                  }}
                  d={mask.path}
                  fill="rgba(0,0,0,0)"
                  stroke="#666"
                  strokeWidth="0.5"
                  opacity={0.3}
                  style={{ pointerEvents: "auto", cursor: "pointer" }}
                />
              </g>
            ))}
          </motion.g>

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
      </motion.div>

      {/* Manual controls */}
      {showControls && (
        <div className="flex flex-wrap gap-2">
          {masks.map(group => (
            <button
              key={group.id}
              onClick={() => setCurrentId(group.id)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                currentId === group.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {group.id || `Shape`}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MorphingMask;

// Utility to pad a viewBox
function padViewBox(
  viewBox: [number, number, number, number],
  padding: number,
  maxWidth: number,
  maxHeight: number
): [number, number, number, number] {
  if (!viewBox) return [0, 0, maxWidth, maxHeight];
  const [x, y, w, h] = viewBox;
  const padX = Math.min(padding, x, maxWidth - (x + w));
  const padY = Math.min(padding, y, maxHeight - (y + h));
  return [
    Math.max(0, x - padX),
    Math.max(0, y - padY),
    Math.min(maxWidth, w + padX * 2),
    Math.min(maxHeight, h + padY * 2),
  ];
}
