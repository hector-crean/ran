"use client";

import { useSlideshowContext } from "@/contexts/slideshow-context";
import { wrap } from "@popmotion/popcorn";
import { useCallback, useEffect } from "react";
import { CriticalAssetPreloader } from "./critical-asset-preloader";
import { Pagination } from "./pagination";
import { preloadAsset, preloadSequence } from "./utils/asset-preloader";
import {
  cleanupCache,
  preloadAssetsViaServiceWorker,
  registerServiceWorker,
} from "./utils/service-worker";

export function PersistentUI() {
  const { slides, currentPage, setPage } = useSlideshowContext();

  // // Register service worker on mount
  // useEffect(() => {
  //   registerServiceWorker();

  //   // Cleanup cache periodically (every 5 minutes)
  //   const cleanupInterval = setInterval(cleanupCache, 5 * 60 * 1000);

  //   return () => clearInterval(cleanupInterval);
  // }, []);

  // // Asset preloading effect
  // useEffect(() => {
  //   const preloadAssets = async () => {
  //     const currentSlide = slides[currentPage];
  //     const nextSlide = slides[currentPage + 1];
  //     const prevSlide = slides[currentPage - 1];

  //     // Preload current slide assets with high priority
  //     if (currentSlide) {
  //       if (currentSlide.slide_type.type === "Video") {
  //         preloadAsset(currentSlide.slide_type.data.poster, "image");
  //         preloadAsset(currentSlide.slide_type.data.url, "video");
  //       } else if (currentSlide.slide_type.type === "RotationalSequence") {
  //         // Preload first few frames of sequence immediately
  //         const { baseUrl, totalFrames, format } = currentSlide.slide_type.data;
  //         preloadSequence(baseUrl, Math.min(totalFrames, 20), format, "high");
  //       }
  //     }

  //     // Preload next slide assets
  //     if (nextSlide) {
  //       setTimeout(() => {
  //         const nextAssets: string[] = [];

  //         if (nextSlide.slide_type.type === "Video") {
  //           preloadAsset(nextSlide.firstFramePoster, "image");
  //           preloadAsset(nextSlide.slide_type.data.url, "video");
  //           nextAssets.push(
  //             nextSlide.firstFramePoster,
  //             nextSlide.slide_type.data.url
  //           );
  //         } else if (nextSlide.slide_type.type === "RotationalSequence") {
  //           const { baseUrl, totalFrames, format } = nextSlide.slide_type.data;
  //           preloadSequence(baseUrl, totalFrames, format, "low");
  //         }

  //         // Send to service worker for background caching
  //         if (nextAssets.length > 0) {
  //           preloadAssetsViaServiceWorker(nextAssets);
  //         }
  //       }, 1000);
  //     }

  //     // Preload previous slide poster
  //     if (prevSlide) {
  //       preloadAsset(prevSlide.lastFramePoster, "image");
  //       preloadAssetsViaServiceWorker([prevSlide.lastFramePoster]);
  //     }
  //   };

  //   preloadAssets();
  // }, [currentPage, slides]);

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
      if (
        slideIndex >= 0 &&
        slideIndex < slides.length &&
        slideIndex !== currentPage
      ) {
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
      {/* <CriticalAssetPreloader currentSlideIndex={currentPage} /> */}
      <Pagination
        id={"pagination"}
        currentPage={currentPage}
        setPage={goToSlide}
        pages={slides.map((slide, index) => index)}
      />
      <div className="absolute bottom-4 left-4 z-50 flex gap-2">
        <button
          onClick={() => paginate(-1)}
          className="rounded bg-gray-700 px-4 py-2"
        >
          {"<"}
        </button>
        <button
          onClick={() => paginate(1)}
          className="rounded bg-gray-700 px-4 py-2"
        >
          {">"}
        </button>
      </div>
      <div className="absolute right-4 bottom-4 z-50 text-sm">
        {currentPage + 1} / {slides.length}
      </div>
    </>
  );
}
