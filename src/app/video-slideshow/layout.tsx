"use client";

import { SlideshowProvider, useSlideshowContext } from "@/contexts/slideshow-context";
import type { Slide } from "@/types/slides";
import { wrap } from "@popmotion/popcorn";
import { LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect } from "react";
import { match } from "ts-pattern";
import { slides } from "./slides-data";

import { InteractiveSlide } from "./slide-types/interactive-slide";
import { PollSlide } from "./slide-types/poll-slide";
import { RegularSlide } from "./slide-types/regular-slide";
import { VideoSlide } from "./slide-types/video-slide";

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
            />
        ))
        .with({ type: "Interactive" }, (slideType) => (
            <InteractiveSlide
                slide={slide}
                content={slideType.data.content}
                elements={slideType.data.interactive_elements}
            />
        ))
        .with({ type: "Poll" }, (slideType) => (
            <PollSlide
                slide={slide}
                question={slideType.data.question}
                options={slideType.data.options}
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
        <SlideshowProvider slides={slides} renderSlide={renderSlide}>
            <div className="relative w-full h-screen overflow-hidden bg-black text-white">
                {children}
                <PersistentUI />
            </div>
        </SlideshowProvider>
    );
} 