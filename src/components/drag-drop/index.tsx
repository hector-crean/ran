
"use client"

import { PanInfo } from "motion/react";
import * as motion from "motion/react-client";
import { useRef } from "react";


interface DragDropGridProps {

}

function DragDropGrid() {

    const TARGET_X = 100;

    const containerRef = useRef<HTMLDivElement>(null);

    const targetRef = useRef<HTMLDivElement>(null);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const targetRect = targetRef.current?.getBoundingClientRect();

        if (info.offset.x > TARGET_X) {
            console.log('Target reached');
        }

    }


    return (
        <div ref={containerRef} className="relative w-full h-full isolate">
            <Line direction="x" activeDirection={'x'} />
            <motion.div
                drag
                dragDirectionLock
                onDragEnd={handleDragEnd}
                dragConstraints={containerRef}
                dragTransition={{ bounceStiffness: 500, bounceDamping: 15 }}
                dragElastic={0.2}
                whileDrag={{ cursor: "grabbing" }}
                className="cursor-pointer w-10 h-10 border-1 border-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
            />
            {/* <div ref={targetRef} className="w-10 h-10 border-1 border-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                Target
            </div> */}
        </div>
    )
}

function Line({
    direction,
    activeDirection,
}: {
    direction: "x" | "y"
    activeDirection: "x" | "y" | null
}) {
    return (
        <motion.div
            className="w-1/2 h-1 border-t-1 border-dashed border-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0"
            initial={false}
            animate={{ opacity: activeDirection === direction ? 1 : 0.3 }}
            transition={{ duration: 0.1 }}
            style={{

                rotate: direction === "y" ? 90 : 0
            }}
        />
    )
}










export { DragDropGrid };
export type { DragDropGridProps };


