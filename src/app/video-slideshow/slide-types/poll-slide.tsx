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
        <h2 className="text-xl mt-4">{question}</h2>
        <div className="mt-4">
            {options.map((option, i) => (
                <button key={i} className="block w-full text-left p-2 border rounded my-2">
                    {option}
                </button>
            ))}
        </div>
    </div>
); 