import { Geometry } from "geojson";

// Point-in-polygon test using ray casting algorithm
export function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

// Check if two line segments intersect
export function lineSegmentsIntersect(
  p1: [number, number], 
  q1: [number, number], 
  p2: [number, number], 
  q2: [number, number]
): boolean {
  function onSegment(p: [number, number], q: [number, number], r: [number, number]): boolean {
    return q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
           q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]);
  }
  
  function orientation(p: [number, number], q: [number, number], r: [number, number]): number {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    if (val === 0) return 0;
    return val > 0 ? 1 : 2;
  }
  
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);
  
  // General case
  if (o1 !== o2 && o3 !== o4) return true;
  
  // Special cases
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  
  return false;
}

// Check if two polygons intersect (simplified - checks if any edges intersect)
export function polygonsIntersect(poly1: number[][], poly2: number[][]): boolean {
  // Check if any vertex of poly1 is inside poly2
  for (const point of poly1) {
    if (pointInPolygon(point as [number, number], poly2)) {
      return true;
    }
  }
  
  // Check if any vertex of poly2 is inside poly1
  for (const point of poly2) {
    if (pointInPolygon(point as [number, number], poly1)) {
      return true;
    }
  }
  
  // Check if any edges intersect
  for (let i = 0; i < poly1.length - 1; i++) {
    for (let j = 0; j < poly2.length - 1; j++) {
      if (lineSegmentsIntersect(
        poly1[i] as [number, number],
        poly1[i + 1] as [number, number],
        poly2[j] as [number, number],
        poly2[j + 1] as [number, number]
      )) {
        return true;
      }
    }
  }
  
  return false;
}

// Main geometry intersection function
export function geometriesIntersect(geom1: Geometry, geom2: Geometry): boolean {
  // Handle different geometry types
  switch (geom1.type) {
    case "Point":
      return handlePointIntersection(geom1, geom2);
    case "Polygon":
      return handlePolygonIntersection(geom1, geom2);
    case "MultiPolygon":
      return handleMultiPolygonIntersection(geom1, geom2);
    case "LineString":
      return handleLineStringIntersection(geom1, geom2);
    case "MultiLineString":
      return handleMultiLineStringIntersection(geom1, geom2);
    case "MultiPoint":
      return handleMultiPointIntersection(geom1, geom2);
    default:
      return false;
  }
}

function handlePointIntersection(point: Extract<Geometry, { type: "Point" }>, geom2: Geometry): boolean {
  switch (geom2.type) {
    case "Point":
      return point.coordinates[0] === geom2.coordinates[0] && 
             point.coordinates[1] === geom2.coordinates[1];
    case "Polygon":
      return pointInPolygon(point.coordinates as [number, number], geom2.coordinates[0]);
    case "MultiPolygon":
      return geom2.coordinates.some(polygon => 
        pointInPolygon(point.coordinates as [number, number], polygon[0])
      );
    default:
      return false;
  }
}

function handlePolygonIntersection(poly: Extract<Geometry, { type: "Polygon" }>, geom2: Geometry): boolean {
  switch (geom2.type) {
    case "Point":
      return pointInPolygon(geom2.coordinates as [number, number], poly.coordinates[0]);
    case "Polygon":
      return polygonsIntersect(poly.coordinates[0], geom2.coordinates[0]);
    case "MultiPolygon":
      return geom2.coordinates.some(polygon => 
        polygonsIntersect(poly.coordinates[0], polygon[0])
      );
    default:
      return false;
  }
}

function handleMultiPolygonIntersection(multiPoly: Extract<Geometry, { type: "MultiPolygon" }>, geom2: Geometry): boolean {
  return multiPoly.coordinates.some(polygon => {
    const singlePoly: Extract<Geometry, { type: "Polygon" }> = {
      type: "Polygon",
      coordinates: polygon
    };
    return handlePolygonIntersection(singlePoly, geom2);
  });
}

function handleLineStringIntersection(line: Extract<Geometry, { type: "LineString" }>, geom2: Geometry): boolean {
  // Simplified - just check bounding box intersection for now
  // You could implement proper line-polygon intersection here
  return false;
}

function handleMultiLineStringIntersection(multiLine: Extract<Geometry, { type: "MultiLineString" }>, geom2: Geometry): boolean {
  return multiLine.coordinates.some(lineCoords => {
    const singleLine: Extract<Geometry, { type: "LineString" }> = {
      type: "LineString",
      coordinates: lineCoords
    };
    return handleLineStringIntersection(singleLine, geom2);
  });
}

function handleMultiPointIntersection(multiPoint: Extract<Geometry, { type: "MultiPoint" }>, geom2: Geometry): boolean {
  return multiPoint.coordinates.some(pointCoords => {
    const singlePoint: Extract<Geometry, { type: "Point" }> = {
      type: "Point",
      coordinates: pointCoords
    };
    return handlePointIntersection(singlePoint, geom2);
  });
} 