import { useMemo } from "react";
import { RotationalSequenceSlide } from "../video-slideshow/slide-types/rotational-sequence-slide";
import { Slide } from "@/types/slides";

const Page = () => {
  const slide = {
    id: "scene_9_3",
    title: "Scene 9.3 - Interactive Sequence",
    firstFramePoster: "/assets/Scene_9.3_00001.png",
    lastFramePoster: "/assets/Scene_9.3_00075.png",
    slide_type: {
      type: "Sequence",
      data: {
        baseUrl: "/assets/Scene_9.3_",
        frameCount: 75,
        format: "png",
      },
    },
  };

  return (
    <RotationalSequenceSlide
      slide={slide as Slide}
      baseUrl={slide.slide_type.data.baseUrl}
      frameCount={slide.slide_type.data.frameCount}
      format={slide.slide_type.data.format}
    />
  );
};

export default Page;
