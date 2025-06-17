"use client";
import * as d3 from 'd3-geo';
import { Feature, GeoJSON, GeoJsonProperties, Geometry } from 'geojson';
import {
    animate,
    AnimatePresence,
    motion,
    useDragControls,
    useMotionValue,
    useTransform
} from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WorldMapProperties } from './world-geojson';

// Map projection types supported by d3-geo
export type ProjectionType =
    | 'geoEquirectangular'
    | 'geoMercator'
    | 'geoNaturalEarth1'
    | 'geoOrthographic'
    | 'geoStereographic'
    | 'geoAzimuthalEqualArea'
    | 'geoAlbers'
    | 'geoConicEqualArea'
    | 'geoEqualEarth';

// Projection configuration
export interface ProjectionConfig {
    type: ProjectionType;
    scale?: number;
    center?: [number, number]; // [longitude, latitude]
    translate?: [number, number]; // [x, y] offset in pixels
    rotate?: [number, number, number]; // [yaw, pitch, roll] for 3D projections
    clipAngle?: number; // for orthographic projections
}

// Preset projection configurations
export const projectionPresets: Record<string, ProjectionConfig> = {
    'Natural Earth': { type: 'geoNaturalEarth1', scale: 150 },
    'Mercator': { type: 'geoMercator', scale: 120 },
    'Orthographic': { type: 'geoOrthographic', scale: 200, clipAngle: 90 },
    'Equirectangular': { type: 'geoEquirectangular', scale: 150 },
    'Equal Earth': { type: 'geoEqualEarth', scale: 150 },
    'Stereographic': { type: 'geoStereographic', scale: 100 },
};

// Create d3 projection from config
const createProjection = (config: ProjectionConfig, width: number, height: number): d3.GeoProjection => {
    let projection: d3.GeoProjection;

    // Create the projection based on type
    switch (config.type) {
        case 'geoEquirectangular':
            projection = d3.geoEquirectangular();
            break;
        case 'geoMercator':
            projection = d3.geoMercator();
            break;
        case 'geoNaturalEarth1':
            projection = d3.geoNaturalEarth1();
            break;
        case 'geoOrthographic':
            projection = d3.geoOrthographic();
            if (config.clipAngle !== undefined) {
                projection.clipAngle(config.clipAngle);
            }
            break;
        case 'geoStereographic':
            projection = d3.geoStereographic();
            break;
        case 'geoAzimuthalEqualArea':
            projection = d3.geoAzimuthalEqualArea();
            break;
        case 'geoAlbers':
            projection = d3.geoAlbers();
            break;
        case 'geoConicEqualArea':
            projection = d3.geoConicEqualArea();
            break;
        case 'geoEqualEarth':
            projection = d3.geoEqualEarth();
            break;
        default:
            projection = d3.geoNaturalEarth1();
    }

    // Configure the projection
    projection
        .translate(config.translate || [width / 2, height / 2])
        .scale(config.scale || Math.min(width, height) / 6)
        .precision(0.1); // Improve precision for better antimeridian handling

    if (config.center) {
        projection.center(config.center);
    }

    if (config.rotate) {
        projection.rotate(config.rotate);
    }

    return projection;
};

// Tooltip data structure
export interface TooltipData<P extends GeoJsonProperties> {
    id: string | number;
    name: string;
    properties: P;
    coordinates: [number, number]; // [x, y] in screen coordinates
}

