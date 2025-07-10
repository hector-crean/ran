import { animated, useSpring } from "@react-spring/three";
import { Html, RoundedBoxGeometry } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MotionValue } from "motion/react";
import { ReactNode, useEffect, useMemo } from "react";
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

// Handle component with react-spring animations
function Handle({
  dragAngle,
  radius,
  strokeWidth,
}: {
  dragAngle: MotionValue<number>;
  radius: number;
  strokeWidth: number;
}) {
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

  const [springs, api] = useSpring(() => ({
    angle: dragAngle.get(),
    config: {
      tension: 300,
      friction: 30,
      mass: 1,
    },
  }));

  // Subscribe to motion value changes and animate with spring
  useEffect(() => {
    const unsubscribe = dragAngle.on("change", value => {
      api.start({
        angle: value,
      });
    });
    return unsubscribe;
  }, [dragAngle, api]);

  // Derive position and rotation from the animated angle
  const animatedPosition = springs.angle.to(calculatePosition);

  const animatedRotation = springs.angle.to(calculateRotation);

  return (
    <animated.group position={animatedPosition}>
      <animated.mesh
        key="handle-mesh"
        // @ts-expect-error - TODO: fix this
        rotation={animatedRotation}
      >
        <RoundedBoxGeometry
          args={[0.5, 0.5, 1]}
          radius={0.2}
          steps={1}
          smoothness={4}
          bevelSegments={4}
          creaseAngle={0.4}
        />
        <meshPhongMaterial color="#cc6cf4" />
      </animated.mesh>

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
        // occlude
        position={[0, 0, 0]}
        style={{
          pointerEvents: "none",
        }}
      >
        {/* <div>Label</div> */}
      </Html>
    </animated.group>
  );
}

const CameraChecker = () => {
  const { camera } = useThree();

  useFrame(() => {
    // console.log(camera.position.toArray())
    // console.log(camera.rotation.toArray())
  });

  return null;
};
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
          gl.setClearColor("transparent", 0); // Green background
        }}
        camera={{
          position: [-6.167472320583971, 4.991175371870244, 3.477471174671424],
          rotation: [
            -1.1821874093507672, -0.8317947367899591, -1.0649438353066807,
          ],
        }}
      >
        {/* <OrbitControls /> */}

        {/* <CameraChecker /> */}
        {/* Orthographic Camera positioned to view all geometry */}
        {/* <OrthographicCamera
                    makeDefault
                    position={[0, 0, 10]}
                    zoom={100}
                    near={0.1}
                    far={10}
                /> */}

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
