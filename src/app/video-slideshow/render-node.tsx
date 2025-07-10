"use client";

import { InfiniteCanvasMap } from "@/components/ui/infinite-canvas/infinite-canvas-map";
import { RenderableNode } from "@/types/slides";
import { match } from "ts-pattern";

export const renderNode = (node: RenderableNode) => {
  return match(node)
    .with({ type: "InfiniteCanvasMap" }, node => <InfiniteCanvasMap />)
    .exhaustive();
};
