import { useEffect, useRef, useState } from "react";

interface UseImageSequenceOptions {
    onProgress?: (progress: number) => void;
}

interface UseImageSequenceReturn {
    images: (HTMLImageElement | null)[];
    loaded: boolean;
    progress: number;
}

export const useImageSequence = (
    imagePaths: string[],
    { onProgress }: UseImageSequenceOptions = {}
): UseImageSequenceReturn => {
    const [loaded, setLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const frames = useRef<(HTMLImageElement | null)[]>([]);

    // Use a ref to store the latest onProgress callback without re-triggering the effect
    const onProgressRef = useRef(onProgress);
    useEffect(() => {
        onProgressRef.current = onProgress;
    }, [onProgress]);

    useEffect(() => {
        if (!imagePaths.length) {
            setLoaded(true);
            setProgress(1);
            return;
        }

        // Reset state when imagePaths change
        setLoaded(false);
        setProgress(0);
        frames.current = new Array(imagePaths.length).fill(null);

        let isCancelled = false;
        let loadedCount = 0;
        const total = imagePaths.length;

        const updateProgress = () => {
            if (isCancelled) return;

            loadedCount++;
            const currentProgress = loadedCount / total;
            setProgress(currentProgress);
            onProgressRef.current?.(currentProgress);

            if (loadedCount === total) {
                setLoaded(true);
            }
        };

        imagePaths.forEach((src, index) => {
            const image = new Image();
            image.onload = () => {
                if (isCancelled) return;
                frames.current[index] = image;
                updateProgress();
            };
            image.onerror = () => {
                if (isCancelled) return;
                console.warn(`Failed to load image: ${src}`);
                frames.current[index] = null;
                updateProgress(); // Still update progress even on error
            };
            image.src = src;
        });

        return () => {
            isCancelled = true;
        };
    }, [imagePaths]); // Only depend on imagePaths

    return {
        images: frames.current,
        loaded,
        progress
    };
};
