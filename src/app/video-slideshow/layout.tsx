"use client";

import { SlideshowProvider, useSlideshowContext } from "@/contexts/slideshow-context";
import type { Slide } from "@/types/slides";
import { wrap } from "@popmotion/popcorn";
import { LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect } from "react";
import { match } from "ts-pattern";
import { slides } from "./slides-data";

import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { SettingsProvider } from "@/contexts/settings-dialog";
import { PollSlide } from "./slide-types/poll-slide";
import { RegularSlide } from "./slide-types/regular-slide";
import { SequenceSlide } from "./slide-types/sequence-slide";
import { VideoSlide } from "./slide-types/video-slide";

// Asset preloader utility
const preloadAsset = (url: string, type: 'image' | 'video' = 'image'): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (type === 'image') {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = url;
        } else if (type === 'video') {
            const video = document.createElement('video');
            video.onloadeddata = () => resolve();
            video.onerror = reject;
            video.preload = 'metadata';
            video.src = url;
        }
    });
};

// Service Worker utilities
const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
};

const preloadAssetsViaServiceWorker = (assets: string[]) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'PRELOAD_ASSETS',
            assets: assets
        });
    }
};

const cleanupCache = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'CLEANUP_CACHE'
        });
    }
};

// Preload sequence images
const preloadSequence = async (baseUrl: string, frameCount: number, format: string, priority: 'high' | 'low' = 'low') => {
    const promises: Promise<void>[] = [];
    const batchSize = priority === 'high' ? 10 : 5;

    // Also collect URLs for service worker preloading
    const sequenceUrls: string[] = [];

    for (let i = 1; i <= frameCount; i += batchSize) {
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, frameCount + 1); j++) {
            const frameUrl = `${baseUrl}${j.toString().padStart(5, '0')}.${format}`;
            batch.push(preloadAsset(frameUrl, 'image'));
            sequenceUrls.push(frameUrl);
        }

        // Wait for each batch before starting the next
        await Promise.allSettled(batch);

        // Add a small delay to avoid overwhelming the browser
        if (priority === 'low') {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Send to service worker for background caching
    if (priority === 'low') {
        preloadAssetsViaServiceWorker(sequenceUrls);
    }
};

// Generate preload links for critical assets using DOM manipulation
const CriticalAssetPreloader = ({ currentSlideIndex }: { currentSlideIndex: number }) => {
    useEffect(() => {
        const currentSlide = slides[currentSlideIndex];
        const nextSlide = slides[currentSlideIndex + 1];
        const prevSlide = slides[currentSlideIndex - 1];

        // Remove existing preload links
        const existingLinks = document.querySelectorAll('link[data-slideshow-preload]');
        existingLinks.forEach(link => link.remove());

        // Add new preload links
        const addPreloadLink = (href: string, as: string, rel: string = 'preload') => {
            const link = document.createElement('link');
            link.rel = rel;
            link.as = as;
            link.href = href;
            link.setAttribute('data-slideshow-preload', 'true');
            document.head.appendChild(link);
        };

        // Current slide assets
        if (currentSlide) {
            if (currentSlide.slide_type.type === 'Video') {
                addPreloadLink(currentSlide.slide_type.data.poster, 'image');
                addPreloadLink(currentSlide.slide_type.data.url, 'video');
            } else if (currentSlide.slide_type.type === 'Sequence') {
                // Preload first few frames of sequence
                for (let i = 1; i <= Math.min(5, currentSlide.slide_type.data.frameCount); i++) {
                    const frameUrl = `${currentSlide.slide_type.data.baseUrl}${i.toString().padStart(5, '0')}.${currentSlide.slide_type.data.format}`;
                    addPreloadLink(frameUrl, 'image');
                }
            }
        }

        // Next slide poster
        if (nextSlide) {
            addPreloadLink(nextSlide.firstFramePoster, 'image', 'prefetch');
        }

        // Previous slide poster
        if (prevSlide) {
            addPreloadLink(prevSlide.lastFramePoster, 'image', 'prefetch');
        }
    }, [currentSlideIndex]);

    return null;
};

const renderSlide = (slide: Slide) => {
    return match(slide.slide_type)
        .with({ type: "Regular" }, (slideType) => (
            <RegularSlide slide={slide} content={slideType.data.content} />
        ))
        .with({ type: "Video" }, (slideType) => (
            <VideoSlide
                slide={slide}
                url={slideType.data.url}
                autoplay={true}
                poster={slideType.data.poster}
            />
        ))

        .with({ type: "Poll" }, (slideType) => (
            <PollSlide
                slide={slide}
                question={slideType.data.question}
                options={slideType.data.options}
            />
        ))
        .with({ type: "Sequence" }, (slideType) => (
            <SequenceSlide
                slide={slide}
                baseUrl={slideType.data.baseUrl}
                frameCount={slideType.data.frameCount}
                format={slideType.data.format}
            />
        ))
        .otherwise(() => <div>Unknown slide type</div>);
};

