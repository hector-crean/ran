"use client"

// WorldMapFeatures.tsx
import * as d3 from 'd3-geo';
import { Feature, Geometry } from 'geojson';
import { motion } from 'motion/react';
import { useState } from 'react';
import { WorldMapProperties } from './world-geojson';




interface WorldMapFeatureProps<G extends Geometry, P extends WorldMapProperties> {
    feature: Feature<G, P>;
    projection: d3.GeoProjection;
    onFeatureClick?: (feature: Feature<G, P>, coordinates: [number, number], projection: d3.GeoProjection) => void;
}


const WorldMapFeature = <G extends Geometry, P extends WorldMapProperties>({
    feature,
    projection,
    onFeatureClick
}: WorldMapFeatureProps<G, P>) => {

    const [selected, setSelected] = useState(false);

    const pathGenerator = d3.geoPath().projection(projection);
    const geometryPathData = pathGenerator(feature);
    if (!geometryPathData) return null;

    const projectedCentroid = projection(feature.properties.centroid)

    const handleClick = () => {
        setSelected(!selected);
        onFeatureClick?.(feature, projectedCentroid ?? [0, 0], projection)
    }
    return (
        <motion.path
            d={geometryPathData}
            onClick={handleClick}
            style={{ cursor: onFeatureClick ? 'pointer' : 'default', pointerEvents: 'auto' }}

            initial={{
                fill: 'pink', // blue-800
                strokeWidth: 1,
                opacity: 1
            }}
            whileHover={{
                fill: 'red', // blue-600
                strokeWidth: 1,

            }}
           
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
    );
}

export { WorldMapFeature };

