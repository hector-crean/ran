import { FreezeFrameProps } from "@/app/video-slideshow/slide-types/freeze-frame";
import { InteractiveVideoProps } from "@/app/video-slideshow/slide-types/interactive-video";
import { LinearSequenceSlideProps } from "@/app/video-slideshow/slide-types/linear-sequence-slide";
import { RotationalSequenceSlideProps } from "@/app/video-slideshow/slide-types/rotational-sequence-slide";
import { TargetedLinearSequenceSlideProps } from "@/app/video-slideshow/slide-types/targeted-linear-sequence-slide";
import { VideoSlideProps } from "@/app/video-slideshow/slide-types/video-slide";
import { ClipPathComparatorProps } from "@/components/clip-path-comparator";
import { ReactNode } from "react";

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

type LinearSequenceSlide = SlideLike<"LinearSequence", LinearSequenceSlideProps>;

type FreezeFrameSlide = SlideLike<"FreezeFrame", FreezeFrameProps>;

type InteractiveVideoSlide = SlideLike<"InteractiveVideo", InteractiveVideoProps>;

type ClipPathComparatorSlide = SlideLike<"ClipPathComparator", ClipPathComparatorProps>;

type TargetedLinearSequenceSlide = SlideLike<"TargetedLinearSequence", TargetedLinearSequenceSlideProps>;

    
export type SlideType =
    | RegularSlide
    | VideoSlide
    | InteractiveSlide
    | PollSlide
    | RotationalSequenceSlide
    | LinearSequenceSlide
    | FreezeFrameSlide
    | InteractiveVideoSlide
    | ClipPathComparatorSlide
    | TargetedLinearSequenceSlide;

export interface Slide {
  id: string;
  title: string;
  firstFramePoster: string;
  lastFramePoster: string;
  onFinishAction: 'none' | 'next_slide';
  initialDrawer: ReactNode | null,
  initialSheet: ReactNode | null,
  initialDialog: ReactNode | null,
  slide_type: SlideType;
} 





type RenderableNodeLike<T extends string,P> = { type: T, data: P};

type InfiniteCanvasMap = RenderableNodeLike<"InfiniteCanvasMap", {}>


export type RenderableNode = InfiniteCanvasMap ;


