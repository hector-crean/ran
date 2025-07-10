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
import { GpuPickingVideoSlide } from "./slide-types/gpu-picking-video-slide";
import { LinearSequenceSlide } from "./slide-types/linear-sequence-slide";
import { RotationalSequenceSlide } from "./slide-types/rotational-sequence-slide";
import { TargetedLinearSequenceSlide } from "./slide-types/targeted-linear-sequence-slide";
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
      <RotationalSequenceSlide {...slideType.data} />
    ))
    .with({ type: "FreezeFrame" }, slideType => (
      <FreezeFrame {...slideType.data} />
    ))

    .with({ type: "LinearSequence" }, slideType => (
      <LinearSequenceSlide {...slideType.data} />
    ))
    .with({ type: "TargetedLinearSequence" }, slideType => (
      <TargetedLinearSequenceSlide {...slideType.data} />
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
