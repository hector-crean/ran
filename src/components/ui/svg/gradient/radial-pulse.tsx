"use client";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import React, { useEffect, useState } from "react";

interface RadialPulseProps {
  id: string;
  color: string;
  cx: number;
  cy: number;
  duration: number;
  delay: number;
  intensity?: number;
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "backOut";
  pulseCount?: number; // Number of concurrent pulses
  maxScale?: number;
  onComplete?: () => void;
}

const RadialPulse = ({
  id,
  color,
  cx,
  cy,
  duration,
  delay,
  intensity = 0.7,
  easing = "easeOut",
  pulseCount = 1,
  maxScale = 12,
  onComplete
}: RadialPulseProps): React.ReactNode => {
  const controls = useAnimation();
  const [pulses, setPulses] = useState<number[]>([]);

  // Create multiple pulses with staggered timing
  useEffect(() => {
    const pulseArray = Array.from({ length: pulseCount }, (_, i) => i);
    setPulses(pulseArray);
  }, [pulseCount]);

  // Animation variants for different easing options
  const pulseVariants = {
    initial: {
      scale: 0,
      opacity: 0,
    },
    animate: {
      scale: [0, maxScale * 0.3, maxScale, 0],
      opacity: [0, intensity * 0.5, intensity, 0],
      transition: {
        duration,
        delay,
        ease: easing,
        repeat: Infinity,
        repeatDelay: 0.1,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  // Staggered animation for multiple pulses
  const staggeredVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (pulseIndex: number) => ({
      scale: [0, maxScale * 0.3, maxScale, 0],
      opacity: [0, intensity * 0.5, intensity, 0],
      transition: {
        duration,
        delay: delay + (pulseIndex * duration / pulseCount),
        ease: easing,
        repeat: Infinity,
        repeatDelay: duration * 0.5,
        onComplete: pulseIndex === 0 ? onComplete : undefined,
      },
    }),
  };

  return (
    <>
      {/* Static gradient definition */}
      <radialGradient
        id={`${id}-static`}
        cx={`${cx}%`}
        cy={`${cy}%`}
        r="50%"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor={color} stopOpacity="0" />
        <stop offset="0.25" stopColor={color} stopOpacity={intensity * 0.7} />
        <stop offset="0.5" stopColor={color} stopOpacity="0" />
        <stop offset="0.75" stopColor={color} stopOpacity={intensity * 0.7} />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </radialGradient>

      {/* Animated gradient definitions */}
      <AnimatePresence>
        {pulses.map((pulseIndex) => (
          <motion.radialGradient
            key={`${id}-pulse-${pulseIndex}`}
            id={`${id}-pulse-${pulseIndex}`}
            cx={`${cx}%`}
            cy={`${cy}%`}
            r="50%"
            gradientUnits="userSpaceOnUse"
            variants={pulseCount > 1 ? staggeredVariants : pulseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            custom={pulseIndex}
          >
            <stop offset="0" stopColor={color} stopOpacity="0" />
            <stop offset="0.25" stopColor={color} stopOpacity={intensity * 0.7} />
            <stop offset="0.5" stopColor={color} stopOpacity="0" />
            <stop offset="0.75" stopColor={color} stopOpacity={intensity * 0.7} />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </motion.radialGradient>
        ))}
      </AnimatePresence>
    </>
  );
};

// Enhanced version with more control
export const AdvancedRadialPulse = ({
  id,
  color,
  cx,
  cy,
  duration,
  delay,
  intensity = 0.7,
  easing = "easeOut",
  pulseCount = 3,
  maxScale = 12,
  onComplete
}: RadialPulseProps) => {
  const [isActive, setIsActive] = useState(true);

  // Complex animation sequence
  const sequenceVariants = {
    initial: {
      scale: 0,
      opacity: 0,
      rotate: 0,
    },
    pulse: {
      scale: [0, maxScale * 0.2, maxScale * 0.6, maxScale, 0],
      opacity: [0, intensity * 0.3, intensity * 0.8, intensity, 0],
      rotate: [0, 0, 180, 360, 360],
      transition: {
        duration: duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier
        repeat: Infinity,
        repeatDelay: 0.5,
        times: [0, 0.2, 0.5, 0.8, 1], // Keyframe timing
      },
    },
    breathe: {
      scale: [1, 1.1, 1],
      opacity: [intensity * 0.5, intensity, intensity * 0.5],
      transition: {
        duration: duration * 2,
        delay,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.g
      variants={sequenceVariants}
      initial="initial"
      animate={isActive ? "pulse" : "breathe"}
      onHoverStart={() => setIsActive(false)}
      onHoverEnd={() => setIsActive(true)}
    >
      <defs>
        <radialGradient
          id={id}
          cx={`${cx}%`}
          cy={`${cy}%`}
          r="50%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.25" stopColor={color} stopOpacity={intensity * 0.7} />
          <stop offset="0.5" stopColor={color} stopOpacity="0" />
          <stop offset="0.75" stopColor={color} stopOpacity={intensity * 0.7} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
    </motion.g>
  );
};

export default RadialPulse;

// Custom hook for pulse control
export const useRadialPulse = (config: {
  isActive?: boolean;
  triggerOnMount?: boolean;
  pulseOnHover?: boolean;
  pulseOnClick?: boolean;
}) => {
  const [isAnimating, setIsAnimating] = useState(config.triggerOnMount ?? true);
  const [pulseKey, setPulseKey] = useState(0);

  const triggerPulse = () => {
    setPulseKey(prev => prev + 1);
    setIsAnimating(true);
  };

  const stopPulse = () => {
    setIsAnimating(false);
  };

  const togglePulse = () => {
    setIsAnimating(prev => !prev);
  };

  const handlers = {
    ...(config.pulseOnHover && {
      onMouseEnter: triggerPulse,
      onMouseLeave: stopPulse,
    }),
    ...(config.pulseOnClick && {
      onClick: triggerPulse,
    }),
  };

  return {
    isAnimating,
    pulseKey,
    triggerPulse,
    stopPulse,
    togglePulse,
    handlers,
  };
};

// Example usage components
export const InteractivePulse = ({
  id,
  color,
  cx,
  cy,
  duration = 2,
  delay = 0
}: Omit<RadialPulseProps, 'intensity' | 'easing'>) => {
  const { isAnimating, handlers } = useRadialPulse({
    pulseOnHover: true,
    triggerOnMount: false,
  });

  return (
    <g {...handlers}>
      <RadialPulse
        id={id}
        color={color}
        cx={cx}
        cy={cy}
        duration={duration}
        delay={delay}
        intensity={isAnimating ? 0.9 : 0.3}
        easing="backOut"
        pulseCount={isAnimating ? 3 : 1}
      />
    </g>
  );
};

// Performance-optimized version for multiple instances
export const BatchedRadialPulse = ({
  pulses,
  globalDelay = 0,
}: {
  pulses: Array<{
    id: string;
    color: string;
    cx: number;
    cy: number;
    duration?: number;
  }>;
  globalDelay?: number;
}) => {
  return (
    <>
      {pulses.map((pulse, index) => (
        <RadialPulse
          key={pulse.id}
          id={pulse.id}
          color={pulse.color}
          cx={pulse.cx}
          cy={pulse.cy}
          duration={pulse.duration ?? 2}
          delay={globalDelay + (index * 0.2)} // Stagger each pulse
          intensity={0.6}
          easing="circOut"
          pulseCount={1}
        />
      ))}
    </>
  );
};
