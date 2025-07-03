"use client";

import { HandlerArgs } from "@/components/drag";
import { CircularArcHandle } from "@/components/ui/circular-arc-handle";
import { CustomDragHandle, FramerMotionDragHandle } from "@/components/ui/drag-handle";
import { DraggableHandle } from "@/components/ui/draggable-handle";
import { motion } from "motion/react";
import { useState } from "react";

// Example of a simple linear drag handle using the generic DragHandle
const LinearDragExample = ({ dragValue, dragging, onDragStart, onDragMove, onDragEnd }: any) => (
  <motion.div
    drag="x"
    onDragStart={onDragStart}
    onDrag={(e, info) => onDragMove(info)}
    onDragEnd={onDragEnd}
    className={`w-16 h-16 bg-blue-500 rounded-full cursor-grab ${dragging ? "cursor-grabbing scale-110" : ""
      } shadow-lg`}
    style={{ x: dragValue }}
    whileDrag={{ scale: 1.1 }}
  />
);

const Page = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [framerMotionAngle, setFramerMotionAngle] = useState(0);
  const [customDragAngle, setCustomDragAngle] = useState(0);
  const [linearValue, setLinearValue] = useState(0);



  const handleCustomDragMove = (args: HandlerArgs) => {
    console.log('Custom drag move:', args);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-12">

        {/* Framer Motion Circular Arc Handle */}
        <div className="text-center">
          <h2 className="text-white text-lg mb-4 font-semibold">Framer Motion Implementation</h2>
          <div className="w-64 h-64">
            <FramerMotionDragHandle
              initialValue={0}
              onChange={(value) => setFramerMotionAngle(value)}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              dragSensitivity={-1} // Negative to match original behavior
            >
              {({ progress, dragValue, dragging, onDragStart, onDragMove, onDragEnd }) => (
                <CircularArcHandle
                  progress={progress}
                  dragAngle={dragValue}
                  dragging={dragging}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                  perspective={1000}
                  radius={45}
                />
              )}
            </FramerMotionDragHandle>
          </div>
        </div>

        {/* Custom Drag Implementation Circular Arc Handle */}
        <div className="text-center">
          <h2 className="text-white text-lg mb-4 font-semibold">Custom Drag Implementation</h2>
          <div className="w-64 h-64">
            <CustomDragHandle
              initialValue={0}
              onChange={(value) => setCustomDragAngle(value)}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              onCustomDragMove={handleCustomDragMove}
              dragSensitivity={-1}
            >
              {({ progress, dragValue, dragging, onDragStart, onDragMove, onDragEnd, customDragHandlers }) => (
                <CircularArcHandle
                  progress={progress}
                  dragAngle={dragValue}
                  dragging={dragging}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                  perspective={1000}
                  activeColor="#10b981"
                  customDragHandlers={customDragHandlers}
                />
              )}
            </CustomDragHandle>
          </div>
        </div>

        {/* Linear Drag Handle Example */}
        <div className="text-center">
          <h2 className="text-white text-lg mb-4 font-semibold">Linear Drag Example</h2>
          <div className="w-80 h-20 bg-gray-800 rounded-lg flex items-center justify-center relative">
            <FramerMotionDragHandle
              initialValue={0}
              onChange={(value) => setLinearValue(value)}
              dragSensitivity={0.5}
            >
              {({ dragValue, dragging, onDragStart, onDragMove, onDragEnd }) => (
                <LinearDragExample
                  dragValue={dragValue}
                  dragging={dragging}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              )}
            </FramerMotionDragHandle>
          </div>
        </div>

        {/* Existing DraggableHandle Example */}
        <div className="text-center">
          <h2 className="text-white text-lg mb-4 font-semibold">Existing DraggableHandle</h2>
          <div className="w-80 h-20 bg-gray-800 rounded-lg flex items-center justify-center relative">
            <CustomDragHandle
              initialValue={0}
              onChange={(value) => setLinearValue(value)}
              dragSensitivity={0.5}
            >
              {({ dragValue, dragging, onDragStart, onDragMove, onDragEnd, progress }) => (
                <DraggableHandle
                  progress={progress!}
                  dragX={dragValue}
                  dragging={dragging}
                  onDragStart={onDragStart}
                  onDragMove={(args: HandlerArgs) => {
                    onDragMove({ delta: { x: args.dx, y: args.dy } });
                  }}
                  onDragEnd={onDragEnd}
                  width={1920}
                  height={1080}
                >
                </DraggableHandle>
              )}
            </CustomDragHandle>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="absolute top-4 left-4 text-white text-sm font-mono">
        <div>Framer Motion Angle: {Math.round(framerMotionAngle)}°</div>
        <div>Custom Drag Angle: {Math.round(customDragAngle)}°</div>
        <div>Linear Value: {Math.round(linearValue)}</div>
        <div>Dragging: {isDragging ? "Yes" : "No"}</div>
      </div>
    </div>
  );
};

export default Page;
