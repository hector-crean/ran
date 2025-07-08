



interface FreezeFrameProps {
    poster: string;
    // elements: Array<{ position: { x: number, y: number }, width: number, height: number, node: RenderableNode }>
    children?: React.ReactNode;
}

const FreezeFrame = ({ poster, children }: FreezeFrameProps) => {

    return (
        <div className="w-full h-full relative isolate">
            <img src={poster} alt="Freeze Frame" className="w-full h-full object-cover -z-0" />
            {/* {elements.map((element) => (
                <div key={element.position.x + element.position.y} className="absolute object-contain" style={{ top: element.position.y, left: element.position.x, width: element.width, height: element.height }}>
                    {renderNode(element.node)}
                </div>
            ))} */}
            {children}
        </div>
    );
};

export { FreezeFrame };

export type { FreezeFrameProps };

