import { useEffect, useRef } from "react";

type AnimationFrameCallback = (args: {
    time: number;
    delta: number;
}) => void;

export const useAnimationFrame = (callback: AnimationFrameCallback) => {
    const animationRef = useRef<number | null>(null);
    const init = useRef(performance.now());
    const last = useRef(performance.now());

    const animate = (now: number) => {
        callback({
            time: (now - init.current) / 1000,
            delta: (now - last.current) / 1000,
        });
        last.current = now;
        animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        const frameId = requestAnimationFrame(animate);
        animationRef.current = frameId;
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [callback]);
};