// Convert GeoJSON to React SVG elements with d3 projection
export const renderGeojson = <G extends Geometry, P extends GeoJsonProperties>(
    geojson: GeoJSON<G, P>,
    projection: d3.GeoProjection,
    props: Omit<React.SVGProps<SVGElement>, "ref"> = {},
    onFeatureClick?: (feature: Feature<G, P>, coordinates: [number, number]) => void
): React.ReactNode => {
    // Create a path generator with the projection
    const pathGenerator = d3.geoPath().projection(projection);

    const baseProps = {
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1,
        ...props,
    };

    switch (geojson.type) {
        case "FeatureCollection":
            return geojson.features.map((feature, index) => {
                const pathData = pathGenerator(feature);
                if (!pathData) return null;

                return (
                    <motion.path
                        key={`feature-${index}`}
                        id={feature.id?.toString()}
                        d={pathData}
                        // initial={{ pathLength: 0, opacity: 0 }}
                        // animate={{ pathLength: 1, opacity: 1 }}
                        // transition={{
                        //     duration: 0.8,
                        //     delay: index * 0.01,
                        //     ease: "easeInOut"
                        // }}
                        whileHover={{
                            fill: "rgba(59, 130, 246, 0.3)",
                            transition: { duration: 0.01 }
                        }}
                        onClick={(event) => {
                            if (onFeatureClick) {
                                const svgRect = (event.currentTarget as SVGElement).ownerSVGElement?.getBoundingClientRect();
                                if (svgRect) {
                                    const x = event.clientX - svgRect.left;
                                    const y = event.clientY - svgRect.top;
                                    onFeatureClick(feature, [x, y]);
                                }
                            }
                        }}
                        fill={baseProps.fill}
                        stroke={baseProps.stroke}
                        strokeWidth={baseProps.strokeWidth}
                        style={{
                            cursor: onFeatureClick ? 'pointer' : 'default',
                            pointerEvents: 'auto'
                        }}
                    />
                );
            });
        case "Feature":
            const pathData = pathGenerator(geojson);
            if (!pathData) return null;

            return (
                <motion.path
                    id={geojson.id?.toString()}
                    d={pathData}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    onClick={(event) => {
                        if (onFeatureClick) {
                            const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
                            const svgRect = (event.currentTarget as SVGElement).ownerSVGElement?.getBoundingClientRect();
                            if (svgRect) {
                                const x = event.clientX - svgRect.left;
                                const y = event.clientY - svgRect.top;
                                onFeatureClick(geojson, [x, y]);
                            }
                        }
                    }}
                    fill={baseProps.fill}
                    stroke={baseProps.stroke}
                    strokeWidth={baseProps.strokeWidth}
                    style={{
                        cursor: onFeatureClick ? 'pointer' : 'default',
                        pointerEvents: 'auto'
                    }}
                />
            );
        case "Polygon":
        case "MultiPolygon":
        case "LineString":
        case "MultiLineString":
        case "Point":
        case "MultiPoint":
            const geometryPathData = pathGenerator(geojson as any);
            if (!geometryPathData) return null;

            return (
                <motion.path
                    d={geometryPathData}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    onClick={(event) => {
                        if (onFeatureClick) {
                            const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
                            const svgRect = (event.currentTarget as SVGElement).ownerSVGElement?.getBoundingClientRect();
                            if (svgRect) {
                                const x = event.clientX - svgRect.left;
                                const y = event.clientY - svgRect.top;
                                // onFeatureClick(geojson, [x, y]);
                            }
                        }
                    }}
                    fill={baseProps.fill}
                    stroke={baseProps.stroke}
                    strokeWidth={baseProps.strokeWidth}
                    style={{
                        cursor: onFeatureClick ? 'pointer' : 'default',
                        pointerEvents: 'auto'
                    }}
                />
            );
        default:
            return null;
    }
};

// Convert GeoJSON geometry to React SVG path elements with d3 projection
export const renderGeometry = (
    geometry: Geometry,
    projection: d3.GeoProjection,
    props: Omit<React.SVGProps<SVGElement>, "ref"> = {}
): React.ReactNode => {
    // Create a path generator with the projection
    const pathGenerator = d3.geoPath().projection(projection);

    const pathData = pathGenerator(geometry as any);
    if (!pathData) return null;

    const baseProps = {
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1,
        ...props,
    };

    return (
        <motion.path
            d={pathData}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            fill={baseProps.fill}
            stroke={baseProps.stroke}
            strokeWidth={baseProps.strokeWidth}
        />
    );
};

// Enhanced props for WorldMap component
export interface WorldMapProps<G extends Geometry, P extends GeoJsonProperties> {
    geojson: GeoJSON<G, P>;
    width?: number;
    height?: number;
    projection?: Partial<ProjectionConfig>;
    className?: string;
    style?: React.CSSProperties;
    pathProps?: Omit<React.SVGProps<SVGElement>, "ref">;
    /** Whether to show projection controls */
    showControls?: boolean;
    /** Whether to auto-cycle through projections */
    autoCycle?: boolean;
    /** Auto-cycle interval in milliseconds */
    cycleInterval?: number;
    /** Animation duration for projection transitions */
    transitionDuration?: number;
    /** Whether to enable drag/pan functionality */
    enableDrag?: boolean;
    /** Whether to enable zoom functionality */
    enableZoom?: boolean;
    /** Initial projection preset name */
    initialProjection?: string;
    /** Custom projection presets */
    customPresets?: Record<string, ProjectionConfig>;
    /** Whether to enable tooltips on click */
    enableTooltips?: boolean;
    /** Custom tooltip content renderer */
    tooltipContent?: (data: TooltipData<P>) => React.ReactNode;
    /** Tooltip position offset */
    tooltipOffset?: [number, number];
}

