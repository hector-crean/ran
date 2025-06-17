"use client";
import MorphingClipPath, {
  ClipPathContent,
} from "@/components/ui/svg/clip-path/morphing-clip-path";
import { motion } from "motion/react";

const Page = () => {
  // Original SVG paths - flubber can handle different path structures!
  const clipPaths = [
    // Circle using arc commands
    "M 50 0 A 50 50 0 0 1 50 100 A 50 50 0 0 1 50 0 Z",
    // Star with sharp points
    "M 50 0 L 59 35 L 95 35 L 68 57 L 78 91 L 50 70 L 22 91 L 32 57 L 5 35 L 41 35 Z",
    // Heart with curves
    "M 50 25 C 50 17, 42 12, 35 12 C 28 12, 20 17, 20 25 C 20 33, 28 40, 50 55 C 72 40, 80 33, 80 25 C 80 17, 72 12, 65 12 C 58 12, 50 17, 50 25 Z",
    // Diamond
    "M 50 0 L 100 50 L 50 100 L 0 50 Z",
  ];

  // Different content groups that get revealed by each shape
  const contentGroups: ClipPathContent[] = [
    {
      label: "Circle",
      content: (
        <>
          {/* Circle content - geometric shapes */}
          {[
            {
              type: "circle",
              props: { r: 15, cx: 30, cy: 30, fill: "#ff6b6b" },
            },
            {
              type: "circle",
              props: { r: 10, cx: 70, cy: 40, fill: "#4ecdc4" },
            },
            {
              type: "circle",
              props: { r: 8, cx: 60, cy: 70, fill: "#45b7d1" },
            },
          ].map((item, index) => (
            <motion.circle
              key={index}
              {...item.props}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                type: "spring",
                stiffness: 200,
              }}
            />
          ))}
        </>
      ),
    },
    {
      label: "Star",
      content: (
        <>
          {/* Star content - triangular elements */}
          {[
            {
              type: "polygon",
              props: { points: "40,20 60,20 50,40", fill: "#f39c12" },
            },
            {
              type: "polygon",
              props: { points: "30,60 50,60 40,80", fill: "#e74c3c" },
            },
            {
              type: "polygon",
              props: { points: "60,65 80,65 70,85", fill: "#9b59b6" },
            },
          ].map((item, index) => (
            <motion.polygon
              key={index}
              {...item.props}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                type: "spring",
                stiffness: 200,
              }}
            />
          ))}
        </>
      ),
    },
    {
      label: "Heart",
      content: (
        <>
          {/* Heart content - organic shapes */}
          {[
            {
              type: "ellipse",
              props: { rx: 12, ry: 8, cx: 35, cy: 40, fill: "#ff69b4" },
            },
            {
              type: "ellipse",
              props: { rx: 8, ry: 12, cx: 65, cy: 45, fill: "#ff1493" },
            },
            {
              type: "ellipse",
              props: { rx: 10, ry: 6, cx: 50, cy: 65, fill: "#ffc0cb" },
            },
          ].map((item, index) => (
            <motion.ellipse
              key={index}
              {...item.props}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                type: "spring",
                stiffness: 200,
              }}
            />
          ))}
        </>
      ),
    },
    {
      label: "Diamond",
      content: (
        <>
          {/* Diamond content - rectangular elements */}
          {[
            {
              type: "rect",
              props: { width: 20, height: 12, x: 25, y: 35, fill: "#32cd32" },
            },
            {
              type: "rect",
              props: { width: 15, height: 15, x: 55, y: 30, fill: "#228b22" },
            },
            {
              type: "rect",
              props: { width: 18, height: 10, x: 40, y: 60, fill: "#90ee90" },
            },
          ].map((item, index) => (
            <motion.rect
              key={index}
              {...item.props}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                type: "spring",
                stiffness: 200,
              }}
            />
          ))}
        </>
      ),
    },
  ];

  return (
    <MorphingClipPath
      maskEffect="solid"
      maskedOpacity={0.5}
      clipPaths={clipPaths}
      contentGroups={contentGroups}
      className="w-full h-96 border rounded-lg bg-gray-50"
      width={100}
      height={100}
      showControls={true}
      autoCycle={false}
      morphDuration={1.2}
      showOutline={true}
      initialIndex={0}
      clipContent={true}
    />
  );
};

export default Page;
