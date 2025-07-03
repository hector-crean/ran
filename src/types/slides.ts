import { VideoSlideProps } from "@/app/video-slideshow/slide-types/video-slide";
import {  RotationalSequenceSlideProps} from "@/app/video-slideshow/slide-types/rotational-sequence-slide";

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

    
export type SlideType =
    | RegularSlide
    | VideoSlide
    | InteractiveSlide
    | PollSlide
    | RotationalSequenceSlide;

export interface Slide {
  id: string;
  title: string;
  firstFramePoster: string;
  lastFramePoster: string;
  slide_type: SlideType;
} 