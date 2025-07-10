"use client";

import { SettingsProvider } from "@/contexts/settings-dialog";
import { SlideshowProvider } from "@/contexts/slideshow-context";
import { PersistentUI } from "./persistent-ui";
import { renderSlide } from "./render-slide";
import { slides } from "./slides-data";

export default function VideoSlideshowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <SlideshowProvider slides={slides} renderSlide={renderSlide}>
        <div className="flex h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] items-center justify-center overflow-hidden p-4">
          <div className="relative aspect-video max-h-[1080px] w-full max-w-[1920px] overflow-clip rounded-lg">
            {children}
            <PersistentUI />
          </div>
        </div>
      </SlideshowProvider>
    </SettingsProvider>
  );
}
