import * as d3 from 'd3-geo';
import { GeoJSON, Geometry } from 'geojson';
import { useMemo } from 'react';
import { worldGeojson } from './world-geojson';

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

// Create d3 projection from config
const createProjection = (config: ProjectionConfig, width: number, height: number) => {
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

// Convert GeoJSON to React SVG elements with d3 projection
export const renderGeojson = (
    geojson: GeoJSON,
    projection: d3.GeoProjection,
    props: Omit<React.SVGProps<SVGElement>, "ref"> = {}
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
                    <path
                        key={`feature-${index}`}
                        id={feature.id?.toString()}
                        d={pathData}
                        {...baseProps}
                    />
                );
            });
        case "Feature":
            const pathData = pathGenerator(geojson);
            if (!pathData) return null;
            
            return (
                <path
                    id={geojson.id?.toString()}
                    d={pathData}
                    {...baseProps}
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
                <path
                    d={geometryPathData}
                    {...baseProps}
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
        <path
            d={pathData}
            {...baseProps}
        />
    );
};

// Props for WorldMap component
export interface WorldMapProps {
    width?: number;
    height?: number;
    projection?: Partial<ProjectionConfig>;
    className?: string;
    style?: React.CSSProperties;
    pathProps?: Omit<React.SVGProps<SVGElement>, "ref">;
}

const WorldMap: React.FC<WorldMapProps> = ({
    width = 800,
    height = 600,
    projection = {},
    className,
    style,
    pathProps = {}
}) => {
    // Default projection configuration
    const projectionConfig: ProjectionConfig = {
        type: 'geoNaturalEarth1',
        ...projection
    };

    const defaultPathProps = {
        fill: "#e5e7eb",
        stroke: "#374151",
        strokeWidth: 0.5,
        ...pathProps
    };

    const d3Projection = useMemo(() => {
        return createProjection(projectionConfig, width, height);
    }, [projectionConfig, width, height]);

    const map = useMemo(() => {
        return renderGeojson(worldGeojson, d3Projection, defaultPathProps);
    }, [d3Projection, defaultPathProps]);

    return (
        <div className={className} style={style}>
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
            >
                {map}
            </svg>
        </div>
    );
};

export default WorldMap;