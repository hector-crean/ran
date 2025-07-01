"use client";

import { useSlideshowContext } from "@/contexts/slideshow-context";
import { Slide } from "@/types/slides";
import { motion, Variants, AnimatePresence } from "motion/react";
import { useParams } from "next/navigation";

// Crossfade variants for main content
const crossfadeVariants: Variants = {
  enter: {
    opacity: 0,
    scale: 1.02,
    filter: "blur(4px)",
  },
  center: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      opacity: { duration: 0.5 },
      scale: { duration: 0.4, delay: 0.1 },
      filter: { duration: 0.3, delay: 0.2 },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: "blur(2px)",
    transition: {
      duration: 0.4,
      ease: [0.55, 0.06, 0.68, 0.19],
      opacity: { duration: 0.4 },
      scale: { duration: 0.3 },
      filter: { duration: 0.2 },
    },
  },
};

// Preview variants for background posters
const previewVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 0.15,
    scale: 0.98,
    filter: "blur(4px)",
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

// Main content layer
const MainSlide = ({ slide, renderSlide }: { slide: Slide; renderSlide: (slide: Slide) => React.ReactNode }) => (
  <motion.div
    key={slide.id}
    variants={crossfadeVariants}
    initial="enter"
    animate="center"
    exit="exit"
    layoutId="main-slide"
    className="absolute inset-0 z-30 flex items-center justify-center"
    style={{
      backfaceVisibility: "hidden",
      willChange: "transform, opacity, filter",
    }}
  >
    {renderSlide(slide)}
  </motion.div>
);

// Background poster layer
const BackgroundPoster = ({ posterUrl, alt, layoutId }: { posterUrl: string; alt: string; layoutId: string }) => (
  <motion.div
    key={layoutId}
    variants={previewVariants}
    initial="hidden"
    animate="visible"
    exit="hidden"
    layoutId={layoutId}
    className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
  >
    <img
      src={posterUrl}
      alt={alt}
      className="w-full object-contain max-h-full"
    />
    {/* <div className="absolute inset-0 bg-black/20" /> */}
  </motion.div>
);

const Page = () => {
  const { slides, renderSlide, currentPage } = useSlideshowContext();
  const { slide_id } = useParams<{ slide_id: string }>();

  const previousSlide = currentPage - 1 >= 0 ? slides[currentPage - 1] : null;
  const currentSlide = currentPage >= 0 && currentPage < slides.length ? slides[currentPage] : null;
  const nextSlide = currentPage + 1 < slides.length ? slides[currentPage + 1] : null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Layer 1: Previous slide background (z-10) */}
      <AnimatePresence mode="sync">
        {previousSlide && (
          <BackgroundPoster
            key={`prev-${previousSlide.id}`}
            posterUrl={previousSlide.lastFramePoster}
            alt={`${previousSlide.title} ending`}
            layoutId="preview-previous"
          />
        )}
      </AnimatePresence>

      {/* Layer 2: Next slide background (z-10) */}
      <AnimatePresence mode="sync">
        {nextSlide && (
          <BackgroundPoster
            key={`next-${nextSlide.id}`}
            posterUrl={nextSlide.firstFramePoster}
            alt={`${nextSlide.title} beginning`}
            layoutId="preview-next"
          />
        )}
      </AnimatePresence>

      {/* Layer 3: Main slide content (z-30) */}
      <AnimatePresence mode="wait">
        {currentSlide && (
          <MainSlide
            key={currentSlide.id}
            slide={currentSlide}
            renderSlide={renderSlide}
          />
        )}
      </AnimatePresence>

      {/* Loading state */}
      {!currentSlide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-40 flex items-center justify-center"
        >
          <div className="text-white text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-lg">Loading slide...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Page;
