"use client";

import { mat4, Mat4Like, vec3 } from "gl-matrix";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

export declare type Transform = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

type FitType = "contain" | "cover" | "none";

interface ObjectFitOptions {
  fit?: FitType;
  maxWidth?: number;
  maxHeight?: number;
}

const calculateTransform = (
  parentWidth: number,
  parentHeight: number,
  childWidth: number,
  childHeight: number,
  {
    fit = "contain",
    maxWidth = Infinity,
    maxHeight = Infinity,
  }: ObjectFitOptions = {},
): Float32Array => {
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
  }

  if (width > maxWidth) {
    width = maxWidth;
    height = width / childRatio;
  }
  if (height > maxHeight) {
    height = maxHeight;
    width = height * childRatio;
  }

  const x = (parentWidth - width) / 2;
  const y = (parentHeight - height) / 2;
  const scaleX = width / childWidth;
  const scaleY = height / childHeight;

  const transform = mat4.create();
  mat4.translate(transform, transform, vec3.fromValues(x, y, 0));
  mat4.scale(transform, transform, vec3.fromValues(scaleX, scaleY, 1));

  return transform;
};

const ResponsiveContainerContext = createContext<Mat4Like | undefined>(undefined);

interface ResponsiveContainerProps {
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  fit?: FitType;
  scale?: boolean;
  containerClassname?: string;
  contentClassname?: string;
  children: ReactNode;
}

export const ResponsiveContainer = ({
  width = 1920,
  height = 1080,
  maxWidth = Infinity,
  maxHeight = Infinity,
  fit = "contain",
  scale = false,
  containerClassname,
  contentClassname,
  children,
}: ResponsiveContainerProps) => {
  const [transform, setTransform] = useState<Mat4Like>(() => mat4.create());

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      const observer = new ResizeObserver(([entry]) => {
        const target = entry.target as HTMLElement;
        setTransform(
          calculateTransform(target.offsetWidth, target.offsetHeight, width, height, {
            fit,
            maxWidth,
            maxHeight,
          }),
        );
      });

      if (node !== null) {
        observer.observe(node);
      }
    },
    [width, height, fit, maxWidth, maxHeight],
  );

  const matrixString = `matrix3d(${Array.from(scale ? transform : mat4.create()).join(',')})`;

  return (
    <div
      ref={containerRef}
      className={containerClassname}
      style={{ position: "relative" }}
    >
      <ResponsiveContainerContext.Provider value={transform}>
        <div
          className={contentClassname}
          style={{
            position: "absolute",
            width: scale ? `${width}px` : "100%",
            height: scale ? `${height}px` : "100%",
            transform: matrixString,
            transformOrigin: "0 0",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {children}
          </div>
        </div>
      </ResponsiveContainerContext.Provider>
    </div>
  );
};

export const useResponsiveContainer = (): Mat4Like => {
  const context = useContext(ResponsiveContainerContext);
  if (context === undefined) {
    throw new Error(
      "useResponsiveContainer must be used within a ResponsiveContainer",
    );
  }
  return context;
};

// Utility functions for working with the transform
export const getInverseTransform = (transform: Mat4Like): Mat4Like => {
  const inverse = mat4.create();
  mat4.invert(inverse, transform);
  return inverse;
};

export const transformPoint = (transform: Mat4Like, x: number, y: number): { x: number; y: number } => {
  const point = vec3.transformMat4(
    vec3.create(),
    vec3.fromValues(x, y, 0),
    transform
  );
  return { x: point[0], y: point[1] };
};

export const composeTransforms = (a: Mat4Like, b: Mat4Like): Mat4Like => {
  const result = mat4.create();
  mat4.multiply(result, a, b);
  return result;
};

export const getTransformFromMatrix = (matrix: Mat4Like): Transform => {
  // For a 2D transform matrix, the components are arranged as:
  // [scaleX  0      0  0]
  // [0       scaleY 0  0]
  // [0       0      1  0]
  // [x       y      0  1]
  return {
    x: matrix[12],
    y: matrix[13],
    scaleX: matrix[0],
    scaleY: matrix[5]
  };
};

export const getMatrixFromTransform = (transform: Transform): Mat4Like => {
  const matrix = mat4.create();
  mat4.translate(matrix, matrix, vec3.fromValues(transform.x, transform.y, 0));
  mat4.scale(matrix, matrix, vec3.fromValues(transform.scaleX, transform.scaleY, 1));
  return matrix;
};
