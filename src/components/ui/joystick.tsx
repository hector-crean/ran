import React, {
  useRef,
  useState,
  forwardRef,
  createContext,
  useContext,
} from "react";
import {
  animate,
  DragHandler,
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
  MotionValue,
  clamp,
} from "motion/react";
import { cn } from "@/lib/utils";

// Types
interface JoyStickContextValue {
  dragX: MotionValue<number>;
  dragY: MotionValue<number>;
  progressX: MotionValue<number>;
  progressY: MotionValue<number>;
  progress: MotionValue<number>;
  progressDirection: { x: number; y: number };
  normalizedDistance: MotionValue<number>;
  isDragging: boolean;
  joystickSize: number;
  handleSize: number;
  maxDistance: number;
  threshold: number;
  completed: boolean;
  onDragEnd: DragHandler;
  onDragStart?: () => void;
  onReset?: () => void;
  dragControls: ReturnType<typeof useDragControls>;
  startDrag: (event: React.PointerEvent<HTMLElement>) => void;
  resetJoystick: () => void;
}

interface JoyStickRootProps {
  children: React.ReactNode;
  size?: number;
  handleSize?: number;
  disabled?: boolean;
  threshold?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onReset?: () => void;
  className?: string;
  style?: React.CSSProperties;
  progressDirection: { x: number; y: number };
}

interface JoyStickContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface JoyStickTrackProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface JoyStickHandleProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface JoyStickProgressProps {
  className?: string;
  style?: React.CSSProperties;
}

interface JoyStickTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fadeOnDrag?: boolean;
}

interface JoyStickDragAreaProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fullScreen?: boolean;
}

interface JoyStickProjectedProgressProps {
  className?: string;
  style?: React.CSSProperties;
}

// Context
const JoyStickContext = createContext<JoyStickContextValue | null>(null);

const useJoyStick = () => {
  const context = useContext(JoyStickContext);
  if (!context) {
    throw new Error("JoyStick components must be used within a JoyStick.Root");
  }
  return context;
};

// Root Component (Context Provider Only)
const JoyStickRoot = forwardRef<HTMLDivElement, JoyStickRootProps>(
  (
    {
      children,
      size = 200,
      handleSize = 40,
      disabled = false,
      threshold = 0.5,
      onDragStart,
      onDragEnd,
      onReset,
      progressDirection,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const dragControls = useDragControls();
    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);

    const [isDragging, setIsDragging] = useState(false);

    const [completed, setCompleted] = useState(false);

    // Calculate the maximum distance from center to edge
    const maxDistance = (size - handleSize) / 2;

    // Calculate progress from -1 to 1 for both axes
    const progressX = useTransform(
      dragX,
      [-maxDistance, 0, maxDistance],
      [0, 0, 1]
    );
    const progressY = useTransform(
      dragY,
      [-maxDistance, 0, maxDistance],
      [0, 0, 1]
    );
    const progress = useTransform(
      [progressX, progressY],
      ([x, y]: Array<number>) => {
        return clamp(0, 1, x * progressDirection.x + y * progressDirection.y);
      }
    );

    // Calculate normalized distance from center (0 to 1)
    const normalizedDistance = useTransform(
      [dragX, dragY],
      (values: number[]) => {
        const [x, y] = values;
        const distance = Math.sqrt(x * x + y * y);
        return Math.min(distance / maxDistance, 1);
      }
    );

    const handleDragEnd: DragHandler = async (event, info) => {
      setIsDragging(false);
      const currentProgress = progress.get();

      if (currentProgress >= threshold && !completed && !disabled) {
        setCompleted(true);

        // Animate both axes simultaneously using Promise.all
        await Promise.all([
          animate(dragX, maxDistance * progressDirection.x, {
            type: "spring",
            stiffness: 400,
            damping: 30,
          }),
          animate(dragY, maxDistance * progressDirection.y, {
            type: "spring",
            stiffness: 400,
            damping: 30,
          }),
        ]);

        onDragEnd?.();
      } else if (!completed && !disabled) {
        // Animate both axes back to center simultaneously using Promise.all
        await Promise.all([
          animate(dragX, 0, {
            type: "spring",
            stiffness: 400,
            damping: 30,
          }),
          animate(dragY, 0, {
            type: "spring",
            stiffness: 400,
            damping: 30,
          }),
        ]).then(() => {
          onDragEnd?.();
        });
      }
    };

    const startDrag = (event: React.PointerEvent<HTMLElement>) => {
      if (!disabled) {
        setIsDragging(true);
        dragControls.start(event);
        onDragStart?.();
      }
    };

    const resetJoystick = async () => {
      setIsDragging(false);
      setCompleted(false);

      // Animate both axes to center simultaneously
      await Promise.all([
        animate(dragX, 0, {
          type: "spring",
          stiffness: 300,
          damping: 30,
        }),
        animate(dragY, 0, {
          type: "spring",
          stiffness: 300,
          damping: 30,
        }),
      ]);

      onReset?.();
    };

    const contextValue: JoyStickContextValue = {
      dragX,
      dragY,
      progressX,
      progressY,
      progress,
      progressDirection,
      normalizedDistance,
      threshold,
      completed,
      isDragging,
      joystickSize: size,
      handleSize,
      maxDistance,
      onDragEnd: handleDragEnd,
      onDragStart,
      onReset: resetJoystick,
      dragControls,
      startDrag,
      resetJoystick,
    };

    return (
      <JoyStickContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("relative", className)}
          style={style}
          {...props}
        >
          {children}
        </div>
      </JoyStickContext.Provider>
    );
  }
);

