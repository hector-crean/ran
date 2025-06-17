"use client";

import GlowFilter from "@/components/ui/svg/filter/glow-filter";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useMotionTemplate,
  useDragControls,
} from "framer-motion";
import { useMemo, useState, useEffect } from "react";
// import { CSS, Transform } from '@dnd-kit/utilities';

interface CircularArcProps {
  radius?: number;
  strokeWidth?: number;
  baseColor?: string;
  activeColor?: string;
  perspective?: number;
  dragElastic?: number;
}

const CircularArc = ({
  radius = 45,
  strokeWidth = 10,
  baseColor = "#e2e8f0",
  activeColor = "#3b82f6",
  perspective = 1000,
  dragElastic = 0.5,
}: CircularArcProps) => {
  const HANDLE_RADIUS = 0.05;
  // Calculate the circumference of the circle
  const circumference = 2 * Math.PI * radius;

  // Calculate the arc length based on progress
  const arcLength = circumference * HANDLE_RADIUS;

  // Calculate the dash offset to create the progress effect
  const dashOffset = circumference - arcLength;

  // Use a raw motion value for azimuth, and a spring for smooth lerping
  const rawAzimuthAngle = useMotionValue(0);
  const azimuthAngle = useSpring(rawAzimuthAngle, {
    stiffness: 200,
    damping: 30,
  });
  const transform3d = useMotionTemplate`rotate3d(1,0,0,-80deg)`;

  const dragControls = useDragControls();

  const handleTransform = useTransform(azimuthAngle, (v) => `rotate(${v}deg)`);

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      style={{ perspective: perspective, touchAction: "none" }}
      onPointerDown={(event) => dragControls.start(event)}
    >
      <div></div>
      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        onDrag={(e, info) => {
          rawAzimuthAngle.set(rawAzimuthAngle.get() - info.delta.x);
        }}
        style={{
          transform: transform3d,
        }}
        className="cursor-grab active:cursor-grabbing w-full h-full"
      >
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          initial={false}
        >
          {/* Add subtle gradient for 3D effect */}
          <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
     <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
     <feMerge>
       <feMergeNode in="coloredBlur"/>
       <feMergeNode in="SourceGraphic"/>
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

          {/* Base circle with gradient */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#circle-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference * 0.8}
            style={{
              transformOrigin: "center",
              transform: "rotate(-45deg)",
            }}
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
        </motion.svg>
      </motion.div>
    </motion.div>
  );
};

const Page = () => {
  const [progress, setProgress] = useState(0.75);
  const [azimuthAngle, setAzimuthAngle] = useState(0);

  return (
    <div className="w-full h-full p-12 bg-gray-100 flex flex-col gap-8">
      <div className="w-64 h-64">
        <CircularArc perspective={1000} dragElastic={0.5} />
      </div>
    </div>
  );
};

export default Page;
