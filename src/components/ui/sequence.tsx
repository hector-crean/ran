import { clamp, objectFit } from "@/lib/utils";
import { MotionValue, useMotionValueEvent } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

interface SequenceProps {
  className?: string;
  frames?: (HTMLImageElement | null)[];
  value: MotionValue<number>;
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  [key: string]: unknown; // for ...props spread
}

export const Sequence = ({
  className,
  frames = [],
  value,
  fit = "cover",
  ...props
}: SequenceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleRepaint = useCallback(
    (v: number) => {
      if (frames.length === 0) return;
      const frame = Math.floor(clamp(v, 0, 1) * (frames.length - 1));
      const image = frames[frame];

      if (!image || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      const { width, height, x, y } = objectFit(
        canvas.clientWidth,
        canvas.clientHeight,
        image.width,
        image.height,
        { fit }
      );

      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, x, y, width, height);
      } catch (error) {}
    },
    [frames, fit]
  );

  useMotionValueEvent(value, "change", latest => {
    handleRepaint(latest);
  });

  useEffect(() => {
    const onResize = () => {
      handleRepaint(value.get());
    };
    window.addEventListener("resize", onResize);
    onResize(); // Initial paint
    return () => window.removeEventListener("resize", onResize);
  }, [handleRepaint, value]);

  return <canvas ref={canvasRef} className={className} {...props}></canvas>;
};
