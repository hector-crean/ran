import { ReactNode } from "react";

type Vec2 = { x: number; y: number };

interface FreezeFrameProps {
  poster: string;
  positionedElements?: Array<{ screenCoords: Vec2; node: ReactNode }>;
  children?: React.ReactNode;
}

const FreezeFrame = ({
  poster,
  children,
  positionedElements,
}: FreezeFrameProps) => {
  return (
    <div className="relative isolate h-full w-full">
      <img
        src={poster}
        alt="Freeze Frame"
        className="-z-0 h-full w-full object-cover"
      />
      {positionedElements?.map(({ screenCoords, node }) => (
        <div
          key={screenCoords.x + screenCoords.y}
          className="absolute object-contain"
          style={{
            top: `${screenCoords.y * 100}%`,
            left: `${screenCoords.x * 100}%`,
          }}
        >
          {node}
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export { FreezeFrame };

export type { FreezeFrameProps };
