"use client";

import { useSlideshowContext } from "@/contexts/slideshow-context";
import { Slide } from "@/types/slides";
import { motion, Variants } from "motion/react";
import { useParams } from "next/navigation";
import { match } from "ts-pattern";

const variants: Variants = {
  enter: {
    // x: "100%",
    opacity: 0,
    filter: "blur(2px)",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  center: {
    zIndex: 1,
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
    opacity: 0,
    filter: "blur(1px)",
    transition: {
      delay: 0.5,
      duration: 1.0,
      ease: [0.55, 0.06, 0.68, 0.19],
      opacity: { duration: 0.4 },
      filter: { duration: 0.3 },
    },
  },
  previous: {
    zIndex: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  next: {
    zIndex: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

interface SlideLayerProps {
  slide_id: string;
  slide: Slide;
  renderSlide: (slide: Slide) => React.ReactNode;
  kind: "current" | "previous" | "next";
}

const SlideLayer = ({
  slide_id,
  slide,
  renderSlide,
  kind,
}: SlideLayerProps) => {
  return match(kind)
    .with("current", () => (
      <motion.div
        key={slide_id}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        className="absolute inset-0 w-full h-full z-0"
      >
        {renderSlide(slide)}
      </motion.div>
    ))
    .with("previous", () => (
      <motion.div variants={variants} initial="previous" animate="exit" className="absolute inset-0 w-full h-full z-10">
        <img src={slide.firstFramePoster} alt="Previous slide" className="w-full h-full object-contain" />
      </motion.div>
    ))
    .with("next", () => (
      <motion.div variants={variants} initial="exit" exit="next" className="absolute inset-0 w-full h-full z-10">
        <img src={slide.lastFramePoster} alt="Next slide" className="w-full h-full object-contain" />
      </motion.div>
    ))
    .exhaustive();
};

const Page = () => {
  const { slides, renderSlide, currentPage } = useSlideshowContext();
  const { slide_id } = useParams<{ slide_id: string }>();

  const previousSlide =
    currentPage - 1 >= 0 ? slides[currentPage - 1] : undefined;
  const currentSlide =
    currentPage >= 0 && currentPage < slides.length
      ? slides[currentPage]
      : undefined;
  const nextSlide =
    currentPage + 1 < slides.length ? slides[currentPage + 1] : undefined;

  return (
    <>
      {previousSlide && (
        <SlideLayer

          slide_id={slide_id}
          slide={previousSlide}
          renderSlide={renderSlide}
          kind="previous"
        />
      )}
      {currentSlide && (
        <SlideLayer
          slide_id={slide_id}
          slide={currentSlide}
          renderSlide={renderSlide}
          kind="current"
        />
      )}
      {nextSlide && (
        <SlideLayer
          slide_id={slide_id}
          slide={nextSlide}
          renderSlide={renderSlide}
          kind="next"
        />
      )}
    </>
  );
};

export default Page;