// Container Component (Visual Joystick Elements)
const JoyStickContainer = forwardRef<HTMLDivElement, JoyStickContainerProps>(
  ({ children, className, style, ...props }, ref) => {
    const { joystickSize } = useJoyStick();

    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        style={{
          width: joystickSize,
          height: joystickSize,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Track Component (Square boundary)
const JoyStickTrack = forwardRef<HTMLDivElement, JoyStickTrackProps>(
  ({ children, className, style, ...props }, ref) => {
    const { joystickSize } = useJoyStick();

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800",
          className
        )}
        style={{
          width: joystickSize,
          height: joystickSize,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Handle Component (Centered initially)
const JoyStickHandle = forwardRef<HTMLDivElement, JoyStickHandleProps>(
  ({ children, className, style, ...props }, ref) => {
    const {
      dragX,
      dragY,
      handleSize,
      maxDistance,
      onDragEnd,
      dragControls,
      isDragging,
      completed,
    } = useJoyStick();

    return (
      <motion.div
        ref={ref}
        className={cn(
          "absolute flex -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full bg-white shadow-lg active:cursor-grabbing",
          isDragging && "cursor-grabbing",
          className
        )}
        style={{
          width: handleSize,
          height: handleSize,
          left: "50%",
          top: "50%",
          x: dragX,
          y: dragY,
          ...style,
        }}
        drag={completed ? false : true}
        dragConstraints={{
          left: -maxDistance,
          right: maxDistance,
          top: -maxDistance,
          bottom: maxDistance,
        }}
        dragControls={dragControls}
        dragListener={false}
        dragElastic={0}
        onDragEnd={onDragEnd}
        whileDrag={{ scale: 1.05 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

// Progress Component (Visual feedback for distance)
const JoyStickProgress = forwardRef<HTMLDivElement, JoyStickProgressProps>(
  ({ className, style, ...props }, ref) => {
    const { normalizedDistance, handleSize } = useJoyStick();

    return (
      <motion.div
        ref={ref}
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-green-500/20",
          className
        )}
        style={{
          width: useTransform(normalizedDistance, d => handleSize + d * 60),
          height: useTransform(normalizedDistance, d => handleSize + d * 60),
          ...style,
        }}
        {...props}
      />
    );
  }
);

// Projected Progress Component (Shows where progress calculation places the handle)
const JoyStickProjectedProgress = forwardRef<
  HTMLDivElement,
  JoyStickProjectedProgressProps
>(({ className, style, ...props }, ref) => {
  const { progress, progressDirection, handleSize, maxDistance } =
    useJoyStick();

  // Calculate projected position based on progress and direction
  const projectedX = useTransform(
    progress,
    p => p * progressDirection.x * maxDistance
  );
  const projectedY = useTransform(
    progress,
    p => p * progressDirection.y * maxDistance
  );

  return (
    <motion.div
      ref={ref}
      className={cn(
        "pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-green-400 bg-green-400/20",
        className
      )}
      style={{
        width: handleSize * 0.8,
        height: handleSize * 0.8,
        left: "50%",
        top: "50%",
        x: projectedX,
        y: projectedY,
        ...style,
      }}
      {...props}
    >
      <div className="h-2 w-2 rounded-full bg-green-400" />
    </motion.div>
  );
});

// Text Component
const JoyStickText = forwardRef<HTMLDivElement, JoyStickTextProps>(
  ({ children, className, style, fadeOnDrag = true, ...props }, ref) => {
    const { normalizedDistance } = useJoyStick();

    const textOpacity = fadeOnDrag
      ? useTransform(normalizedDistance, [0, 0.5], [1, 0])
      : undefined;

    return (
      <motion.div
        ref={ref}
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-600 select-none dark:text-gray-400",
          className
        )}
        style={{
          opacity: textOpacity,
          ...style,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

// Drag Area Component (Completely Decoupled)
const JoyStickDragArea = forwardRef<HTMLDivElement, JoyStickDragAreaProps>(
  ({ children, className, style, fullScreen = false, ...props }, ref) => {
    const { startDrag, isDragging } = useJoyStick();

    return (
      <div
        ref={ref}
        className={cn(
          "cursor-grab active:cursor-grabbing",
          fullScreen ? "fixed inset-0 h-screen w-screen" : "absolute inset-0",
          isDragging && "cursor-grabbing",
          className
        )}
        style={{
          touchAction: "none",
          ...style,
        }}
        onPointerDown={startDrag}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Compound component setup
const JoyStick = Object.assign(JoyStickRoot, {
  Root: JoyStickRoot,
  Container: JoyStickContainer,
  Track: JoyStickTrack,
  Handle: JoyStickHandle,
  Progress: JoyStickProgress,
  ProjectedProgress: JoyStickProjectedProgress,
  Text: JoyStickText,
  DragArea: JoyStickDragArea,
});

// Display names
JoyStickRoot.displayName = "JoyStick.Root";
JoyStickContainer.displayName = "JoyStick.Container";
JoyStickTrack.displayName = "JoyStick.Track";
JoyStickHandle.displayName = "JoyStick.Handle";
JoyStickProgress.displayName = "JoyStick.Progress";
JoyStickProjectedProgress.displayName = "JoyStick.ProjectedProgress";
JoyStickText.displayName = "JoyStick.Text";
JoyStickDragArea.displayName = "JoyStick.DragArea";

export default JoyStick;
export { useJoyStick };

// Convenience hooks
export const useJoyStickState = () => {
  const { isDragging, progressX, progressY, normalizedDistance } =
    useJoyStick();
  return {
    isDragging,
    progressX: progressX.get(),
    progressY: progressY.get(),
    normalizedDistance: normalizedDistance.get(),
    angle: Math.atan2(progressY.get(), progressX.get()),
  };
};

export const useJoyStickDrag = () => {
  const { startDrag, isDragging, resetJoystick } = useJoyStick();
  return { startDrag, isDragging, resetJoystick };
};

export const useJoyStickPosition = () => {
  const { dragX, dragY, progressX, progressY, normalizedDistance } =
    useJoyStick();
  return {
    rawX: dragX.get(),
    rawY: dragY.get(),
    normalizedX: progressX.get(),
    normalizedY: progressY.get(),
    distance: normalizedDistance.get(),
    angle: Math.atan2(progressY.get(), progressX.get()),
  };
};