function Pagination({ id, currentPage, setPage, pages }: { id: string, currentPage: number, setPage: (page: number) => void, pages: number[] }) {
    return (
        <LayoutGroup id={id}>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
                {pages.map(page => (
                    <Dot
                        key={page}
                        onClick={() => setPage(page)}
                        isSelected={page === currentPage}
                    />
                ))}
            </div>
        </LayoutGroup>
    );
}

function Dot({ isSelected, onClick }: { isSelected: boolean, onClick: () => void }) {
    return (
        <div
            className="w-3 h-3 rounded-full bg-gray-500 cursor-pointer relative overflow-hidden"
            onClick={onClick}
        >
            {isSelected && (
                <motion.div
                    className="absolute inset-0 bg-white rounded-full"
                    layoutId="highlight"
                />
            )}
        </div>
    );
}

function PersistentUI() {
    const { slides, currentPage, setPage } = useSlideshowContext();

    // Register service worker on mount
    useEffect(() => {
        registerServiceWorker();

        // Cleanup cache periodically (every 5 minutes)
        const cleanupInterval = setInterval(cleanupCache, 5 * 60 * 1000);

        return () => clearInterval(cleanupInterval);
    }, []);

    // Asset preloading effect
    useEffect(() => {
        const preloadAssets = async () => {
            const currentSlide = slides[currentPage];
            const nextSlide = slides[currentPage + 1];
            const prevSlide = slides[currentPage - 1];

            // Preload current slide assets with high priority
            if (currentSlide) {
                if (currentSlide.slide_type.type === 'Video') {
                    preloadAsset(currentSlide.slide_type.data.poster, 'image');
                    preloadAsset(currentSlide.slide_type.data.url, 'video');
                } else if (currentSlide.slide_type.type === 'Sequence') {
                    // Preload first few frames of sequence immediately
                    const { baseUrl, frameCount, format } = currentSlide.slide_type.data;
                    preloadSequence(baseUrl, Math.min(frameCount, 20), format, 'high');
                }
            }

            // Preload next slide assets
            if (nextSlide) {
                setTimeout(() => {
                    const nextAssets: string[] = [];

                    if (nextSlide.slide_type.type === 'Video') {
                        preloadAsset(nextSlide.firstFramePoster, 'image');
                        preloadAsset(nextSlide.slide_type.data.url, 'video');
                        nextAssets.push(nextSlide.firstFramePoster, nextSlide.slide_type.data.url);
                    } else if (nextSlide.slide_type.type === 'Sequence') {
                        const { baseUrl, frameCount, format } = nextSlide.slide_type.data;
                        preloadSequence(baseUrl, frameCount, format, 'low');
                    }

                    // Send to service worker for background caching
                    if (nextAssets.length > 0) {
                        preloadAssetsViaServiceWorker(nextAssets);
                    }
                }, 1000);
            }

            // Preload previous slide poster
            if (prevSlide) {
                preloadAsset(prevSlide.lastFramePoster, 'image');
                preloadAssetsViaServiceWorker([prevSlide.lastFramePoster]);
            }
        };

        preloadAssets();
    }, [currentPage, slides]);

    // Navigation functions
    const paginate = useCallback(
        (navDirection: number) => {
            const newIndex = wrap(0, slides.length, currentPage + navDirection);
            setPage(newIndex, navDirection);
        },
        [currentPage, slides.length, setPage]
    );

    const goToSlide = useCallback(
        (slideIndex: number) => {
            if (slideIndex >= 0 && slideIndex < slides.length && slideIndex !== currentPage) {
                setPage(slideIndex);
            }
        },
        [currentPage, slides.length, setPage]
    );

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                paginate(1);
            } else if (e.key === "ArrowLeft") {
                paginate(-1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [paginate]);

    return (
        <>
            <CriticalAssetPreloader currentSlideIndex={currentPage} />
            <Pagination
                id={'pagination'}
                currentPage={currentPage}
                setPage={goToSlide}
                pages={slides.map((slide, index) => index)}
            />
            <div className="absolute bottom-4 left-4 flex gap-2 z-50">
                <button
                    onClick={() => paginate(-1)}
                    className="px-4 py-2 bg-gray-700 rounded"
                >
                    {"<"}
                </button>
                <button
                    onClick={() => paginate(1)}
                    className="px-4 py-2 bg-gray-700 rounded"
                >
                    {">"}
                </button>
            </div>
            <div className="absolute bottom-4 right-4 text-sm z-50">
                {currentPage + 1} / {slides.length}
            </div>
        </>
    );
}

export default function VideoSlideshowLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SettingsProvider>
            <SlideshowProvider slides={slides} renderSlide={renderSlide}>
                <ResponsiveContainer
                    width={1920}
                    height={1080}
                    scale={true}
                    containerClassname="w-[calc(100vw-1rem)] h-[calc(100vh-1rem)]"
                    contentClassname="rounded-md overflow-hidden"
                >
                    {children}
                    <PersistentUI />
                </ResponsiveContainer>
            </SlideshowProvider>
        </SettingsProvider>
    );
} 