"use client";

import MorphingMask from "@/components/ui/svg/mask/morphing-mask";
import { countries } from "./countries";
import { useMemo } from "react";


function pointsToPath(points: [number, number][], close: boolean = true): string {
  if (!points.length) return '';
  const [first, ...rest] = points;
  const path = [`M${first[0]},${first[1]}`];
  for (const [x, y] of rest) {
    path.push(`L${x},${y}`);
  }
  if (close) path.push('Z');
  return path.join(' ');
}

const Page = () => {



  const masks = useMemo(() => {
    return countries.map((country) => ({
      id: country.id,
      viewbox: country.viewbox,
      centroid: country.centroid,
      path: pointsToPath(country.d),
      content: <div>{country.id}</div>,
    })).filter((mask) => !mask.id.startsWith("Vector") && !!mask.id);
  }, []);
 

  return (
    <MorphingMask
      maskEffect='solid'
      maskedOpacity={0.4}
      masks={masks}
      className="w-full h-96 border rounded-lg bg-gray-50"
      width={2000}
      height={857}
      showControls={true}
      autoCycle={false}
      morphDuration={1.2}
      showOutline={true}
      initialIndex={0}
      clipContent={true}
    />
  );
};

export default Page;
