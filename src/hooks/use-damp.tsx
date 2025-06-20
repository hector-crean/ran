import { useEffect, useRef, useState } from "react";

export const useDamp = (
  targetValue: number,
  dampingFactor: number = 0.1,
  threshold: number = 0.01
): number => {
  const [dampedValue, setDampedValue] = useState<number>(targetValue);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const updateValue = () => {
      setDampedValue((prevValue: number) => {
        const difference = targetValue - prevValue;
        const newValue = prevValue + difference * dampingFactor;

        // Stop updating if within the defined threshold
        return Math.abs(difference) < threshold ? targetValue : newValue;
      });
    };

    const animate = () => {
      updateValue();
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, dampingFactor, threshold]);

  return dampedValue;
};
