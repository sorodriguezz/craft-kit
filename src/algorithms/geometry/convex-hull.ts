import type { Point } from "./point";

/**
 * Computes the 2D cross product of vectors OA and OB where O is the origin
 * point. A positive result means O -> A -> B turns counter-clockwise, negative
 * means clockwise, and zero means the points are collinear.
 */
function cross(o: Point, a: Point, b: Point): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

/**
 * Computes the convex hull of a set of 2D points using Andrew's monotone chain
 * algorithm. The hull is returned as a list of points in counter-clockwise
 * order, starting from the lexicographically smallest point. Collinear points
 * on the hull boundary are excluded. The input is not mutated.
 *
 * For fewer than three points the input points (deduplicated by reference order
 * after sorting) are returned as-is.
 * @param points points to enclose
 * @returns the convex hull vertices in counter-clockwise order
 */
export function convexHull(points: readonly Point[]): Point[] {
  const sorted: Point[] = points
    .map((p): Point => [p[0], p[1]])
    .sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));

  const n = sorted.length;
  if (n < 3) return sorted;

  const lower: Point[] = [];
  for (let i = 0; i < n; i++) {
    const p = sorted[i];
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: Point[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const p = sorted[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  // Drop the last point of each chain because it is the first point of the
  // other, avoiding duplicate endpoints.
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
