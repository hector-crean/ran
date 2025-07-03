import { Drag, HandlerArgs } from "@/components/drag";
import { motion, MotionValue } from "motion/react";
import { ReactNode, useRef } from "react";

interface DraggableHandleProps {
    progress: MotionValue<number>;
    dragX: MotionValue<number>;
    dragging: boolean;
    onDragStart: () => void;
    onDragMove: (args: HandlerArgs) => void;
    onDragEnd: () => void;
    width?: number;
    height?: number;
    children?: ReactNode;
}

export const DraggableHandle = ({
    progress,
    dragX,
    dragging,
    onDragStart,
    onDragMove,
    onDragEnd,
    width = 1920,
    height = 1080,
    children
}: DraggableHandleProps) => {
    const pathRef = useRef<SVGPathElement>(null);
    const dragKnobRef = useRef<SVGGElement>(null);

    return (
        <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
                {/* Track line */}
                <path
                    ref={pathRef}
                    d={`M 50 ${height / 2} H ${width - 50}`}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                />

                {/* End zone indicator */}
                <rect
                    x={width - 100}
                    y={height / 2 - 50}
                    width="100"
                    height="100"
                    fill="rgba(255,255,255,0.1)"
                />

                <Drag
                    onDragStart={onDragStart}
                    onDragMove={onDragMove}
                    onDragEnd={onDragEnd}
                    x={50}
                    y={height / 2}
                    width={width}
                    height={height}
                    resetOnStart
                >
                    {({ dragStart, dragEnd, dragMove, isDragging }) => (
                        <motion.g
                            ref={dragKnobRef}
                            style={{
                                cursor: isDragging ? "grabbing" : "grab",
                                x: dragX,
                                y: height / 2,
                            }}
                            onPointerDown={dragStart}
                            onPointerUp={dragEnd}
                            onPointerMove={dragMove}
                            animate={{ scale: isDragging || dragging ? 1.2 : 1 }}
                        >
                            {children || <motion.circle r="20" fill="white" />}
                        </motion.g>
                    )}
                </Drag>
            </svg>
        </motion.div>
    );
}; 