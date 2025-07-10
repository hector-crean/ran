"use client";

import { useEffect } from "react";
import { slides } from "./slides-data";

// Generate preload links for critical assets using DOM manipulation
export const CriticalAssetPreloader = ({
  currentSlideIndex,
}: {
  currentSlideIndex: number;
}) => {
  useEffect(() => {
    const currentSlide = slides[currentSlideIndex];
    const nextSlide = slides[currentSlideIndex + 1];
    const prevSlide = slides[currentSlideIndex - 1];

    // Remove existing preload links
    const existingLinks = document.querySelectorAll(
      "link[data-slideshow-preload]"
    );
    existingLinks.forEach(link => link.remove());

    // Add new preload links
    const addPreloadLink = (
      href: string,
      as: string,
      rel: string = "preload"
    ) => {
      const link = document.createElement("link");
      link.rel = rel;
      link.as = as;
      link.href = href;
      link.setAttribute("data-slideshow-preload", "true");
      document.head.appendChild(link);
    };

    // Current slide assets
    if (currentSlide) {
      if (currentSlide.slide_type.type === "Video") {
        addPreloadLink(currentSlide.slide_type.data.poster, "image");
        addPreloadLink(currentSlide.slide_type.data.url, "video");
      } else if (currentSlide.slide_type.type === "RotationalSequence") {
        // Preload first few frames of sequence
        for (
          let i = 1;
          i <= Math.min(5, currentSlide.slide_type.data.frameCount);
          i++
        ) {
          const frameUrl = `${currentSlide.slide_type.data.baseUrl}${i
            .toString()
            .padStart(5, "0")}.${currentSlide.slide_type.data.format}`;
          addPreloadLink(frameUrl, "image");
        }
      }
    }

    // Next slide poster
    if (nextSlide) {
      addPreloadLink(nextSlide.firstFramePoster, "image", "prefetch");
    }

    // Previous slide poster
    if (prevSlide) {
      addPreloadLink(prevSlide.lastFramePoster, "image", "prefetch");
    }
  }, [currentSlideIndex]);

  return null;
};
