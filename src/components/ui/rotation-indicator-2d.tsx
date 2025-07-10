import { arc } from "d3-shape";
import {
  motion,
  MotionValue,
  useMotionTemplate,
  useTransform,
} from "motion/react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

interface RotationIndicator3DProps {
  dragAngle: MotionValue<number>;
  dragging: boolean;
  radius?: number;
  baseColor?: string;
  activeColor?: string;
  perspective?: number;
  centerX?: number;
  centerY?: number;
  children?: ReactNode;
}

export const RotationIndicator3D = ({
  dragAngle,
  dragging,
  radius = 45,
  baseColor = "#e2e8f0",
  activeColor = "#3b82f6",
  perspective = 1000,
  centerX = 45,
  centerY = 45,
  children,
}: RotationIndicator3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<number>(0);

  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize(rect.width); // Use width as reference
      }
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  const strokeWidth = 0.5;

  const outerToInnerRatio = 3.5;

  const TILT_ANGLE_DEGREES = -78;

  const transform3d = useMotionTemplate`rotate3d(1,0,0,${TILT_ANGLE_DEGREES}deg)`;

  const sphericalPolarToCartesian = (angle: number) => {
    // Convert degrees to radians
    const angleRad = (angle * Math.PI) / 180;
    const theta = angleRad - (5 * Math.PI) / 4; // Azimuthal angle (around z-axis)

    // Spherical polar coordinate system
    const r = radius + strokeWidth / 2; // Radius - same as SVG arc
    const phi = Math.PI / 2; // Polar angle (90° = equatorial plane)
    const tiltAngle = (TILT_ANGLE_DEGREES * Math.PI) / 180; // Tilt the entire plane

    // Standard spherical to Cartesian conversion
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z_initial = r * Math.cos(phi);

    // Apply tilt transformation to create 3D effect
    const y_tilted = -y * Math.cos(tiltAngle) + z_initial * Math.sin(tiltAngle);
    const z_tilted = y * Math.sin(tiltAngle) + z_initial * Math.cos(tiltAngle);

    return { x, y: y_tilted, z: z_tilted };
  };

  const x = useTransform(dragAngle, v => sphericalPolarToCartesian(v).x);
  const y = useTransform(dragAngle, v => sphericalPolarToCartesian(v).y);
  const z = useTransform(dragAngle, v => sphericalPolarToCartesian(v).z);

  // Calculate scale factor based on container vs SVG viewBox
  // SVG viewBox is (radius * 2) x (radius * 2) = 90 x 90 units
  // Container is likely much larger in pixels
  const svgViewBoxSize = radius * 2; // 90 units

  // Dynamic scale factor based on actual container size
  const scaleFactor = containerSize / svgViewBoxSize;

  const scaledX = useTransform(x, v => v * scaleFactor);
  const scaledY = useTransform(y, v => v * scaleFactor);
  const scaledZ = useTransform(z, v => v * scaleFactor);

  const handleTransform = useMotionTemplate`translate3d(${scaledX}px, ${scaledY}px, ${scaledZ}px)`;

  const { innerArc, outerArc } = useMemo(() => {
    const a = arc();

    const innerArc = a({
      innerRadius: radius,
      outerRadius: radius,
      startAngle: Math.PI / 4,
      endAngle: (7 * Math.PI) / 4,
    });

    const outerArcInnerRadius = radius - outerToInnerRatio * (strokeWidth / 2);
    const outerArcOuterRadius = radius + outerToInnerRatio * (strokeWidth / 2);

    const outerArc = a.cornerRadius(
      0.5 * (outerArcOuterRadius - outerArcInnerRadius)
    )({
      innerRadius: outerArcInnerRadius,
      outerRadius: outerArcOuterRadius,
      startAngle: Math.PI / 4,
      endAngle: (7 * Math.PI) / 4,
    });

    return { innerArc, outerArc };
  }, [radius]);

  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center"
      style={{ touchAction: "none" }}
    >
      <motion.div
        ref={containerRef}
        style={{
          transform: transform3d,
        }}
        className={`h-full w-full cursor-grab active:cursor-grabbing ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <motion.svg
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
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
            style={{ transform: `translate(${centerX}px, ${centerY}px)` }}
          >
            <motion.path
              d={outerArc ?? ""}
              fill="none"
              stroke="rgb(230, 225, 231)"
              strokeWidth={outerToInnerRatio * strokeWidth}
              filter="url(#glow)"
            />
            <motion.path
              d={innerArc ?? ""}
              fill="none"
              stroke="#2a477c"
              strokeWidth={strokeWidth}
              filter="url(#glow)"
            />
          </motion.g>
        </motion.svg>
        {children}
      </motion.div>
      <motion.div
        style={{
          transform: handleTransform,
          transformOrigin: "center center",
        }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div className="h-6 w-6 rounded-full bg-red-500"></motion.div>
      </motion.div>
    </motion.div>
  );
};
