"use client";
import { 
  forwardRef, 
  useImperativeHandle, 
  useRef, 
  useState,
  useCallback
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ColorProbe } from "./ui/color-probe";
import type { Color, Kernel } from "./webgpu-canvas";

export interface ColorProbeOverlayHandle {
  updateProbe: (kernel: Kernel, centerColor: Color, position: { x: number; y: number }) => void;
  hideProbe: () => void;
}

interface ColorProbeOverlayProps {
  kernelSize: number;
  onMouseMove?: (normX: number, normY: number, pixelX: number, pixelY: number) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ColorProbeOverlay = forwardRef<ColorProbeOverlayHandle, ColorProbeOverlayProps>(
  ({ kernelSize, onMouseMove, className, style, children }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [kernel, setKernel] = useState<Kernel>([]);
    const [centerColor, setCenterColor] = useState<Color>({ r: 0, g: 0, b: 0, a: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handlePointerMove = useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (!containerRef.current || !onMouseMove) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const pixelX = event.clientX - rect.left;
        const pixelY = event.clientY - rect.top;
        const normX = pixelX / rect.width;
        const normY = pixelY / rect.height;

        onMouseMove(normX, normY, pixelX, pixelY);
      },
      [onMouseMove]
    );

    useImperativeHandle(ref, () => ({
      updateProbe: (newKernel: Kernel, newCenterColor: Color, newPosition: { x: number; y: number }) => {
        setKernel(newKernel);
        setCenterColor(newCenterColor);
        setPosition(newPosition);
      },
      hideProbe: () => {
        setKernel([]);
      },
    }), []);

    return (
      <div
        ref={containerRef}
        className={className}
        style={style}
        onPointerMove={handlePointerMove}
      >
        {children}
        <AnimatePresence>
          {kernel.length > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute w-fit h-fit pointer-events-none z-30 translate-x-full"
              style={{
                // left: `calc(${position.x}px + 10px)`,
                right: 0,
                top: `calc(${position.y}px + 10px)`,
              }}
            >
              <ColorProbe
                kernel={kernel}
                centerColor={centerColor}
                position={position}
                kernelSize={kernelSize}
                onClose={() => setKernel([])}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

ColorProbeOverlay.displayName = "ColorProbeOverlay"; 