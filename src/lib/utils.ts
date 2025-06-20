import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ObjectFitOptions {
  fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  maxWidth?: number;
  maxHeight?: number;
}

interface ObjectFitResult {
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
}

export const objectFit = (
  parentWidth: number,
  parentHeight: number,
  childWidth: number,
  childHeight: number,
  { fit = "contain", maxWidth = Infinity, maxHeight = Infinity }: ObjectFitOptions = {}
): ObjectFitResult => {
  const childRatio = childWidth / childHeight;
  const parentRatio = parentWidth / parentHeight;
  let width = parentWidth;
  let height = parentHeight;

  switch (fit) {
    case "cover":
      if (childRatio < parentRatio) {
        height = width / childRatio;
      } else {
        width = height * childRatio;
      }
      break;
    case "contain":
      if (childRatio > parentRatio) {
        height = width / childRatio;
      } else {
        width = height * childRatio;
      }
      break;
    case "none":
      width = childWidth;
      height = childHeight;
      break;
    default:
      break;
  }

  if (width > maxWidth) {
    width = maxWidth;
    height = width / childRatio;
  }
  if (height > maxHeight) {
    height = maxHeight;
    width = height * childRatio;
  }

  const widthScale = width / childWidth;
  const heightScale = width / childHeight;

  return {
    width,
    height,
    x: (parentWidth - width) / 2,
    y: (parentHeight - height) / 2,
    scale: Math.min(widthScale, heightScale),
  };
};

export const lerp = (x: number, y: number, t: number): number => (1 - t) * x + t * y;

export const clamp = (x: number, min: number = 0, max: number = 1): number => Math.min(Math.max(x, min), max);

export const wrap = (x: number): number => ((x % 1) + 1) % 1;

export const throttle = (cb: () => void, ms: number): (() => void) => {
  let lastTime = 0;
  return () => {
    const now = Date.now();
    if (now - lastTime >= ms) {
      cb();
      lastTime = now;
    }
  };
};
