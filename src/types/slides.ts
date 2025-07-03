import { VideoSlideProps } from "@/app/video-slideshow/slide-types/video-slide";
import {  RotationalSequenceSlideProps} from "@/app/video-slideshow/slide-types/rotational-sequence-slide";
import { FreezeFrameProps } from "@/app/video-slideshow/slide-types/freeze-frame";
import { ReactNode } from "react";
import { InteractiveVideoProps } from "@/app/video-slideshow/slide-types/interactive-video";

type SlideLike<T extends string,P> = { type: T, data: P};


type RegularSlide = SlideLike<"Regular", {
  content: string;
  annotations?: unknown[];
}>;


type VideoSlide = SlideLike<"Video", VideoSlideProps>;

type InteractiveSlide = SlideLike<"Interactive", {
  content: string;
  interactive_elements: unknown[];
}>;


type PollSlide = SlideLike<"Poll", {
  question: string;
  options: string[];
  results?: number[];
}>;

type RotationalSequenceSlide = SlideLike<"RotationalSequence", RotationalSequenceSlideProps>;


type FreezeFrameSlide = SlideLike<"FreezeFrame", FreezeFrameProps>;

type InteractiveVideoSlide = SlideLike<"InteractiveVideo", InteractiveVideoProps>;

    
export type SlideType =
    | RegularSlide
    | VideoSlide
    | InteractiveSlide
    | PollSlide
    | RotationalSequenceSlide
    | FreezeFrameSlide
    | InteractiveVideoSlide;

export interface Slide {
  id: string;
  title: string;
  firstFramePoster: string;
  lastFramePoster: string;
  initialDrawer: ReactNode | null,
  initialSheet: ReactNode | null,
  initialDialog: ReactNode | null,
  slide_type: SlideType;
} 





type RenderableNodeLike<T extends string,P> = { type: T, data: P};

type InfiniteCanvasMap = RenderableNodeLike<"InfiniteCanvasMap", {}>


export type RenderableNode = InfiniteCanvasMap ;


