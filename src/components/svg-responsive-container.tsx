import { ResponsiveContainerProps } from "./ui/responsive-container";

export const ResponsiveContainer = ({
    width = 1920,
    height = 1080,
    children
}: ResponsiveContainerProps) => {
    return (
        <div className="w-full h-full bg-blue-500">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
            >
                <foreignObject width={width} height={height}>
                    <div className="bg-red-500 w-full h-full">{children}</div>
                </foreignObject>
            </svg>
        </div>
    );
};