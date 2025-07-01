import { useEffect, useRef, useState } from "react";

interface UseImageSequenceOptions {
    onProgress?: (progress: number) => void;
    enableFallback?: boolean; // Whether to show first image immediately
}

interface UseImageSequenceReturn {
    images: (HTMLImageElement | null)[];
    loaded: boolean; // All images loaded
    firstImageLoaded: boolean; // First image loaded (for fallback)
    progress: number;
}

export const useImageSequence = (
    imagePaths: string[],
    { onProgress, enableFallback = true }: UseImageSequenceOptions = {}
): UseImageSequenceReturn => {
    const [loaded, setLoaded] = useState(false);
    const [firstImageLoaded, setFirstImageLoaded] = useState(false);
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
            setFirstImageLoaded(true);
            setProgress(1);
            return;
        }

        // Reset state when imagePaths change
        setLoaded(false);
        setFirstImageLoaded(false);
        setProgress(0);
        frames.current = new Array(imagePaths.length).fill(null);

        let isCancelled = false;
        let loadedCount = 0;
        const total = imagePaths.length;

        const updateProgress = (isFirstImage = false) => {
            if (isCancelled) return;

            if (isFirstImage && enableFallback) {
                setFirstImageLoaded(true);
            }

            loadedCount++;
            const currentProgress = loadedCount / total;
            setProgress(currentProgress);
            onProgressRef.current?.(currentProgress);

            if (loadedCount === total) {
                setLoaded(true);
            }
        };

        // If enableFallback is true, prioritize loading the first image
        if (enableFallback && imagePaths.length > 0) {
            const firstImage = new Image();
            firstImage.onload = () => {
                if (isCancelled) return;
                frames.current[0] = firstImage;
                updateProgress(true);
            };
            firstImage.onerror = () => {
                if (isCancelled) return;
                console.warn(`Failed to load first image: ${imagePaths[0]}`);
                frames.current[0] = null;
                updateProgress(true);
            };
            firstImage.src = imagePaths[0];

            // Load the rest of the images
            imagePaths.slice(1).forEach((src, index) => {
                const actualIndex = index + 1; // Adjust for slice
                const image = new Image();
                image.onload = () => {
                    if (isCancelled) return;
                    frames.current[actualIndex] = image;
                    updateProgress();
                };
                image.onerror = () => {
                    if (isCancelled) return;
                    console.warn(`Failed to load image: ${src}`);
                    frames.current[actualIndex] = null;
                    updateProgress();
                };
                image.src = src;
            });
        } else {
            // Original behavior - load all images in parallel
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
                    updateProgress();
                };
                image.src = src;
            });
        }

        return () => {
            isCancelled = true;
        };
    }, [imagePaths, enableFallback]);

    return {
        images: frames.current,
        loaded,
        firstImageLoaded,
        progress
    };
};
