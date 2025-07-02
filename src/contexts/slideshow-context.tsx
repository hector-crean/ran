"use client";

import type { Slide } from "@/types/slides";
import { useParams, useRouter } from "next/navigation";
import React, { createContext, ReactNode, useCallback, useContext, useMemo } from "react";

interface SlideshowContextType {
    slides: Slide[];
    renderSlide: (slide: Slide) => React.ReactNode;
    currentPage: number;
    direction: number;
    setPage: (newPage: number, newDirection?: number) => void;
}

const SlideshowContext = createContext<SlideshowContextType | undefined>(undefined);

export const useSlideshowContext = () => {
    const context = useContext(SlideshowContext);
    if (!context) {
        throw new Error("useSlideshowContext must be used within a SlideshowProvider");
    }
    return context;
};

interface SlideshowProviderProps {
    slides: Slide[];
    renderSlide: (slide: Slide) => React.ReactNode;
    children: ReactNode;
}

export const SlideshowProvider: React.FC<SlideshowProviderProps> = ({
    slides,
    renderSlide,
    children,
}) => {
    const router = useRouter();
    const { slide_id } = useParams<{ slide_id: string }>();

    // Route is the source of truth - derive current page from URL
    const currentPage = useMemo(() => {
        const index = slides.findIndex((s) => s.id === slide_id);
        return index !== -1 ? index : 0;
    }, [slides, slide_id]);

    // Enhanced navigation function with View Transitions API
    const setPage = useCallback((newPage: number, newDirection?: number) => {
        if (newPage >= 0 && newPage < slides.length) {
            const newSlideId = slides[newPage].id;

            // Check if View Transitions API is supported
            if ('startViewTransition' in document) {
                // Use View Transitions API for smooth transitions
                document.startViewTransition(() => {
                    router.push(`/video-slideshow/${newSlideId}`);
                });
            } else {
                // Fallback to regular navigation
                router.push(`/video-slideshow/${newSlideId}`);
            }
        }
    }, [slides, router]);

    // Calculate direction based on route changes (for animations)
    // This is a simple implementation - could be enhanced with more sophisticated direction tracking
    const direction = 0; // For now, we'll handle direction in the page components

    // Memoize the context value
    const contextValue = useMemo(() => ({
        slides,
        renderSlide,
        currentPage,
        direction,
        setPage,
    }), [slides, renderSlide, currentPage, direction, setPage]);

    return (
        <SlideshowContext.Provider value={contextValue}>
            {children}
        </SlideshowContext.Provider>
    );
}; 