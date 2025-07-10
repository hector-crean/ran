"use client";

import { useSlideshowContext } from "@/contexts/slideshow-context";
import { Slide } from "@/types/slides";
import { AnimatePresence, motion, Variants } from "motion/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Hook to detect View Transitions API support
const useViewTransitionsSupport = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsSupported("startViewTransition" in document);
    }
  }, []);

  return isSupported;
};

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

// Main content layer with conditional animation
const MainSlide = ({
  slide,
  renderSlide,
  useViewTransitions,
}: {
  slide: Slide;
  renderSlide: (slide: Slide) => React.ReactNode;
  useViewTransitions: boolean;
}) => {
  const baseClassName =
    "absolute inset-0 z-30 flex items-center justify-center slide-content-transition";
  const baseStyle = {
    backfaceVisibility: "hidden" as const,
    willChange: "transform, opacity, filter",
  };

  if (useViewTransitions) {
    // Use simple div when View Transitions API is supported
    return (
      <div key={slide.id} className={baseClassName} style={baseStyle}>
        {renderSlide(slide)}
      </div>
    );
  }

  // Fallback to Framer Motion
  return (
    <motion.div
      key={slide.id}
      variants={crossfadeVariants}
      initial="enter"
      animate="center"
      exit="exit"
      layoutId="main-slide"
      className={baseClassName}
      style={baseStyle}
    >
      {renderSlide(slide)}
    </motion.div>
  );
};

// Background poster layer with conditional animation
const BackgroundPoster = ({
  posterUrl,
  alt,
  layoutId,
  useViewTransitions,
  posterType = "prev",
}: {
  posterUrl: string;
  alt: string;
  layoutId: string;
  useViewTransitions: boolean;
  posterType?: "prev" | "next";
}) => {
  const transitionClass =
    posterType === "prev"
      ? "slide-poster-prev-transition"
      : "slide-poster-next-transition";
  const baseClassName = `absolute inset-0 z-10 pointer-events-none flex items-center justify-center ${useViewTransitions ? transitionClass : ""}`;

  if (useViewTransitions) {
    // Use simple div when View Transitions API is supported
    return (
      <div key={layoutId} className={baseClassName}>
        <img
          src={posterUrl}
          alt={alt}
          className="max-h-full w-full object-contain"
        />
      </div>
    );
  }

  // Fallback to Framer Motion
  return (
    <motion.div
      key={layoutId}
      variants={previewVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      layoutId={layoutId}
      className={baseClassName}
    >
      <img
        src={posterUrl}
        alt={alt}
        className="max-h-full w-full object-contain"
      />
    </motion.div>
  );
};

const Page = () => {
  const { slides, renderSlide, currentPage } = useSlideshowContext();
  const { slide_id } = useParams<{ slide_id: string }>();
  const supportsViewTransitions = useViewTransitionsSupport();

  const previousSlide = currentPage - 1 >= 0 ? slides[currentPage - 1] : null;
  const currentSlide =
    currentPage >= 0 && currentPage < slides.length
      ? slides[currentPage]
      : null;
  const nextSlide =
    currentPage + 1 < slides.length ? slides[currentPage + 1] : null;

  const AnimationWrapper = supportsViewTransitions
    ? ({ children }: { children: React.ReactNode }) => <>{children}</>
    : ({ children }: { children: React.ReactNode }) => (
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      );

  const BackgroundWrapper = supportsViewTransitions
    ? ({ children }: { children: React.ReactNode }) => <>{children}</>
    : ({ children }: { children: React.ReactNode }) => (
        <AnimatePresence mode="sync">{children}</AnimatePresence>
      );

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Layer 1: Previous slide background (z-10) */}
      <BackgroundWrapper>
        {previousSlide && !supportsViewTransitions && (
          <BackgroundPoster
            key={`prev-${previousSlide.id}`}
            posterUrl={previousSlide.lastFramePoster}
            alt={`${previousSlide.title} ending`}
            layoutId="preview-previous"
            useViewTransitions={supportsViewTransitions}
            posterType="prev"
          />
        )}
      </BackgroundWrapper>

      {/* Layer 2: Next slide background (z-10) */}
      <BackgroundWrapper>
        {nextSlide && !supportsViewTransitions && (
          <BackgroundPoster
            key={`next-${nextSlide.id}`}
            posterUrl={nextSlide.firstFramePoster}
            alt={`${nextSlide.title} beginning`}
            layoutId="preview-next"
            useViewTransitions={supportsViewTransitions}
            posterType="next"
          />
        )}
      </BackgroundWrapper>

      {/* Layer 3: Main slide content (z-30) */}
      <AnimationWrapper>
        {currentSlide && (
          <MainSlide
            key={currentSlide.id}
            slide={currentSlide}
            renderSlide={renderSlide}
            useViewTransitions={supportsViewTransitions}
          />
        )}
      </AnimationWrapper>

      {/* Loading state */}
      {!currentSlide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-40 flex items-center justify-center"
        >
          <div className="text-center text-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-white border-t-transparent"
            />
            <p className="text-lg">Loading slide...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Page;
