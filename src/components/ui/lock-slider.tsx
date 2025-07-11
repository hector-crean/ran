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
} from "motion/react";
import { cn } from "@/lib/utils";

// Types
interface LockSliderContextValue {
  dragX: MotionValue<number>;
  progress: MotionValue<number>;
  completed: boolean;
  isUnlocked: boolean;
  isDragging: boolean;
  sliderWidth: number;
  handleSize: number;
  threshold: number;
  onDragEnd: DragHandler;
  onUnlock?: () => void;
  onReset?: () => void;
  dragControls: ReturnType<typeof useDragControls>;
  startDrag: (event: React.PointerEvent<HTMLElement>) => void;
}

interface LockSliderRootProps {
  children: React.ReactNode;
  width?: number;
  handleSize?: number;
  threshold?: number;
  disabled?: boolean;
  onUnlock?: () => void;
  onReset?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

interface LockSliderContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface LockSliderTrackProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface LockSliderHandleProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface LockSliderProgressProps {
  className?: string;
  style?: React.CSSProperties;
}

interface LockSliderTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fadeOnDrag?: boolean;
}

interface LockSliderDragAreaProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fullScreen?: boolean;
}

// Context
const LockSliderContext = createContext<LockSliderContextValue | null>(null);

const useLockSlider = () => {
  const context = useContext(LockSliderContext);
  if (!context) {
    throw new Error(
      "LockSlider components must be used within a LockSlider.Root"
    );
  }
  return context;
};

// Root Component (Context Provider Only)
const LockSliderRoot = forwardRef<HTMLDivElement, LockSliderRootProps>(
  (
    {
      children,
      width = 300,
      handleSize = 50,
      threshold = 0.7,
      disabled = false,
      onUnlock,
      onReset,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const dragControls = useDragControls();
    const dragX = useMotionValue(0);

    const [completed, setCompleted] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Calculate progress from 0 to 1
    const progress = useTransform(dragX, [0, width - handleSize], [0, 1]);

    const handleDragEnd: DragHandler = (event, info) => {
      setIsDragging(false);
      const currentProgress = progress.get();

      if (currentProgress >= threshold && !completed && !disabled) {
        setCompleted(true);
        animate(dragX, width - handleSize, {
          type: "spring",
          stiffness: 400,
          damping: 30,
        }).then(() => {
          setIsUnlocked(true);
          onUnlock?.();
        });
      } else if (!completed && !disabled) {
        animate(dragX, 0, {
          type: "spring",
          stiffness: 400,
          damping: 30,
        });
      }
    };

    const startDrag = (event: React.PointerEvent<HTMLElement>) => {
      if (!completed && !isUnlocked && !disabled) {
        setIsDragging(true);
        dragControls.start(event);
      }
    };

    const resetSlider = () => {
      setCompleted(false);
      setIsUnlocked(false);
      animate(dragX, 0, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
      onReset?.();
    };

    const contextValue: LockSliderContextValue = {
      dragX,
      progress,
      completed,
      isUnlocked,
      isDragging,
      sliderWidth: width,
      handleSize,
      threshold,
      onDragEnd: handleDragEnd,
      onUnlock,
      onReset: resetSlider,
      dragControls,
      startDrag,
    };

    return (
      <LockSliderContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("relative", className)}
          style={style}
          {...props}
        >
          {children}
        </div>
      </LockSliderContext.Provider>
    );
  }
);

// Container Component (Visual Slider Elements)
const LockSliderContainer = forwardRef<
  HTMLDivElement,
  LockSliderContainerProps
>(({ children, className, style, ...props }, ref) => {
  const { sliderWidth, handleSize } = useLockSlider();

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      style={{
        width: sliderWidth,
        height: handleSize,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

// Track Component
const LockSliderTrack = forwardRef<HTMLDivElement, LockSliderTrackProps>(
  ({ children, className, style, ...props }, ref) => {
    const { sliderWidth, handleSize } = useLockSlider();

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
          className
        )}
        style={{
          width: sliderWidth,
          height: handleSize,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Handle Component
const LockSliderHandle = forwardRef<HTMLDivElement, LockSliderHandleProps>(
  ({ children, className, style, ...props }, ref) => {
    const {
      dragX,
      completed,
      handleSize,
      sliderWidth,
      onDragEnd,
      dragControls,
      isDragging,
    } = useLockSlider();

    return (
      <motion.div
        ref={ref}
        className={cn(
          "absolute top-0 left-0 flex cursor-grab items-center justify-center rounded-full bg-white shadow-lg active:cursor-grabbing",
          isDragging && "cursor-grabbing",
          className
        )}
        style={{
          width: handleSize,
          height: handleSize,
          x: dragX,
          ...style,
        }}
        drag={completed ? false : "x"}
        dragConstraints={{ left: 0, right: sliderWidth - handleSize }}
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

// Progress Component
const LockSliderProgress = forwardRef<HTMLDivElement, LockSliderProgressProps>(
  ({ className, style, ...props }, ref) => {
    const { dragX, handleSize } = useLockSlider();

    return (
      <motion.div
        ref={ref}
        className={cn(
          "absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500/30 to-green-500/30",
          className
        )}
        style={{
          width: useTransform(dragX, x => Math.max(0, x + handleSize)),
          ...style,
        }}
        {...props}
      />
    );
  }
);

// Text Component
const LockSliderText = forwardRef<HTMLDivElement, LockSliderTextProps>(
  ({ children, className, style, fadeOnDrag = true, ...props }, ref) => {
    const { dragX } = useLockSlider();

    const textOpacity = fadeOnDrag
      ? useTransform(dragX, [0, 100], [1, 0])
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
const LockSliderDragArea = forwardRef<HTMLDivElement, LockSliderDragAreaProps>(
  ({ children, className, style, fullScreen = false, ...props }, ref) => {
    const { startDrag, isDragging } = useLockSlider();

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
const LockSlider = Object.assign(LockSliderRoot, {
  Root: LockSliderRoot,
  Container: LockSliderContainer,
  Track: LockSliderTrack,
  Handle: LockSliderHandle,
  Progress: LockSliderProgress,
  Text: LockSliderText,
  DragArea: LockSliderDragArea,
});

// Display names
LockSliderRoot.displayName = "LockSlider.Root";
LockSliderContainer.displayName = "LockSlider.Container";
LockSliderTrack.displayName = "LockSlider.Track";
LockSliderHandle.displayName = "LockSlider.Handle";
LockSliderProgress.displayName = "LockSlider.Progress";
LockSliderText.displayName = "LockSlider.Text";
LockSliderDragArea.displayName = "LockSlider.DragArea";

export default LockSlider;
export { useLockSlider };

// Convenience hooks
export const useLockSliderState = () => {
  const { completed, isUnlocked, isDragging, progress } = useLockSlider();
  return { completed, isUnlocked, isDragging, progress: progress.get() };
};

export const useLockSliderDrag = () => {
  const { startDrag, isDragging } = useLockSlider();
  return { startDrag, isDragging };
};
