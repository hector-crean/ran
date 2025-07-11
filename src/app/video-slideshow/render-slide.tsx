"use client";

import type { RenderableNode, Slide } from "@/types/slides";
import { match } from "ts-pattern";

import ClipPathComparator from "@/components/ui/clip-path-comparator";
import { DragDropGrid } from "@/components/ui/drag-drop/index";
import { InfiniteCanvasMap } from "@/components/ui/infinite-canvas/infinite-canvas-map";
import { SlideDialog } from "./slide-dialog";
import { SlideDrawer } from "./slide-drawer";
import { SlideSheet } from "./slide-sheet";
import { FreezeFrame } from "./slide-types/freeze-frame";
import { QuestionTime } from "./slide-types/question-time";
import { GpuPickingVideoSlide } from "./slide-types/gpu-picking-video-slide";
import { SequenceX } from "@/app/sequence/x/page";
import { SequenceXY } from "@/app/sequence/xy/page";
import { VideoSlide } from "./slide-types/video-slide";

export const renderNode = (node: RenderableNode) => {
  return match(node)
    .with({ type: "InfiniteCanvasMap" }, node => <InfiniteCanvasMap />)
    .exhaustive();
};

const renderSlide = (slide: Slide) => {
  const slideInner = match(slide.slide_type)
    .with({ type: "Video" }, slideType => <VideoSlide {...slideType.data} />)
    .with({ type: "GpuPickingVideo" }, slideType => (
      <GpuPickingVideoSlide {...slideType.data} />
    ))

    .with({ type: "RotationalSequence" }, slideType => (
      <SequenceX {...slideType.data} indicators={["rotation-3d"]} />
    ))
    .with({ type: "FreezeFrame" }, slideType => (
      <FreezeFrame {...slideType.data} />
    ))
    .with({ type: "QuestionTime" }, slideType => (
      <QuestionTime {...slideType.data} />
    ))

    .with({ type: "LinearSequence" }, slideType => (
      <SequenceX {...slideType.data} />
    ))
    .with({ type: "TargetedLinearSequence" }, slideType => (
      <SequenceXY {...slideType.data} />
    ))
    .with({ type: "ClipPathComparator" }, slideType => (
      <ClipPathComparator {...slideType.data} />
    ))
    .with({ type: "DragDropGrid" }, slideType => (
      <DragDropGrid {...slideType.data} />
    ))
    .otherwise(() => <div>Unknown slide type</div>);

  return (
    <>
      {slideInner}
      {slide.initialDrawer && <SlideDrawer>{slide.initialDrawer}</SlideDrawer>}
      {slide.initialSheet && <SlideSheet>{slide.initialSheet}</SlideSheet>}
      {slide.initialDialog && <SlideDialog>{slide.initialDialog}</SlideDialog>}
    </>
  );
};

export { renderSlide };
