import type { Point } from "./point";

/**
 * Tests whether a point lies inside a simple polygon using the ray casting
 * algorithm. A horizontal ray is cast to the right and crossings of polygon
 * edges are counted; an odd count means the point is inside. Points exactly on
 * an edge or vertex may be reported as inside or outside depending on
 * orientation, as is typical for ray casting. The polygon is given as an
 * ordered list of vertices and is not mutated.
 * @param point the point to test
 * @param polygon ordered vertices of the polygon (implicitly closed)
 * @returns `true` if the point is inside the polygon
 */
export function pointInPolygon(point: Point, polygon: readonly Point[]): boolean {
  const n = polygon.length;
  if (n < 3) return false;

  const [px, py] = point;
  let inside = false;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    // Does the edge straddle the horizontal line y = py, and is the crossing
    // point to the right of px?
    const intersects =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }

  return inside;
}

/**
 * Computes the area of a simple polygon using the shoelace formula. The result
 * is the absolute area, so vertex winding order (clockwise or counter-clockwise)
 * does not affect the sign. The polygon is not mutated.
 * @param polygon ordered vertices of the polygon (implicitly closed)
 * @returns the non-negative area enclosed by the polygon
 */
export function polygonArea(polygon: readonly Point[]): number {
  const n = polygon.length;
  if (n < 3) return 0;

  let sum = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    sum += polygon[j][0] * polygon[i][1] - polygon[i][0] * polygon[j][1];
  }
  return Math.abs(sum) / 2;
}
