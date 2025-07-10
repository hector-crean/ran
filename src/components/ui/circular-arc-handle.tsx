import { HandlerArgs } from "@/components/ui/drag";
import { clamp } from "@/lib/utils";
import {
  motion,
  MotionValue,
  useMotionTemplate,
  useTransform,
} from "motion/react";
import { ReactNode } from "react";

interface CircularArcHandleProps {
  progress: MotionValue<number>;
  dragAngle: MotionValue<number>;
  dragging: boolean;
  onDragStart: () => void;
  onDragMove: (info: { delta: { x: number; y: number } }) => void;
  onDragEnd: () => void;
  radius?: number;
  strokeWidth?: number;
  baseColor?: string;
  activeColor?: string;
  perspective?: number;
  children?: ReactNode;
  // Optional custom drag handlers for use with custom Drag implementation
  customDragHandlers?: {
    onDragStart: (args: HandlerArgs) => void;
    onDragMove: (args: HandlerArgs) => void;
    onDragEnd: (args: HandlerArgs) => void;
  };
}

export const CircularArcHandle = ({
  progress,
  dragAngle,
  dragging,
  onDragStart,
  onDragMove,
  onDragEnd,
  radius = 45,
  strokeWidth = 10,
  baseColor = "#e2e8f0",
  activeColor = "#3b82f6",
  perspective = 1000,
  children,
  customDragHandlers,
}: CircularArcHandleProps) => {
  const HANDLE_RADIUS = 0.05;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * HANDLE_RADIUS;
  const dashOffset = circumference - arcLength;

  const transform3d = useMotionTemplate`rotate3d(1,0,0,-80deg)`;
  const handleTransform = useTransform(
    dragAngle,
    v => `rotate(${clamp(v, 0, 0.8 * 360)}deg)`
  );

  // Use custom drag handlers if provided, otherwise use Framer Motion handlers
  const dragHandlers = customDragHandlers
    ? {
        onDragStart: (event: unknown, info: unknown) => {
          // Convert Framer Motion event/info to HandlerArgs format
          const args: HandlerArgs = {
            dx: info.delta.x,
            dy: info.delta.y,
            x: info.point?.x || 0,
            y: info.point?.y || 0,
            isDragging: true,
            event: event,
          };
          customDragHandlers.onDragStart(args);
        },
        onDrag: (e: unknown, info: unknown) => {
          // Convert Framer Motion info to HandlerArgs format
          const args: HandlerArgs = {
            dx: info.delta.x,
            dy: info.delta.y,
            x: info.point?.x || 0,
            y: info.point?.y || 0,
            isDragging: true,
            event: e,
          };
          customDragHandlers.onDragMove(args);
        },
        onDragEnd: (event: unknown, info: unknown) => {
          const args: HandlerArgs = {
            dx: info.delta.x,
            dy: info.delta.y,
            x: info.point?.x || 0,
            y: info.point?.y || 0,
            isDragging: false,
            event: event,
          };
          customDragHandlers.onDragEnd(args);
        },
      }
    : {
        onDragStart: onDragStart,
        onDrag: (e: unknown, info: unknown) => onDragMove(info),
        onDragEnd: onDragEnd,
      };

  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center"
      // style={{ perspective: perspective, touchAction: "none" }}
    >
      <motion.div
        drag
        {...dragHandlers}
        style={{
          transform: transform3d,
        }}
        className={`h-full w-full cursor-grab active:cursor-grabbing ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <motion.svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          initial={false}
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient
              id="circle-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                style={{ stopColor: baseColor, stopOpacity: 0.7 }}
              />
              <stop
                offset="50%"
                style={{ stopColor: baseColor, stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: baseColor, stopOpacity: 0.7 }}
              />
            </linearGradient>
            <linearGradient
              id="progress-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                style={{ stopColor: activeColor, stopOpacity: 0.7 }}
              />
              <stop
                offset="50%"
                style={{ stopColor: activeColor, stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: activeColor, stopOpacity: 0.7 }}
              />
            </linearGradient>
          </defs>

          <motion.g
            style={{
              transform: "rotate(-45deg)",
              transformOrigin: "center",
            }}
          >
            {/* Base circle with gradient */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="url(#circle-gradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference * 0.8}
              filter="url(#glow)"
            />

            {/* Animated progress arc with gradient */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset: dashOffset,
              }}
              transition={{
                strokeDashoffset: { duration: 0.6, ease: "easeOut" },
              }}
              style={{
                transformOrigin: "center",
                transform: handleTransform,
              }}
            />
          </motion.g>
        </motion.svg>
        {children}
      </motion.div>
    </motion.div>
  );
};
