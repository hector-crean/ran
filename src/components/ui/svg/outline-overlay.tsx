"use client";
import { OutlineResponse } from "@/types/OutlineResponse";
import { MaskGeoJson } from "@/types/MaskGeojson";
import { motion } from "motion/react";
import { geojsonToPathString, traverseGeojson } from "./geometry/render";
import { createClipPathEffects } from "./clip-path/greyscale-mask";



type Highlight = {
  type: "highlight";
  fill: string;
  opacity: number;
  mixBlendMode: "multiply";
};
type Blur = {
  type: "blur";
  fill: string;
  filter: string;
  opacity: number;
};
type Darken = {
  type: "darken";
  fill: string;
  opacity: number;
  mixBlendMode: "multiply";
};
type Brighten = {
  type: "brighten";
  fill: string;
  opacity: number;
  mixBlendMode: "screen";
};
type Colorize = {
  type: "colorize";
  fill: string;
  opacity: number;
  mixBlendMode: "overlay";
};

type Outline = {
  type: "outline";
  fill: "none";
  stroke: string;
  strokeWidth: number;
  opacity: number;
};
type Default = {
  type: "default";
  fill: string;
  opacity: number;
};
type EffectStyles =
  | Highlight
  | Blur
  | Darken
  | Brighten
  | Colorize
  | Outline
  | Default;

type EffectType = EffectStyles["type"];



type OutlineOverlayProps = {
  src: string;
  outline: OutlineResponse;
};

const OutlineOverlay = ({
  outline,
  src,
}: OutlineOverlayProps) => {
  const { width, height } = outline.image_dimensions;
  const maskId = `outline-mask-${Math.random().toString(36).substr(2, 9)}`;

 

  const bounds = { cx: width / 2, cy: height / 2 };

  const pathData = geojsonToPathString(outline.geojson);


  return (
    <div
      className="relative w-full group cursor-pointer overflow-hidden"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {/* <img src={src} alt="outline" className="absolute inset-0 w-full h-full" /> */}

      <motion.svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Clipping path for the image */}
          {/* <clipPath id={`clip-${maskId}`}>
            <path d={pathData} />
          </clipPath> */}
          {createClipPathEffects.createRevealEffect(`${maskId}`, pathData)}

          {/* Effect definitions (gradients, filters, etc.) */}
          {/* {nodes.map((node) => node.defs)} */}
        </defs>

        {/* Clipped image */}
        <image
          width="100%"
          height="100%"
          href={src}
          clipPath={`url(#reveal-${maskId})`}
        />

        {/* Effect paths */}
        {/* {nodes.map((node) => node.element)} */}
      </motion.svg>
    </div>
  );
};

export default OutlineOverlay;
