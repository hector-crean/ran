import { Slide } from "@/types/slides";

export const InteractiveSlide = ({
    slide,
    content,
    elements,
}: {
    slide: Slide;
    content: string;
    elements: any[];
}) => (
    <div className="p-8">
        <h1 className="text-2xl font-bold">{slide.title}</h1>
        <p>{content}</p>
        <div>
            {elements.map((el) => (
                <button key={el.id} className="p-2 bg-blue-500 text-white rounded m-2">
                    {el.label}
                </button>
            ))}
        </div>
    </div>
); 