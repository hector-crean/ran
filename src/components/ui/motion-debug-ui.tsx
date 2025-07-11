"use client";

import React, { useState, useEffect } from "react";
import { motion, MotionValue, useMotionValueEvent } from "motion/react";
import { AnimatePresence } from "motion/react";

// Types
interface MotionValueDisplay {
  label: string;
  value: MotionValue<number>;
  range: [number, number];
  color: string;
  unit?: string;
  format?: (value: number) => string;
}

interface StateIndicator {
  label: string;
  value: boolean;
  color?: string;
}

interface ThresholdIndicator {
  label: string;
  value: number;
  range: [number, number];
  color?: string;
}

interface MotionDebugUIProps {
  title?: string;
  motionValues: MotionValueDisplay[];
  states?: StateIndicator[];
  thresholds?: ThresholdIndicator[];
  className?: string;
  visible?: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

// Default formatters
const defaultFormatters = {
  decimal: (value: number) => value.toFixed(3),
  percentage: (value: number) => `${(value * 100).toFixed(0)}%`,
  pixels: (value: number) => `${value.toFixed(0)}px`,
  integer: (value: number) => value.toFixed(0),
};

// Position classes
const positionClasses = {
  "top-right": "fixed top-4 right-4",
  "top-left": "fixed top-4 left-4",
  "bottom-right": "fixed bottom-4 right-4",
  "bottom-left": "fixed bottom-4 left-4",
};

export const MotionDebugUI: React.FC<MotionDebugUIProps> = ({
  title = "Debug: Motion Values",
  motionValues,
  states = [],
  thresholds = [],
  className = "",
  visible = true,
  position = "top-right",
}) => {
  // Track motion values
  const [trackedValues, setTrackedValues] = useState<Record<string, number>>(
    {}
  );

  // Initialize tracked values
  useEffect(() => {
    const initialValues: Record<string, number> = {};
    motionValues.forEach(mv => {
      initialValues[mv.label] = mv.value.get();
    });
    setTrackedValues(initialValues);
  }, [motionValues]);

  // Subscribe to motion value changes (each motion value subscribes separately)
  motionValues.forEach(mv => {
    useMotionValueEvent(mv.value, "change", latestValue => {
      setTrackedValues(prev => ({
        ...prev,
        [mv.label]: latestValue,
      }));
    });
  });

  // Calculate normalized value for progress bars
  const getNormalizedValue = (value: number, range: [number, number]) => {
    const [min, max] = range;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="motion-debug-ui"
        className={`${positionClasses[position]} z-50 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="min-w-[200px] space-y-3 rounded-lg bg-black/80 p-4 font-mono text-xs text-white backdrop-blur-sm">
          {/* Title */}
          <div className="border-b border-blue-400/30 pb-2 font-bold text-blue-400">
            {title}
          </div>

          {/* Motion Values */}
          {motionValues.map(mv => {
            const currentValue = trackedValues[mv.label] || 0;
            const normalizedValue = getNormalizedValue(currentValue, mv.range);
            const formattedValue = mv.format
              ? mv.format(currentValue)
              : `${currentValue.toFixed(3)}${mv.unit || ""}`;

            return (
              <div key={mv.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ color: mv.color }}>{mv.label}:</span>
                  <span className="font-bold text-white">{formattedValue}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <motion.div
                    className="h-full origin-left"
                    style={{ backgroundColor: mv.color }}
                    animate={{ scaleX: normalizedValue }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400">
                  Range: {mv.range[0].toFixed(3)} → {mv.range[1].toFixed(3)}
                </div>
              </div>
            );
          })}

          {/* Thresholds */}
          {thresholds.map(threshold => {
            const normalizedThreshold = getNormalizedValue(
              threshold.value,
              threshold.range
            );

            return (
              <div key={threshold.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ color: threshold.color || "#fbbf24" }}>
                    {threshold.label}:
                  </span>
                  <span className="font-bold text-white">
                    {(threshold.value * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="relative h-1 w-full rounded-full bg-gray-700">
                  <div
                    className="absolute h-full w-0.5"
                    style={{
                      backgroundColor: threshold.color || "#fbbf24",
                      left: `${normalizedThreshold * 100}%`,
                    }}
                  />
                  <motion.div
                    className="h-full origin-left rounded-full"
                    style={{
                      backgroundColor: `${threshold.color || "#fbbf24"}30`,
                    }}
                    animate={{ scaleX: normalizedThreshold }}
                  />
                </div>
              </div>
            );
          })}

          {/* State Indicators */}
          {states.length > 0 && (
            <div className="space-y-1 border-t border-gray-600 pt-2">
              {states.map(state => (
                <div key={state.label} className="flex justify-between">
                  <span className="text-gray-400">{state.label}:</span>
                  <motion.span
                    animate={{
                      color: state.value ? state.color || "#22c55e" : "#6b7280",
                    }}
                    className="font-bold"
                  >
                    {state.value ? "YES" : "NO"}
                  </motion.span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Convenience hook for common motion debug scenarios
export const useMotionDebug = (motionValues: MotionValue<number>[]) => {
  const [values, setValues] = useState<number[]>([]);

  // Initialize values
  useEffect(() => {
    setValues(motionValues.map(mv => mv.get()));
  }, [motionValues]);

  // Subscribe to each motion value separately
  motionValues.forEach((mv, index) => {
    useMotionValueEvent(mv, "change", latestValue => {
      setValues(prev => {
        const newValues = [...prev];
        newValues[index] = latestValue;
        return newValues;
      });
    });
  });

  return values;
};

export { defaultFormatters };
export default MotionDebugUI;
