"use client";
import * as d3 from 'd3-geo';
import { interpolate } from 'flubber';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import {
    animate,
    AnimatePresence,
    motion,
    useMotionValue,
    useTransform
} from 'motion/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GlowFilter from '../svg/filter/glow-filter';
import type { WorldMapProperties } from './world-geojson';
import { WorldMapFeature } from './world-map-feature';

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



// Create d3 projection from config
const createProjection = (type: ProjectionType, geojson: any, width: number, height: number): d3.GeoProjection => {
    const projection = d3[type]();

    // Fit the projection to the geojson bounds and specified dimensions
    projection.fitSize([width, height], geojson);

    return projection;
};

// Tooltip data structure
export interface TooltipData<P extends WorldMapProperties> {
    id: string | number;
    properties: P;
    coordinates: [number, number]; // [x, y] in screen coordinates
}











// Enhanced props for WorldMap component
export interface WorldMapProps<G extends Geometry, P extends WorldMapProperties> {
    collection: FeatureCollection<G, P>
    width?: number;
    height?: number;
    projection: ProjectionType;
    className?: string;
    /** Whether to show projection controls */
    showControls?: boolean;
    /** Whether to enable tooltips on click */
    enableTooltips?: boolean;
    /** Custom tooltip content renderer */
    tooltipContent?: (data: TooltipData<P>) => React.ReactNode;
    /** Tooltip position offset */
    tooltipOffset?: [number, number];
}





