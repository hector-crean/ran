"use client";
import React, { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

interface GlowFilterProps {
  id: string;
  color: string;
  intensity?: number;
  animated?: boolean;
  duration?: number;
  delay?: number;
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "backOut";
  glowLayers?: number;
  maxIntensity?: number;
  pulsing?: boolean;
  interactive?: boolean;
  onHover?: (isHovering: boolean) => void;
}

const GlowFilter = ({
  id,
  color,
  intensity = 1,
  animated = false,
  duration = 2,
  delay = 0,
  easing = "easeInOut",
  glowLayers = 3,
  maxIntensity = 3,
  pulsing = false,
  interactive = false,
  onHover,
}: GlowFilterProps) => {
  const controls = useAnimation();
  const [isHovering, setIsHovering] = useState(false);
  const [currentIntensity, setCurrentIntensity] = useState(intensity);

  // Generate glow layers dynamically
  const glowSizes = Array.from({ length: glowLayers }, (_, i) => 
    (i + 1) * 2 * currentIntensity
  );

  // Animation variants for the glow effect
  const glowVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: [0.3, 1, 0.7, 1],
      scale: [0.8, 1.2, 1, 1.1],
      transition: {
        duration,
        delay,
        ease: easing,
        repeat: pulsing ? Infinity : 0,
        repeatType: "reverse" as const,
      },
    },
    hover: {
      opacity: 1,
      scale: 1.3,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Handle hover interactions
  const handleHover = (hovering: boolean) => {
    setIsHovering(hovering);
    setCurrentIntensity(hovering ? maxIntensity : intensity);
    onHover?.(hovering);
  };

  // Auto-start animation if enabled
  useEffect(() => {
    if (animated) {
      controls.start("animate");
    }
  }, [animated, controls]);

  return (
    <motion.filter
      id={id}
      x="-100%"
      y="-100%"
      width="300%"
      height="300%"
      variants={glowVariants}
      initial={animated ? "initial" : undefined}
      animate={
        animated 
          ? isHovering && interactive 
            ? "hover" 
            : "animate"
          : undefined
      }
      {...(interactive && {
        onHoverStart: () => handleHover(true),
        onHoverEnd: () => handleHover(false),
      })}
    >
      {/* Multiple glow layers for depth */}
      {glowSizes.map((size, index) => (
        <motion.feDropShadow
          key={`glow-layer-${index}`}
          dx="0"
          dy="0"
          stdDeviation={size}
          floodColor={color}
          floodOpacity={1 - (index * 0.2)} // Reduce opacity for outer layers
          animate={{
            stdDeviation: animated ? [size * 0.8, size * 1.2, size] : size,
            floodOpacity: animated 
              ? [0.8 - (index * 0.2), 1 - (index * 0.15), 0.9 - (index * 0.2)]
              : 1 - (index * 0.2),
          }}
          transition={{
            duration: duration + (index * 0.1), // Stagger layer animations
            delay: delay + (index * 0.05),
            ease: easing,
            repeat: pulsing ? Infinity : 0,
            repeatType: "reverse",
          }}
        />
      ))}
      
      {/* Optional inner bright core */}
      <motion.feDropShadow
        dx="0"
        dy="0"
        stdDeviation={currentIntensity * 0.5}
        floodColor={color}
        floodOpacity="0.9"
        animate={animated ? {
          stdDeviation: [currentIntensity * 0.3, currentIntensity * 0.8, currentIntensity * 0.5],
          floodOpacity: [0.6, 1, 0.8],
        } : undefined}
        transition={{
          duration: duration * 0.8,
          delay,
          ease: easing,
          repeat: pulsing ? Infinity : 0,
          repeatType: "reverse",
        }}
      />
    </motion.filter>
  );
};

// Enhanced version with color animation
export const AnimatedGlowFilter = ({
  id,
  colors = ["#ff6b6b", "#4ecdc4", "#45b7d1"],
  intensity = 1.5,
  duration = 3,
  ...props
}: Omit<GlowFilterProps, 'color'> & {
  colors?: string[];
}) => {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [currentColor, setCurrentColor] = useState(colors[0]);

  // Cycle through colors
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % colors.length);
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [colors.length, duration]);

  useEffect(() => {
    setCurrentColor(colors[currentColorIndex]);
  }, [currentColorIndex, colors]);

  return (
    <GlowFilter
      id={id}
      color={currentColor}
      intensity={intensity}
      duration={duration}
      animated
      pulsing
      glowLayers={4}
      maxIntensity={2.5}
      {...props}
    />
  );
};

// Multi-glow composite filter
export const MultiGlowFilter = ({
  id,
  glowConfigs,
}: {
  id: string;
  glowConfigs: Array<{
    color: string;
    intensity: number;
    offset?: { x: number; y: number };
  }>;
}) => {
  return (
    <filter id={id} x="-150%" y="-150%" width="400%" height="400%">
      {glowConfigs.map((config, index) => (
        <React.Fragment key={`multi-glow-${index}`}>
          <feDropShadow
            dx={config.offset?.x || 0}
            dy={config.offset?.y || 0}
            stdDeviation={2 * config.intensity}
            floodColor={config.color}
            result={`glow-${index}-1`}
          />
          <feDropShadow
            dx={config.offset?.x || 0}
            dy={config.offset?.y || 0}
            stdDeviation={4 * config.intensity}
            floodColor={config.color}
            result={`glow-${index}-2`}
          />
          <feDropShadow
            dx={config.offset?.x || 0}
            dy={config.offset?.y || 0}
            stdDeviation={6 * config.intensity}
            floodColor={config.color}
            result={`glow-${index}-3`}
          />
        </React.Fragment>
      ))}
    </filter>
  );
};

// Hook for glow control
export const useGlowFilter = (config: {
  triggerOnMount?: boolean;
  glowOnHover?: boolean;
  glowOnClick?: boolean;
  autoIntensity?: boolean;
}) => {
  const [isGlowing, setIsGlowing] = useState(config.triggerOnMount ?? false);
  const [intensity, setIntensity] = useState(1);

  const triggerGlow = (newIntensity?: number) => {
    setIsGlowing(true);
    if (newIntensity) setIntensity(newIntensity);
  };

  const stopGlow = () => {
    setIsGlowing(false);
    setIntensity(1);
  };

  const toggleGlow = () => {
    setIsGlowing(prev => !prev);
  };

  const handlers = {
    ...(config.glowOnHover && {
      onMouseEnter: () => triggerGlow(2),
      onMouseLeave: stopGlow,
    }),
    ...(config.glowOnClick && {
      onClick: () => triggerGlow(1.5),
    }),
  };

  return {
    isGlowing,
    intensity,
    triggerGlow,
    stopGlow,
    toggleGlow,
    handlers,
  };
};

export default GlowFilter;

