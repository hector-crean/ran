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
        .scale(config.scale || Math.min(width, height) / 6);

    if (config.center) {
        projection.center(config.center);
    }

    if (config.rotate) {
        projection.rotate(config.rotate);
    }

    return projection;
};

// Helper function to convert coordinates to path string using d3 projection
const coordinatesToPath = (
    coordinates: number[][],
    projection: d3.GeoProjection,
    close: boolean = false
): string => {
    const pathParts = coordinates
        .map((coord) => {
            const projected = projection([coord[0], coord[1]]);
            return projected ? projected : [0, 0]; // Handle null projections
        })
        .map((coord, i) => `${i === 0 ? "M" : "L"} ${coord[0]} ${coord[1]}`);

    return pathParts.join(" ") + (close ? " Z" : "");
};

// Convert GeoJSON geometry to React SVG path elements with d3 projection
export const renderGeometry = (
    geometry: Geometry,
    projection: d3.GeoProjection,
    props: Omit<React.SVGProps<SVGElement>, "ref"> = {}
): React.ReactNode => {

    const baseProps = {
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1,
        ...props,
    };

    switch (geometry.type) {
        case "Polygon":
            return geometry.coordinates.map((ring, index) => (
                <path
                    key={`polygon-${index}`}
                    d={coordinatesToPath(ring, projection, true)}
                    {...baseProps}
                />
            ));

        case "MultiPolygon":
            return geometry.coordinates
                .map((polygonCoords, polygonIndex) =>
                    polygonCoords.map((ring, ringIndex) => (
                        <path
                            key={`multipolygon-${polygonIndex}-${ringIndex}`}
                            d={coordinatesToPath(ring, projection, true)}
                            {...baseProps}
                        />
                    ))
                )
                .flat();

        case "LineString":
            return (
                <path
                    key="linestring"
                    d={coordinatesToPath(geometry.coordinates, projection)}
                    {...baseProps}
                />
            );

        case "MultiLineString":
            return geometry.coordinates.map((lineCoords, index) => (
                <path
                    key={`multilinestring-${index}`}
                    d={coordinatesToPath(lineCoords, projection)}
                    {...baseProps}
                />
            ));

        case "Point":
            const projected = projection([geometry.coordinates[0], geometry.coordinates[1]]);
            if (!projected) return null;

            const [x, y] = projected;
            const circleProps = {
                ...baseProps,
                fill: "currentColor",
                stroke: "none",
            };
            return (
                <circle
                    key="point"
                    cx={x}
                    cy={y}
                    r={props.strokeWidth || 2}
                    {...circleProps}
                />
            );

        case "MultiPoint":
            const multiCircleProps = {
                ...baseProps,
                fill: "currentColor",
                stroke: "none",
            };
            return geometry.coordinates.map((coordinate, index) => {
                const projected = projection([coordinate[0], coordinate[1]]);
                if (!projected) return null;

                const [x, y] = projected;
                return (
                    <circle
                        key={`multipoint-${index}`}
                        cx={x}
                        cy={y}
                        r={props.strokeWidth || 2}
                        {...multiCircleProps}
                    />
                );
            }).filter(Boolean);

        default:
            return null;
    }
};

// Convert GeoJSON to React SVG elements with d3 projection
export const renderGeojson = (
    geojson: GeoJSON,
    projection: d3.GeoProjection,
    props: Omit<React.SVGProps<SVGElement>, "ref"> = {}
): React.ReactNode => {
    switch (geojson.type) {
        case "FeatureCollection":
            return geojson.features.map((feature, index) => (
                <g key={`feature-${index}`} id={feature.id?.toString()}>
                    {renderGeometry(feature.geometry, projection, props)}
                </g>
            ));
        case "Feature":
            return <g id={geojson.id?.toString()}>{renderGeometry(geojson.geometry, projection, props)}</g>;
        default:
            return null;
    }
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