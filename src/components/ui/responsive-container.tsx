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
  }: ObjectFitOptions = {}
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

const ResponsiveContainerContext = createContext<Mat4Like | undefined>(
  undefined
);

export interface ResponsiveContainerProps {
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
          calculateTransform(
            target.offsetWidth,
            target.offsetHeight,
            width,
            height,
            {
              fit,
              maxWidth,
              maxHeight,
            }
          )
        );
      });

      if (node !== null) {
        observer.observe(node);
      }
    },
    [width, height, fit, maxWidth, maxHeight]
  );

  const matrixString = `matrix3d(${Array.from(scale ? transform : mat4.create()).join(",")})`;

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
      "useResponsiveContainer must be used within a ResponsiveContainer"
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

export const transformPoint = (
  transform: Mat4Like,
  x: number,
  y: number
): { x: number; y: number } => {
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
    scaleY: matrix[5],
  };
};

export const getMatrixFromTransform = (transform: Transform): Mat4Like => {
  const matrix = mat4.create();
  mat4.translate(matrix, matrix, vec3.fromValues(transform.x, transform.y, 0));
  mat4.scale(
    matrix,
    matrix,
    vec3.fromValues(transform.scaleX, transform.scaleY, 1)
  );
  return matrix;
};

/*
 * Coordinate Spaces and Transformations Documentation
 * =================================================
 *
 * Overview
 * --------
 * The ResponsiveContainer manages three key coordinate spaces:
 * 1. Parent Space (Container coordinates)
 * 2. Content Space (Virtual coordinates)
 * 3. Screen Space (Final rendered coordinates)
 *
 * Matrix Structure
 * ---------------
 * Uses 4x4 homogeneous transformation matrices (via gl-matrix):
 * [scaleX  0      0  0]
 * [0       scaleY 0  0]
 * [0       0      1  0]
 * [tx      ty     0  1]
 *
 * where:
 * - scaleX, scaleY are scaling factors (matrix[0] and matrix[5])
 * - tx, ty are translations (matrix[12] and matrix[13])
 *
 * Transformation Pipeline
 * ----------------------
 * 1. Initial Content Space:
 *    - Defined by props: width (default: 1920) and height (default: 1080)
 *    - Virtual coordinate space where content is authored
 *    - Child components positioned relative to this space
 *
 * 2. Container Space:
 *    - Determined by actual DOM dimensions of container element
 *    - Tracked via ResizeObserver: target.offsetWidth and target.offsetHeight
 *
 * 3. Transform Calculation:
 *    - Aspect ratio handling:
 *      childRatio = childWidth / childHeight
 *      parentRatio = parentWidth / parentHeight
 *
 *    - Fit Modes:
 *      "contain": Scales content to fit entirely within container
 *      "cover": Scales content to cover container entirely
 *      "none": No scaling, uses original dimensions
 *
 *    - Size Constraints:
 *      Respects maxWidth and maxHeight while maintaining aspect ratio
 *
 *    - Final Transform Components:
 *      x = (parentWidth - width) / 2      // Centering translation X
 *      y = (parentHeight - height) / 2     // Centering translation Y
 *      scaleX = width / childWidth         // Scale factor X
 *      scaleY = height / childHeight       // Scale factor Y
 *
 * Matrix Operations
 * ----------------
 * 1. Transform Application:
 *    - Creates matrix that scales content to calculated dimensions
 *    - Translates it to center in container
 *
 * 2. CSS Application:
 *    - Matrix applied via CSS transform when scale=true
 *    - Otherwise identity matrix is used
 *
 * Utility Functions
 * ----------------
 * 1. getInverseTransform:
 *    - Converts container coordinates back to content space
 *
 * 2. transformPoint:
 *    - Maps a point through the transformation matrix
 *    - Useful for event handling
 *
 * 3. composeTransforms:
 *    - Combines two transforms using matrix multiplication
 *    - b is applied after a
 *
 * Context Usage
 * ------------
 * Transform matrix stored in React context allows child components to:
 * 1. Access current transform matrix
 * 2. Convert between coordinate spaces
 * 3. Apply additional transformations relative to container's transform
 */
