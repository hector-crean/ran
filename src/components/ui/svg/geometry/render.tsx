import { MaskGeoJson } from "@/types/MaskGeojson";
import { GeoJSON, Geometry } from "geojson";

// Helper function to convert coordinates to path string
const coordinatesToPath = (
    coordinates: number[][],
    close: boolean = false
  ): string => {
    const pathParts = coordinates.map(
      (coord, i) => `${i === 0 ? "M" : "L"} ${coord[0]} ${coord[1]}`
    );
    return pathParts.join(" ") + (close ? " Z" : "");
  };
  
  // Convert GeoJSON geometry to React SVG path elements
  export const renderGeometry = (
    geometry: Geometry,
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
            d={coordinatesToPath(ring, true)}
            {...baseProps}
          />
        ));
  
      case "MultiPolygon":
        return geometry.coordinates
          .map((polygonCoords, polygonIndex) =>
            polygonCoords.map((ring, ringIndex) => (
              <path
                key={`multipolygon-${polygonIndex}-${ringIndex}`}
                d={coordinatesToPath(ring, true)}
                {...baseProps}
              />
            ))
          )
          .flat();
  
      case "LineString":
        return (
          <path
            key="linestring"
            d={coordinatesToPath(geometry.coordinates)}
            {...baseProps}
          />
        );
  
      case "MultiLineString":
        return geometry.coordinates.map((lineCoords, index) => (
          <path
            key={`multilinestring-${index}`}
            d={coordinatesToPath(lineCoords)}
            {...baseProps}
          />
        ));
  
      case "Point":
        const [x, y] = geometry.coordinates;
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
        return geometry.coordinates.map(([x, y], index) => (
          <circle
            key={`multipoint-${index}`}
            cx={x}
            cy={y}
            r={props.strokeWidth || 2}
            {...multiCircleProps}
          />
        ));
  
      default:
        return null;
    }
  };
  
  // Convert GeoJSON to React SVG elements
  export const renderGeojson = (
    geojson: GeoJSON,
    props: Omit<React.SVGProps<SVGElement>, "ref"> = {}
  ): React.ReactNode => {
    switch (geojson.type) {
      case "FeatureCollection":
        return geojson.features.map((feature, index) => (
          <g key={`feature-${index}`}>
            {renderGeometry(feature.geometry, props)}
          </g>
        ));
      case "Feature":
        return renderGeometry(geojson.geometry, props);
      default:
        return null;
    }
  };
  
  // Generic GeoJSON traversal function with visitor pattern
  export const traverseGeojson = <T,>(
    geojson: GeoJSON,
    onVisit: (geometry: Geometry, featureIndex?: number, ringIndex?: number) => T
  ): T[] => {
    const results: T[] = [];
  
    switch (geojson.type) {
      case "FeatureCollection":
        geojson.features.forEach((feature, featureIndex) => {
          const result = onVisit(feature.geometry, featureIndex);
          results.push(result);
        });
        break;
      
      case "Feature":
        const result = onVisit(geojson.geometry);
        results.push(result);
        break;
      
      default:
        // If it's a geometry directly, treat it as a single feature
        if ('coordinates' in geojson) {
          const result = onVisit(geojson as Geometry);
          results.push(result);
        }
        break;
    }
  
    return results;
  };
  
  // Alternative traversal function that also provides feature properties
  export const traverseGeojsonWithProperties = <T,>(
    geojson: MaskGeoJson,
    onVisit: (
      geometry: Geometry, 
      properties?: Record<string, any>, 
      featureIndex?: number
    ) => T
  ): T[] => {
    const results: T[] = [];
  
    switch (geojson.type) {
      case "FeatureCollection":
        geojson.features.forEach((feature, featureIndex) => {
          const result = onVisit(feature.geometry, feature.properties, featureIndex);
          results.push(result);
        });
        break;
      
      case "Feature":
        const result = onVisit(geojson.geometry, geojson.properties);
        results.push(result);
        break;
      
      default:
        // If it's a geometry directly, treat it as a single feature
        if ('coordinates' in geojson) {
          const result = onVisit(geojson as Geometry);
          results.push(result);
        }
        break;
    }
  
    return results;
  };
  
  // Helper function to traverse and reduce GeoJSON with accumulator
  export const reduceGeojson = <T,>(
    geojson: MaskGeoJson,
    reducer: (accumulator: T, geometry: Geometry, featureIndex?: number) => T,
    initialValue: T
  ): T => {
    let accumulator = initialValue;
  
    switch (geojson.type) {
      case "FeatureCollection":
        geojson.features.forEach((feature, featureIndex) => {
          accumulator = reducer(accumulator, feature.geometry, featureIndex);
        });
        break;
      
      case "Feature":
        accumulator = reducer(accumulator, geojson.geometry);
        break;
      
      default:
        // If it's a geometry directly, treat it as a single feature
        if ('coordinates' in geojson) {
          accumulator = reducer(accumulator, geojson as Geometry);
        }
        break;
    }
  
    return accumulator;
  };
  
  // Legacy function for backward compatibility - converts geometry to path string
  export const geometryToPathString = (geometry: Geometry): string => {
    switch (geometry.type) {
      case "Polygon":
        return geometry.coordinates
          .map((ring) => coordinatesToPath(ring, true))
          .join(" ");
  
      case "MultiPolygon":
        return geometry.coordinates
          .map((polygonCoords) =>
            polygonCoords.map((ring) => coordinatesToPath(ring, true)).join(" ")
          )
          .join(" ");
  
      case "LineString":
        return coordinatesToPath(geometry.coordinates);
  
      case "MultiLineString":
        return geometry.coordinates
          .map((lineCoords) => coordinatesToPath(lineCoords))
          .join(" ");
  
      default:
        return "";
    }
  };
  
  // Legacy function for backward compatibility - converts GeoJSON to path string
  export const geojsonToPathString = (geojson: MaskGeoJson): string => {
    switch (geojson.type) {
      case "FeatureCollection":
        return geojson.features
          .map((feature) => geometryToPathString(feature.geometry))
          .join(" ");
      case "Feature":
        return geometryToPathString(geojson.geometry);
      default:
        return "";
    }
  };

  // Calculate centroid (center point) of a geometry
  export const getCentroid = (geometry: Geometry): { x: number; y: number } => {
    switch (geometry.type) {
      case "Point":
        const [x, y] = geometry.coordinates;
        return { x, y };

      case "MultiPoint":
        // Average all points
        const points = geometry.coordinates;
        const sumX = points.reduce((sum, [x]) => sum + x, 0);
        const sumY = points.reduce((sum, [, y]) => sum + y, 0);
        return { x: sumX / points.length, y: sumY / points.length };

      case "LineString":
        // Use middle point of the line
        const coords = geometry.coordinates;
        const midIndex = Math.floor(coords.length / 2);
        const [midX, midY] = coords[midIndex];
        return { x: midX, y: midY };

      case "MultiLineString":
        // Calculate centroid of all line centroids
        const lineCentroids = geometry.coordinates.map(lineCoords => {
          const midIndex = Math.floor(lineCoords.length / 2);
          return lineCoords[midIndex];
        });
        const sumLineX = lineCentroids.reduce((sum, [x]) => sum + x, 0);
        const sumLineY = lineCentroids.reduce((sum, [, y]) => sum + y, 0);
        return { x: sumLineX / lineCentroids.length, y: sumLineY / lineCentroids.length };

      case "Polygon":
        // Calculate centroid of the outer ring (first ring)
        const outerRing = geometry.coordinates[0];
        // Remove the last point if it's the same as the first (closed polygon)
        const ringCoords = outerRing.slice(0, -1);
        const sumPolyX = ringCoords.reduce((sum, [x]) => sum + x, 0);
        const sumPolyY = ringCoords.reduce((sum, [, y]) => sum + y, 0);
        return { x: sumPolyX / ringCoords.length, y: sumPolyY / ringCoords.length };

      case "MultiPolygon":
        // Calculate centroid of all polygon centroids
        const polygonCentroids = geometry.coordinates.map(polygonCoords => {
          const outerRing = polygonCoords[0];
          const ringCoords = outerRing.slice(0, -1);
          const sumX = ringCoords.reduce((sum, [x]) => sum + x, 0);
          const sumY = ringCoords.reduce((sum, [, y]) => sum + y, 0);
          return { x: sumX / ringCoords.length, y: sumY / ringCoords.length };
        });
        const sumMultiX = polygonCentroids.reduce((sum, { x }) => sum + x, 0);
        const sumMultiY = polygonCentroids.reduce((sum, { y }) => sum + y, 0);
        return { x: sumMultiX / polygonCentroids.length, y: sumMultiY / polygonCentroids.length };

      default:
        return { x: 0, y: 0 };
    }
  };

  // Convex Hull calculation using Graham scan algorithm
  const cross = (O: number[], A: number[], B: number[]): number => {
    return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
  };

  const convexHull = (points: number[][]): number[][] => {
    if (points.length <= 1) return points;
    
    // Remove duplicate points
    const uniquePoints = points.filter((point, index, self) => 
      index === self.findIndex(p => p[0] === point[0] && p[1] === point[1])
    );
    
    if (uniquePoints.length <= 1) return uniquePoints;
    
    // Sort points lexicographically
    uniquePoints.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    
    if (uniquePoints.length <= 2) return uniquePoints;
    
    // Build lower hull
    const lower: number[][] = [];
    for (let i = 0; i < uniquePoints.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], uniquePoints[i]) <= 0) {
        lower.pop();
      }
      lower.push(uniquePoints[i]);
    }
    
    // Build upper hull
    const upper: number[][] = [];
    for (let i = uniquePoints.length - 1; i >= 0; i--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], uniquePoints[i]) <= 0) {
        upper.pop();
      }
      upper.push(uniquePoints[i]);
    }
    
    // Remove last point of each half because it's repeated
    upper.pop();
    lower.pop();
    
    return lower.concat(upper);
  };

  // Extract all coordinates from a geometry (including holes for polygons)
  export const getAllCoordinates = (geometry: Geometry): number[][] => {
    const allCoords: number[][] = [];
    
    switch (geometry.type) {
      case "Point":
        allCoords.push(geometry.coordinates);
        break;
        
      case "MultiPoint":
        allCoords.push(...geometry.coordinates);
        break;
        
      case "LineString":
        allCoords.push(...geometry.coordinates);
        break;
        
      case "MultiLineString":
        geometry.coordinates.forEach(lineCoords => {
          allCoords.push(...lineCoords);
        });
        break;
        
      case "Polygon":
        // Include all rings (outer + holes)
        geometry.coordinates.forEach(ring => {
          allCoords.push(...ring);
        });
        break;
        
      case "MultiPolygon":
        geometry.coordinates.forEach(polygonCoords => {
          polygonCoords.forEach(ring => {
            allCoords.push(...ring);
          });
        });
        break;
    }
    
    return allCoords;
  };

  // Calculate convex hull for a geometry
  export const getConvexHull = (geometry: Geometry): number[][] => {
    const allCoords = getAllCoordinates(geometry);
    return convexHull(allCoords);
  };

  // Render convex hull as an SVG path
  export const renderConvexHull = (
    geometry: Geometry,
    props: Omit<React.SVGProps<SVGPathElement>, "ref"> = {}
  ): React.ReactNode => {
    const hull = getConvexHull(geometry);
    
    if (hull.length < 3) return null;
    
    const pathData = coordinatesToPath(hull, true);
    
    const baseProps = {
      fill: "rgba(59, 130, 246, 0.2)", // blue with transparency
      stroke: "rgb(59, 130, 246)",
      strokeWidth: 2,
      strokeDasharray: "5,5",
      ...props,
    };
    
    return (
      <path
        d={pathData}
        {...baseProps}
      />
    );
  };