"use client";

import { useSlideshowContext } from "@/contexts/slideshow-context";
import { motion, Variants } from "motion/react";
import { useParams } from "next/navigation";

const variants: Variants = {
    enter: {
        // x: "100%",
        opacity: 0,
        filter: "blur(2px)",
    },
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            opacity: { duration: 0.5 },
            filter: { duration: 0.4 },
        },
    },
    exit: {
        zIndex: 0,
        // x: "-100%",
        opacity: 0,
        filter: "blur(1px)",
        transition: {
            duration: 0.5,
            ease: [0.55, 0.06, 0.68, 0.19],
            opacity: { duration: 0.4 },
            filter: { duration: 0.3 },
        },
    },
};

const Page = () => {
    const { slides, renderSlide, currentPage } = useSlideshowContext();
    const { slide_id } = useParams<{ slide_id: string }>();

    const currentSlide = currentPage >= 0 && currentPage < slides.length ? slides[currentPage] : undefined;

    return (
        <motion.div
            key={slide_id}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
        >
            {currentSlide ? (
                renderSlide(currentSlide)
            ) : (
                <div className="flex items-center justify-center w-full h-full">
                    Loading...
                </div>
            )}
        </motion.div>
    );
}

export default Page;