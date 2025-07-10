import { Slide } from "@/types/slides";

export const PollSlide = ({
  slide,
  question,
  options,
}: {
  slide: Slide;
  question: string;
  options: string[];
}) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{slide.title}</h1>
    <h2 className="mt-4 text-xl">{question}</h2>
    <div className="mt-4">
      {options.map((option, i) => (
        <button
          key={i}
          className="my-2 block w-full rounded border p-2 text-left"
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);
