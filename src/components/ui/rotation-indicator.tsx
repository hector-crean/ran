import { Html, RoundedBoxGeometry } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MotionValue } from "motion/react";
import { ReactNode, useMemo, useRef } from "react";
import * as THREE from "three";

interface RotationIndicatorProps {
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

// Arc mesh component
function ArcMesh({
  radius,
  strokeWidth,
  baseColor,
  activeColor,
}: {
  radius: number;
  strokeWidth: number;
  baseColor: string;
  activeColor: string;
}) {
  const arcGeometry = useMemo(() => {
    const geometry = new THREE.RingGeometry(
      radius - strokeWidth / 2,
      radius + strokeWidth / 2,
      100,
      1,
      Math.PI / 4,
      (6 * Math.PI) / 4
    );
    return geometry;
  }, [radius, strokeWidth]);

  const outerArcGeometry = useMemo(() => {
    const outerRadius = radius + strokeWidth * 1.75;
    const innerRadius = radius - strokeWidth * 1.75;
    const geometry = new THREE.RingGeometry(
      innerRadius,
      outerRadius,
      100,
      1,
      Math.PI / 4,
      (6 * Math.PI) / 4
    );
    return geometry;
  }, [radius, strokeWidth]);

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* Outer arc */}
      <mesh key="outer-arc" geometry={outerArcGeometry}>
        <meshPhongMaterial
          color={baseColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner arc */}
      <mesh key="inner-arc" geometry={arcGeometry}>
        <meshBasicMaterial color={activeColor} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Handle component using useFrame for direct motion value coordination
function Handle({
  dragAngle,
  dragging,
  radius,
  strokeWidth,
}: {
  dragAngle: MotionValue<number>;
  dragging: boolean;
  radius: number;
  strokeWidth: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const targetAngle = useRef(dragAngle.get());
  const currentAngle = useRef(dragAngle.get());

  const calculatePosition = (angle: number) => {
    const angleRad = (angle * Math.PI) / 180;
    const theta = angleRad - (3 * Math.PI) / 4;
    const r = radius + strokeWidth / 2;

    return [-r * Math.cos(theta), 0, r * Math.sin(theta)] as [
      number,
      number,
      number,
    ];
  };

  const calculateRotation = (angle: number) => {
    const angleRad = (angle * Math.PI) / 180;
    const theta = angleRad - (3 * Math.PI) / 4;

    return [0, theta, 0] as [number, number, number];
  };

  // Use useFrame to update position and rotation every frame
  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    // Get the current motion value
    const motionValue = dragAngle.get();
    targetAngle.current = motionValue;

    if (dragging) {
      // During dragging: immediate updates
      currentAngle.current = targetAngle.current;
    } else {
      // Not dragging: smooth interpolation
      const lerpFactor = 1 - Math.exp(-8 * delta); // Exponential easing
      currentAngle.current = THREE.MathUtils.lerp(
        currentAngle.current,
        targetAngle.current,
        lerpFactor
      );
    }

    // Update position and rotation
    const position = calculatePosition(currentAngle.current);
    const rotation = calculateRotation(currentAngle.current);

    groupRef.current.position.set(position[0], position[1], position[2]);
    meshRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
  });

  return (
    <group ref={groupRef}>
      <mesh key="handle-mesh" ref={meshRef}>
        <RoundedBoxGeometry
          args={[0.5, 0.5, 1]}
          radius={0.2}
          steps={1}
          smoothness={4}
          bevelSegments={4}
          creaseAngle={0.4}
        />
        <meshPhongMaterial color="#cc6cf4" />
      </mesh>

      {/* Cone pointing up */}
      <mesh key="cone-up" position={[0, 0.75, 0]}>
        <coneGeometry args={[0.05, 0.3, 8]} />
        <meshPhongMaterial color="white" />
      </mesh>

      {/* Cone pointing down */}
      <mesh key="cone-down" position={[0, -0.75, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.05, 0.3, 8]} />
        <meshPhongMaterial color="white" />
      </mesh>

      <Html
        key="handle-label"
        transform
        position={[0, 0, 0]}
        style={{
          pointerEvents: "none",
        }}
      >
        {/* <div>Label</div> */}
      </Html>
    </group>
  );
}

export const RotationIndicator = ({
  dragAngle,
  dragging,
  radius = 45,
  baseColor = "#e2e8f0",
  activeColor = "#3b82f6",
  perspective = 1000,
  centerX = 45,
  centerY = 45,
  children,
}: RotationIndicatorProps) => {
  const strokeWidth = 0.5;
  const scaledRadius = radius / 10; // Scale down for 3D space

  return (
    <div className="pointer-events-none z-20 flex h-full w-full items-center justify-center">
      <Canvas
        resize={{
          scroll: false,
          debounce: { scroll: 50, resize: 0 },
        }}
        gl={{
          alpha: false,
          antialias: true,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor("transparent", 0); // Transparent background
        }}
        camera={{
          position: [-6.167472320583971, 4.991175371870244, 3.477471174671424],
          rotation: [
            -1.1821874093507672, -0.8317947367899591, -1.0649438353066807,
          ],
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />

        <group key="indicator-group" rotation={[0, 0, 0]}>
          <ArcMesh
            radius={scaledRadius}
            strokeWidth={strokeWidth / 10}
            baseColor={baseColor}
            activeColor={activeColor}
          />

          <Handle
            dragAngle={dragAngle}
            dragging={dragging}
            radius={scaledRadius}
            strokeWidth={strokeWidth / 10}
          />
        </group>
      </Canvas>

      {/* Overlay children */}
      <div
        key="overlay-children"
        className="pointer-events-none absolute inset-0"
      >
        {children}
      </div>
    </div>
  );
};
