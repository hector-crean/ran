"use client";

import { use, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

import { Drag, HandlerArgs } from "@/components/drag";
import { Sequence } from "@/components/sequence";
import { useImageSequence } from "@/hooks/use-image-sequence";
import { clamp } from "@/lib/utils";
import { Slide } from "@/types/slides";
import { SequenceSliderClient } from "@/app/sequence-slider/sequence-slider-client";

interface SequenceSlideProps {
    slide: Slide;
    baseUrl: string;
    frameCount: number;
    format: string;
}



export const SequenceSlide = ({
    slide,
    baseUrl,
    frameCount,
    format,
}: SequenceSlideProps) => {
    

    
    const paths = useMemo(() => {
        return Array.from({ length: frameCount }, (_, i) => `${baseUrl}${(i+1).toString().padStart(5, '0')}.${format}`);
    }, [baseUrl, frameCount, format]);

      



    return <SequenceSliderClient imagePaths={paths} />;
    
}; 

export type { SequenceSlideProps };