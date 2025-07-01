"use client";
import { useMemo, useRef, useState } from "react";

import { Drag, HandlerArgs } from "@/components/drag";
import { Sequence } from "@/components/sequence";
import { useImageSequence } from "@/hooks/use-image-sequence";
import { clamp } from "@/lib/utils";
import { animate, motion, useMotionValue, useTransform } from "motion/react";


//
type SpaceTimeCoordinate = {
    x: number;
    y: number;
    time: number; // the time is parameterised by t: [0, 1]
}

type Trajectory = SpaceTimeCoordinate[];


interface SequenceSliderClientProps {
    imagePaths: string[];
    trajectory: Trajectory;
}

export const SequenceSliderClient = ({ imagePaths, trajectory }: SequenceSliderClientProps) => {
    const slider = useRef<HTMLDivElement>(null);

    const progress = useMotionValue(0);

    const memoizedImagePaths = useMemo(() => imagePaths, [imagePaths]);

    const { images, loaded } = useImageSequence(memoizedImagePaths);

    const width = 500;
    const height = 500;
    const pathRef = useRef<SVGPathElement>(null);
    const dragKnobRef = useRef<SVGGElement>(null);

    const [dragging, setDragging] = useState(false);

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
    }

    return (
        <div className='w-full h-full relative' ref={slider}>
            {loaded && <Sequence frames={images} value={progress} className={'w-full h-full'} />}

            <div className="absolute top-0 left-0 w-full h-full">
                <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
                    <path
                        ref={pathRef}
                        d={`M 50 ${height / 2} H ${width - 50}`}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="2"
                        strokeDasharray="5 5"
                    />
                    <rect x={width - 100} y={(height / 2) - 50} width="100" height="100" fill="rgba(255,255,255,0.1)" />

                    <Drag
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        x={50}
                        y={height / 2}
                        width={width}
                        height={height}
                        // restrictToPath={pathRef.current ?? undefined}
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
                                <motion.circle
                                    r="20"
                                    fill="white"
                                />
                            </motion.g>
                        )}
                    </Drag>
                </svg>
            </div>
        </div>
    );
}; 