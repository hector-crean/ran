import { HandlerArgs } from "@/components/drag";
import { MotionValue, useMotionValue, useSpring } from "motion/react";
import { ReactNode, useState } from "react";

// Shared interface for both drag implementations
export interface DragHandleRenderProps {
    progress: MotionValue<number>;
    dragValue: MotionValue<number>;
    dragging: boolean;
    onDragStart: () => void;
    onDragMove: (info: { delta: { x: number; y: number } }) => void;
    onDragEnd: () => void;
    // Optional custom drag handlers for components that need direct access
    customDragHandlers?: {
        onDragStart: (args: HandlerArgs) => void;
        onDragMove: (args: HandlerArgs) => void;
        onDragEnd: (args: HandlerArgs) => void;
    };
}

// Shared configuration interface
interface BaseDragHandleProps {
    initialValue?: number;
    onChange?: (value: number) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    dragSensitivity?: number;
    dragDirection?: [number, number]; // Unit vector defining drag direction
    maxValue?: number; // For progress normalization
    springConfig?: {
        stiffness: number;
        damping: number;
    };
    children: (props: DragHandleRenderProps) => ReactNode;
}

// Framer Motion implementation
interface FramerMotionDragHandleProps extends BaseDragHandleProps { }

export const FramerMotionDragHandle = ({
    initialValue = 0,
    onChange,
    onDragStart,
    onDragEnd,
    dragSensitivity = 1,
    dragDirection = [1, 0], // Default to horizontal
    maxValue = 360, // Default for rotation/circular progress
    springConfig = { stiffness: 200, damping: 30 },
    children
}: FramerMotionDragHandleProps) => {
    const [dragging, setDragging] = useState(false);

    const rawDragValue = useMotionValue(initialValue);
    const dragValue = useSpring(rawDragValue, springConfig);
    const progress = useMotionValue(initialValue);

    // Normalize the drag direction vector (ensure it's a unit vector)
    const normalizedDirection = (() => {
        const [x, y] = dragDirection;
        const magnitude = Math.sqrt(x * x + y * y);
        return magnitude > 0 ? [x / magnitude, y / magnitude] : [1, 0];
    })();

    const updateDragValue = (delta: { x: number; y: number }) => {
        // Project the drag delta onto the drag direction using dot product
        const projectedMovement = delta.x * normalizedDirection[0] + delta.y * normalizedDirection[1];
        const deltaValue = projectedMovement * dragSensitivity;
        const newValue = rawDragValue.get() + deltaValue;

        rawDragValue.set(newValue);

        const normalizedProgress = Math.max(0, Math.min(1, newValue / maxValue));
        progress.set(normalizedProgress);

        onChange?.(newValue);
    };

    const handleDragStart = () => {
        setDragging(true);
        onDragStart?.();
    };

    const handleDragMove = (info: { delta: { x: number; y: number } }) => {
        updateDragValue(info.delta);
    };

    const handleDragEnd = () => {
        setDragging(false);
        onDragEnd?.();
    };

    return (
        <>
            {children({
                progress,
                dragValue,
                dragging,
                onDragStart: handleDragStart,
                onDragMove: handleDragMove,
                onDragEnd: handleDragEnd
            })}
        </>
    );
};

// Custom Drag implementation
interface CustomDragHandleProps extends BaseDragHandleProps {
    onCustomDragStart?: (args: HandlerArgs) => void;
    onCustomDragMove?: (args: HandlerArgs) => void;
    onCustomDragEnd?: (args: HandlerArgs) => void;
}

export const CustomDragHandle = ({
    initialValue = 0,
    onChange,
    onDragStart,
    onDragEnd,
    onCustomDragStart,
    onCustomDragMove,
    onCustomDragEnd,
    dragSensitivity = 1,
    dragDirection = [1, 0], // Default to horizontal
    maxValue = 360, // Default for rotation/circular progress
    springConfig = { stiffness: 200, damping: 30 },
    children
}: CustomDragHandleProps) => {
    const [dragging, setDragging] = useState(false);

    const rawDragValue = useMotionValue(initialValue);
    const dragValue = useSpring(rawDragValue, springConfig);
    const progress = useMotionValue(initialValue);

    // Normalize the drag direction vector (ensure it's a unit vector)
    const normalizedDirection = (() => {
        const [x, y] = dragDirection;
        const magnitude = Math.sqrt(x * x + y * y);
        return magnitude > 0 ? [x / magnitude, y / magnitude] : [1, 0];
    })();

    const updateDragValue = (delta: { x: number; y: number }) => {
        // Project the drag delta onto the drag direction using dot product
        const projectedMovement = delta.x * normalizedDirection[0] + delta.y * normalizedDirection[1];
        const deltaValue = projectedMovement * dragSensitivity;
        const newValue = rawDragValue.get() + deltaValue;

        rawDragValue.set(newValue);

        const normalizedProgress = Math.max(0, Math.min(1, newValue / maxValue));
        progress.set(normalizedProgress);

        onChange?.(newValue);
    };

    const handleDragStart = () => {
        setDragging(true);
        onDragStart?.();
    };

    const handleDragEnd = () => {
        setDragging(false);
        onDragEnd?.();
    };

    // Adapter for custom drag - converts HandlerArgs to normalized delta format
    const handleCustomDragStart = (args: HandlerArgs) => {
        handleDragStart();
        onCustomDragStart?.(args);
    };

    const handleCustomDragMove = (args: HandlerArgs) => {
        updateDragValue({ x: args.dx, y: args.dy });
        onCustomDragMove?.(args);
    };

    const handleCustomDragEnd = (args: HandlerArgs) => {
        handleDragEnd();
        onCustomDragEnd?.(args);
    };

    // Provide normalized interface to children
    const normalizedDragMove = (info: { delta: { x: number; y: number } }) => {
        updateDragValue(info.delta);
    };

    return (
        <>
            {children({
                progress,
                dragValue,
                dragging,
                onDragStart: handleDragStart,
                onDragMove: normalizedDragMove,
                onDragEnd: handleDragEnd,
                // Pass custom drag handlers when they exist
                ...(onCustomDragStart || onCustomDragMove || onCustomDragEnd ? {
                    customDragHandlers: {
                        onDragStart: handleCustomDragStart,
                        onDragMove: handleCustomDragMove,
                        onDragEnd: handleCustomDragEnd
                    }
                } : {})
            })}
        </>
    );
};