const WorldMap = <G extends Geometry, P extends WorldMapProperties>({
    geojson,
    width = 800,
    height = 600,
    projection = {},
    className,
    style,
    pathProps = {},
    showControls = false,
    autoCycle = false,
    cycleInterval = 4000,
    transitionDuration = 1.2,
    enableDrag = false,
    enableZoom = false,
    initialProjection = 'Natural Earth',
    customPresets = {},
    enableTooltips = false,
    tooltipContent,
    tooltipOffset = [10, -10]
}: WorldMapProps<G, P>) => {
    // Combine default presets with custom ones
    const allPresets = { ...projectionPresets, ...customPresets };

    // State management
    const [currentPreset, setCurrentPreset] = useState(initialProjection);
    const [prevPreset, setPrevPreset] = useState(initialProjection);

    // Tooltip state
    const [tooltip, setTooltip] = useState<TooltipData<P> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Motion values for smooth transitions
    const transitionProgress = useMotionValue(1);
    const viewBox = useMotionValue([0, 0, width, height]);
    const zoom = useMotionValue(1);
    const rotation = useMotionValue([0, 0, 0]);

    // Drag controls
    const dragControls = useDragControls();

    // Transform viewBox to string
    const viewBoxStr = useTransform(viewBox, (v) => `${v[0]} ${v[1]} ${v[2]} ${v[3]}`);

    // Get current projection configs
    const prevConfig = { ...allPresets[prevPreset], ...projection };
    const currentConfig = { ...allPresets[currentPreset], ...projection };

    // Animated projection parameters
    const animatedScale = useTransform(
        transitionProgress,
        [0, 1],
        [prevConfig.scale || 150, currentConfig.scale || 150]
    );

    const animatedRotation = useTransform(
        transitionProgress,
        [0, 1],
        [prevConfig.rotate || [0, 0, 0], currentConfig.rotate || [0, 0, 0]],
        {
            mixer: (a, b) => (t: number) => [
                a[0] + (b[0] - a[0]) * t,
                a[1] + (b[1] - a[1]) * t,
                a[2] + (b[2] - a[2]) * t,
            ] as [number, number, number]
        }
    );

    // Create projections for morphing
    const d3Projection = useMemo(() => {
        const config = {
            ...currentConfig,
            scale: animatedScale.get() * zoom.get(),
            rotate: animatedRotation.get() as [number, number, number]
        };
        return createProjection(config, width, height);
    }, [currentConfig, width, height, animatedScale, animatedRotation, zoom]);

    const defaultPathProps = {
        fill: "#e5e7eb",
        stroke: "#374151",
        strokeWidth: 0.5,
        ...pathProps
    };

    // Animation logic for projection transitions
    useEffect(() => {
        if (prevPreset !== currentPreset) {
            transitionProgress.set(0);
            const animation = animate(transitionProgress, 1, {
                duration: transitionDuration,
                ease: "easeInOut",
                onComplete: () => setPrevPreset(currentPreset),
            });
            return () => animation.stop();
        }
    }, [currentPreset, transitionDuration, transitionProgress, prevPreset]);

    // Auto-cycle through projections
    useEffect(() => {
        if (!autoCycle) return;
        const presetNames = Object.keys(allPresets);
        const interval = setInterval(() => {
            const currentIdx = presetNames.indexOf(currentPreset);
            const nextIdx = (currentIdx + 1) % presetNames.length;
            setCurrentPreset(presetNames[nextIdx]);
        }, cycleInterval);
        return () => clearInterval(interval);
    }, [allPresets, autoCycle, cycleInterval, currentPreset]);

    // Handle feature click for tooltip
    const handleFeatureClick = (feature: any, coordinates: [number, number]) => {
        if (!enableTooltips) return;

        const featureData: TooltipData<P> = {
            id: feature.id || 'unknown',
            name: feature.properties?.NAME || feature.properties?.name || feature.properties?.NAME_EN || 'Unknown Location',
            properties: feature.properties,
            coordinates: [coordinates[0] + tooltipOffset[0], coordinates[1] + tooltipOffset[1]]
        };

        setTooltip(featureData);
    };

    // Close tooltip when clicking outside
    const handleContainerClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            setTooltip(null);
        }
    };

    // Render the map with current projection
    const map = useMemo(() => {
        return renderGeojson(
            geojson,
            d3Projection,
            defaultPathProps,
            enableTooltips ? handleFeatureClick : undefined
        );
    }, [d3Projection, defaultPathProps, enableTooltips]);

    // Default tooltip renderer
    const defaultTooltipContent = (data: TooltipData<P>) => (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
            <div className="font-semibold text-gray-900 mb-1">{data.name}</div>
            {data.properties && (
                <div className="text-sm text-gray-600 space-y-1">
                    {Object.entries(data.properties)
                        .filter(([key, value]) =>
                            value &&
                            typeof value === 'string' &&
                            !['NAME', 'name', 'NAME_EN'].includes(key)
                        )
                        .slice(0, 3)
                        .map(([key, value]) => (
                            <div key={key}>
                                <span className="font-medium">{key}:</span> {value}
                            </div>
                        ))
                    }
                </div>
            )}
            <button
                onClick={() => setTooltip(null)}
                className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
                ×
            </button>
        </div>
    );

    const mapContent = (
        <motion.svg
            width={width}
            height={height}
            viewBox={viewBoxStr}
            className="overflow-hidden"
            style={{
                cursor: enableDrag ? 'grab' : 'default',
                touchAction: enableDrag ? 'none' : 'auto'
            }}
            whileTap={{ cursor: enableDrag ? 'grabbing' : 'default' }}
        >
            {/* Background */}
            <rect width={width} height={height} fill="#f8fafc" />

            {/* Animated map content */}
            <AnimatePresence mode="wait">
                <motion.g
                    key={currentPreset}
                >
                    {map}
                </motion.g>
            </AnimatePresence>

            {/* Zoom controls overlay */}
            {enableZoom && (
                <g>
                    <circle
                        cx={width - 60}
                        cy={60}
                        r={20}
                        fill="white"
                        stroke="#e5e7eb"
                        strokeWidth={1}
                        style={{ cursor: 'pointer' }}
                        onClick={() => zoom.set(Math.min(zoom.get() * 1.2, 3))}
                    />
                    <text x={width - 60} y={65} textAnchor="middle" fontSize={12} fill="#374151">+</text>

                    <circle
                        cx={width - 60}
                        cy={100}
                        r={20}
                        fill="white"
                        stroke="#e5e7eb"
                        strokeWidth={1}
                        style={{ cursor: 'pointer' }}
                        onClick={() => zoom.set(Math.max(zoom.get() / 1.2, 0.5))}
                    />
                    <text x={width - 60} y={105} textAnchor="middle" fontSize={12} fill="#374151">-</text>
                </g>
            )}
        </motion.svg>
    );

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                ref={containerRef}
                className="relative"
                onClick={handleContainerClick}
            >
                {enableDrag ? (
                    <motion.div
                        drag
                        dragControls={dragControls}
                        className={className}
                        style={{
                            ...style,
                            touchAction: 'none'
                        }}
                        onDrag={(e, info) => {
                            const currentViewBox = viewBox.get();
                            viewBox.set([
                                currentViewBox[0] - info.delta.x,
                                currentViewBox[1] - info.delta.y,
                                currentViewBox[2],
                                currentViewBox[3],
                            ]);
                        }}
                        onPointerDown={(event) => dragControls.start(event)}
                    >
                        {mapContent}
                    </motion.div>
                ) : (
                    <div className={className} style={style}>
                        {mapContent}
                    </div>
                )}

                {/* Tooltip */}
                <AnimatePresence>
                    {tooltip && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 pointer-events-auto"
                            style={{
                                left: tooltip.coordinates[0],
                                top: tooltip.coordinates[1],
                                transform: 'translate(-50%, -100%)'
                            }}
                        >
                            {tooltipContent ? tooltipContent(tooltip) : defaultTooltipContent(tooltip)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Projection controls */}
            {showControls && (
                <div className="flex gap-2 flex-wrap max-w-2xl">
                    {Object.keys(allPresets).map((presetName) => (
                        <button
                            key={presetName}
                            onClick={() => setCurrentPreset(presetName)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${currentPreset === presetName
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            {presetName}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorldMap;