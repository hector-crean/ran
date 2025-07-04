import { RenderableNode } from "@/types/slides";
import { renderNode } from "../layout";




interface FreezeFrameProps {
    poster: string;
    elements: Array<{ position: { x: number, y: number }, width: number, height: number, node: RenderableNode }>
}

const FreezeFrame = ({ poster, elements }: FreezeFrameProps) => {

    return (
        <div className="w-full h-full relative">
            <img src={poster} alt="Freeze Frame" className="w-full h-full object-cover" />
            {elements.map((element) => (
                <div key={element.position.x + element.position.y} className="absolute object-contain" style={{ top: element.position.y, left: element.position.x, width: element.width, height: element.height }}>
                    {renderNode(element.node)}
                </div>
            ))}
        </div>
    );
};

export { FreezeFrame };

export type { FreezeFrameProps };