const WorldMap = React.memo(<G extends Geometry, P extends WorldMapProperties>({
    collection,
    width = 1000,
    height = 1000,
    projection = 'geoMercator',
    className = "bg-gray-50 rounded-lg",
    showControls = false,
    enableTooltips = false,
    tooltipContent,
    tooltipOffset = [10, -10]
}: WorldMapProps<G, P>) => {

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [clipPathId] = useState(
        () => `morphingClipper-${Math.random().toString(36).substr(2, 9)}`
    );

    const initialPath = useMemo(() => `M0,0 L${width},0 L${width},${height} L0,${height} Z`, [width, height]);
    const [prevPath, setPrevPath] = useState<string>(initialPath);
    const [currentPath, setCurrentPath] = useState<string>(initialPath);



    const transitionProgress = useMotionValue(1);

    useEffect(() => {
        if (prevPath !== currentPath) {
            transitionProgress.set(0);
            animate(transitionProgress, 1, {
                duration: 0.7,
                ease: 'easeInOut',
            });
        }
    }, [prevPath, currentPath, transitionProgress]);


    const morphingPath = useTransform(
        transitionProgress,
        [0, 1],
        [prevPath, currentPath],
        {
            mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 1 }),
        }
    );


    const [maskedOpacity] = useState<number>(0.2);

    const [tooltip, setTooltip] = useState<TooltipData<P> | null>(null);

    const x1 = useMotionValue(0);
    const y1 = useMotionValue(0);
    const x2 = useMotionValue(width);
    const y2 = useMotionValue(height);


    const viewbox = useTransform([x1, y1, x2, y2], (v) => `${v[0]} ${v[1]} ${v[2]} ${v[3]}`)


    const d3Projection = useMemo(() => {
        return createProjection(projection, collection, width, height);
    }, [projection, collection, width, height]);

    const handleFeatureClick = useCallback((feature: Feature<G, P>, coordinates: [number, number], projection: d3.GeoProjection) => {
        if (!enableTooltips || !feature.properties) return;

        const pathGenerator = d3.geoPath().projection(projection);
        const geometryPathData = pathGenerator(feature);

        if (geometryPathData) {
            setPrevPath(currentPath);
            setCurrentPath(geometryPathData);
        }

        const featureData: TooltipData<P> = {
            id: feature.id || 'unknown',
            properties: feature.properties,
            coordinates: [coordinates[0] + tooltipOffset[0], coordinates[1] + tooltipOffset[1]]
        };
        setTooltip(featureData);

        if (feature.bbox) {
            const bbox = feature.bbox;
            const p1 = projection([bbox[0], bbox[1]]) ?? [0, 0];
            const p2 = projection([bbox[2], bbox[3]]) ?? [0, 0];

            // Clamp coordinates to visible map bounds
            const minX = Math.max(0, Math.min(p1[0], p2[0]));
            const maxX = Math.min(width, Math.max(p1[0], p2[0]));
            const minY = Math.max(0, Math.min(p1[1], p2[1]));
            const maxY = Math.min(height, Math.max(p1[1], p2[1]));

            const bboxWidth = Math.abs(maxX - minX);
            const bboxHeight = Math.abs(maxY - minY);

            // Adaptive padding: less padding for countries near edges or very large countries
            const isNearEdge = minX <= 50 || maxX >= width - 50 || minY <= 50 || maxY >= height - 50;
            const isLargeCountry = bboxWidth > width * 0.3 || bboxHeight > height * 0.3;
            const padding = isNearEdge || isLargeCountry ? 10 : 20;

            animate(x1, Math.max(0, minX - padding), { duration: 0.7, ease: "easeInOut" });
            animate(y1, Math.max(0, minY - padding), { duration: 0.7, ease: "easeInOut" });
            animate(x2, Math.min(width, bboxWidth + 2 * padding), { duration: 0.7, ease: "easeInOut" });
            animate(y2, Math.min(height, bboxHeight + 2 * padding), { duration: 0.7, ease: "easeInOut" });
        }
    }, [enableTooltips, tooltipOffset, currentPath, width, height, x1, y1, x2, y2]);

    // Memoize the features to prevent unnecessary re-renders
    const memoizedFeatures = useMemo(() => {
        return collection.features.map((feature, index) => (
            <WorldMapFeature
                key={feature.id || index}
                feature={feature}
                projection={d3Projection}
                onFeatureClick={handleFeatureClick}
            />
        ));
    }, [collection.features, d3Projection, handleFeatureClick]);

    const handleClickOutside = (event: React.PointerEvent<SVGRectElement>) => {
        if (tooltip) {
            setPrevPath(currentPath)
            setCurrentPath(initialPath);
            setTooltip(null);
            // Reset viewBox to original view
            animate(x1, 0, { duration: 0.7, ease: "easeInOut" });
            animate(y1, 0, { duration: 0.7, ease: "easeInOut" });
            animate(x2, width, { duration: 0.7, ease: "easeInOut" });
            animate(y2, height, { duration: 0.7, ease: "easeInOut" });
        }
    };



    return (
        <div className="flex flex-col items-center gap-4 w-full h-full bg-red-200">
            <div ref={mapContainerRef} className={`relative ${className} w-full h-full bg-fuchsia-400`}>
                <motion.svg
                    width={'100%'}
                    height={'100%'}
                    viewBox={viewbox}

                    className=" w-full h-full bg-amber-200"
                >
                    <defs>
                        <pattern
                            id="morphingBackgroundPattern"
                            x="0"
                            y="0"
                            width="10"
                            height="10"
                            patternUnits="userSpaceOnUse"
                        >
                            <rect width="10" height="10" fill="#f8f9fa" />
                            <circle cx="5" cy="5" r="1" fill="#e9ecef" />
                        </pattern>
                        <GlowFilter
                            id="animated-glow"
                            color="#10b981"
                            intensity={2}
                            animated
                            pulsing
                            duration={2}
                            easing="easeInOut"
                            glowLayers={4}
                        />
                        <mask id={clipPathId}>
                            {/* Background with base opacity */}
                            <rect
                                x="0"
                                y="0"
                                width={width}
                                height={height}
                                fill={`rgb(${maskedOpacity * 255}, ${maskedOpacity * 255}, ${maskedOpacity * 255
                                    })`}
                            />
                            {/* Effect-specific path rendering */}

                            <motion.path d={morphingPath} fill="white" />
                        </mask>
                    </defs>

                    <rect
                        width={width}
                        height={height}
                        fill="url(#morphingBackgroundPattern)"
                        onPointerDown={handleClickOutside}
                    />
                    {/* Maked Layer */}
                    <motion.g id='masked-layer' mask={`url(#${clipPathId})`} className='pointer-events-none'>

                    </motion.g>
                    {/* Interactive layer */}
                    <motion.g id='interactive-layer'>
                        {memoizedFeatures}
                    </motion.g>
                    <AnimatePresence>
                        {tooltip && (

                            <foreignObject
                                x={tooltip.coordinates[0]}
                                y={tooltip.coordinates[1]}
                                width={100}
                                height={100}
                                className='bg-white rounded-md p-2 shadow-md pointer-none'
                            >
                                {tooltipContent && tooltipContent(tooltip)}
                            </foreignObject>
                        )}
                    </AnimatePresence>

                </motion.svg>


            </div>

        </div >
    );
});

export default WorldMap;