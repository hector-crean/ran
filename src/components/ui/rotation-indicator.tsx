import { HandlerArgs } from "@/components/drag";
import { clamp } from "@/lib/utils";
import { motion, MotionValue, useMotionTemplate, useTransform } from "motion/react";
import { ReactNode } from "react";

interface RotationIndicatorProps {
    dragAngle: MotionValue<number>;
    dragging: boolean;
    radius?: number;
    strokeWidth?: number;
    baseColor?: string;
    activeColor?: string;
    perspective?: number;
    children?: ReactNode;
   
}

export const RotationIndicator = ({
    dragAngle,
    dragging,
    radius = 45,
    strokeWidth = 10,
    baseColor = "#e2e8f0",
    activeColor = "#3b82f6",
    perspective = 1000,
    children,
}: RotationIndicatorProps) => {

    const CIRCUMFERENCE_RATIO = 0.8;
    const HANDLE_TO_CIRCUMFERENCE_RATIO = 0.02;

    const circumference = 2 * Math.PI * radius;
    const arcLength = circumference * HANDLE_TO_CIRCUMFERENCE_RATIO;
    const dashOffset = circumference - arcLength;

    const transform3d = useMotionTemplate`rotate3d(1,0,0,-78deg)`;
    const handleTransform = useTransform(dragAngle, (v) => `rotate(${clamp(v, 0, (CIRCUMFERENCE_RATIO - HANDLE_TO_CIRCUMFERENCE_RATIO) * 360)}deg)`);

    const x = useTransform(dragAngle, (v) => {
        return radius * Math.cos(v * Math.PI / 180);
    });
    const y = useTransform(dragAngle, (v) => {
        return radius * Math.sin(v * Math.PI / 180);
    });


    return (
        <motion.div
            className="relative w-full h-full flex items-center justify-center"
            style={{ perspective: perspective, touchAction: "none" }}
        >
            <motion.div
                style={{
                    transform: transform3d,
                }}
                className={`cursor-grab active:cursor-grabbing w-full h-full ${dragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
            >
                <motion.svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
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
                        style={{
                            transform:`scaleX(-1) rotate(${-90 + 0.5 * (1 - CIRCUMFERENCE_RATIO ) * 360}deg)`,
                            transformOrigin: "center",

                        }}
                    >
                        {/* Base circle with gradient */}
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke="url(#circle-gradient)"
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference * CIRCUMFERENCE_RATIO}
                            filter="url(#glow)"
                        />

                        {/* Animated progress arc with gradient */}
                        <motion.circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke="url(#progress-gradient)"
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{
                                strokeDashoffset: dashOffset,
                            }}
                            transition={{
                                strokeDashoffset: { duration: 0.6, ease: "easeOut" },
                            }}
                            style={{
                                transformOrigin: "center",
                                transform: handleTransform,
                            }}
                        />
                        {/* <motion.circle
                            cx={x}
                            cy={y}
                            r={4}
                            fill="red"
                            stroke="none"
                        /> */}
                       
                    </motion.g>
                    


                </motion.svg>
                {children}
            </motion.div>
        </motion.div>
    );
}; 

