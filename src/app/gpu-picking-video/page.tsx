"use client";

import { GpuPickingVideoSlide } from "@/app/video-slideshow/slide-types/gpu-picking-video-slide";

export default function GpuPickingVideoPage() {
    return <GpuPickingVideoSlide videoSrc="/assets/Scene_8.1.mp4" maskSrc="/assets/Scene_8.1-masked.mp4" />;
}   