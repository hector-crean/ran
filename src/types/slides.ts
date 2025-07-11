import { ReactNode } from "react";

import { FreezeFrameProps } from "@/app/video-slideshow/slide-types/freeze-frame";
import { GpuPickingVideoSlideProps } from "@/app/video-slideshow/slide-types/gpu-picking-video-slide";
import { VideoSlideProps } from "@/app/video-slideshow/slide-types/video-slide";
import { ClipPathComparatorProps } from "@/components/ui/clip-path-comparator";
import { DragDropGridProps } from "@/components/ui/drag-drop";
import { QuestionTimeProps } from "@/app/video-slideshow/slide-types/question-time";
import { SequenceXProps } from "@/app/sequence/x/sequence-x";
import { SequenceXYProps } from "@/app/sequence/xy/sequence-xy";

type SlideLike<T extends string, P> = { type: T; data: P };

type RegularSlide = SlideLike<
  "Regular",
  {
    content: string;
    annotations?: unknown[];
  }
>;

type VideoSlide = SlideLike<"Video", VideoSlideProps>;

type InteractiveSlide = SlideLike<
  "Interactive",
  {
    content: string;
    interactive_elements: unknown[];
  }
>;

type PollSlide = SlideLike<
  "Poll",
  {
    question: string;
    options: string[];
    results?: number[];
  }
>;

type RotationalSequenceSlide = SlideLike<"RotationalSequence", SequenceXProps>;

type LinearSequenceSlide = SlideLike<"LinearSequence", SequenceXProps>;

type FreezeFrameSlide = SlideLike<"FreezeFrame", FreezeFrameProps>;

type QuestionTimeSlide = SlideLike<"QuestionTime", QuestionTimeProps>;

type ClipPathComparatorSlide = SlideLike<
  "ClipPathComparator",
  ClipPathComparatorProps
>;

type TargetedLinearSequenceSlide = SlideLike<
  "TargetedLinearSequence",
  SequenceXYProps
>;

type GpuPickingVideoSlide = SlideLike<
  "GpuPickingVideo",
  GpuPickingVideoSlideProps
>;

type DragDropGridSlide = SlideLike<"DragDropGrid", DragDropGridProps>;

export type SlideType =
  | RegularSlide
  | VideoSlide
  | InteractiveSlide
  | RotationalSequenceSlide
  | LinearSequenceSlide
  | FreezeFrameSlide
  | QuestionTimeSlide
  | ClipPathComparatorSlide
  | TargetedLinearSequenceSlide
  | GpuPickingVideoSlide
  | DragDropGridSlide;

export interface Slide {
  id: string;
  title: string;
  firstFramePoster: string;
  lastFramePoster: string;
  onFinishAction: "none" | "next_slide";
  initialDrawer: ReactNode | null;
  initialSheet: ReactNode | null;
  initialDialog: ReactNode | null;
  slide_type: SlideType;
}

type RenderableNodeLike<T extends string, P> = { type: T; data: P };

type InfiniteCanvasMap = RenderableNodeLike<
  "InfiniteCanvasMap",
  Record<string, unknown>
>;

export type RenderableNode = InfiniteCanvasMap;
