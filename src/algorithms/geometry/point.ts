/**
 * A point in the 2D plane represented as a `[x, y]` tuple.
 */
export type Point = [number, number];

/**
 * Computes the Euclidean distance between two points.
 * @param a first point
 * @param b second point
 * @returns the straight-line distance between `a` and `b`
 */
export function distance(a: Point, b: Point): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}
