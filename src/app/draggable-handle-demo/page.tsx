"use client";

import { HandlerArgs } from "@/components/drag";
import { CircularArcHandle } from "@/components/ui/circular-arc-handle";
import { DraggableHandle } from "@/components/ui/draggable-handle";
import { clamp } from "@/lib/utils";
import { animate, useMotionValue, useTransform } from "motion/react";
import { useState } from "react";

const DraggableHandleDemo = () => {
    const [handleType, setHandleType] = useState<'circle' | 'arc'>('circle');
    const [dragging, setDragging] = useState(false);

    const progress = useMotionValue(0);
    const width = 800;
    const height = 400;
    const dragX = useTransform(progress, [0, 1], [50, width - 50]);

    const handleDragMove = (args: HandlerArgs) => {
        const newProgress = clamp(args.dx / (width - 100), 0, 1);
        progress.set(newProgress);
    };

    const handleDragEnd = () => {
        setDragging(false);
        const currentProgress = progress.get();

        if (currentProgress < 0.95) {
            animate(progress, 0, { type: "spring", stiffness: 300, damping: 30 });
        } else {
            animate(progress, 1, { type: "spring", stiffness: 300, damping: 30 });
        }
    };

    const handleDragStart = () => {
        setDragging(true);
    };

    return (
        <div className="w-full h-screen bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-white text-3xl font-bold mb-8">Draggable Handle Component Demo</h1>

                {/* Handle Type Selector */}
                <div className="mb-8">
                    <label className="text-white mb-4 block">Handle Type:</label>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setHandleType('circle')}
                            className={`px-4 py-2 rounded ${handleType === 'circle'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-600 text-gray-300'
                                }`}
                        >
                            Simple Circle
                        </button>
                        <button
                            onClick={() => setHandleType('arc')}
                            className={`px-4 py-2 rounded ${handleType === 'arc'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-600 text-gray-300'
                                }`}
                        >
                            Circular Arc
                        </button>
                    </div>
                </div>

                {/* Progress Display */}
                <div className="mb-4">
                    <span className="text-white">
                        Progress: {Math.round(progress.get() * 100)}%
                    </span>
                </div>

                {/* Draggable Handle Demo */}
                <div className="relative w-full h-96 bg-gray-800 rounded-lg overflow-hidden">
                    <DraggableHandle
                        progress={progress}
                        dragX={dragX}
                        dragging={dragging}
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        width={width}
                        height={height}
                    >
                        {handleType === 'arc' && (
                            <CircularArcHandle
                                progress={progress}
                                size={80}
                                baseColor="#ffffff"
                                activeColor="#3b82f6"
                            />
                        )}
                    </DraggableHandle>
                </div>

                {/* Usage Example */}
                <div className="mt-8 text-white">
                    <h2 className="text-xl font-semibold mb-4">Usage Example:</h2>
                    <div className="bg-gray-800 p-4 rounded text-sm">
                        <pre className="text-green-400">{`// In your sequence slide:
<DraggableHandle
  progress={progress}
  dragX={dragX}
  dragging={dragging}
  onDragStart={handleDragStart}
  onDragMove={handleDragMove}
  onDragEnd={handleDragEnd}
  width={width}
  height={height}
>
  {handleType === 'arc' && (
    <CircularArcHandle 
      progress={progress}
      size={60}
      baseColor="#ffffff"
      activeColor="#3b82f6"
    />
  )}
</DraggableHandle>`}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DraggableHandleDemo; 