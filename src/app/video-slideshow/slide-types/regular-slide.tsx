import { Slide } from "@/types/slides";

export const RegularSlide = ({
  slide,
  content,
}: {
  slide: Slide;
  content: string;
}) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{slide.title}</h1>
    <p>{content}</p>
  </div>
);
