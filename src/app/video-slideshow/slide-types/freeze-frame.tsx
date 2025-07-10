import { ReactNode } from "react";


type Vec2 = { x: number, y: number }

interface FreezeFrameProps {
    poster: string;
    positionedElements?: Array<{ screenCoords: Vec2, node: ReactNode }>
    children?: React.ReactNode;
}

const FreezeFrame = ({ poster, children, positionedElements }: FreezeFrameProps) => {

    return (
        <div className="w-full h-full relative isolate">
            <img src={poster} alt="Freeze Frame" className="w-full h-full object-cover -z-0" />
            {positionedElements?.map(({ screenCoords, node }) => (
                <div
                    key={screenCoords.x + screenCoords.y}
                    className="absolute object-contain"
                    style={{ top: `${screenCoords.y * 100}%`, left: `${screenCoords.x * 100}%` }}
                >
                    {node}
                </div>
            ))}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                {children}
            </div>
        </div>
    );
};

export { FreezeFrame };

export type { FreezeFrameProps };

