import { Graph } from "../../structures/graph";

/** Result of {@link floydWarshall}: pairwise distances and path successors. */
export interface FloydWarshallResult<T> {
  /** `distances.get(u)?.get(v)` is the shortest distance from `u` to `v`. */
  distances: Map<T, Map<T, number>>;
  /** `next.get(u)?.get(v)` is the first hop on a shortest path from `u` to `v`. */
  next: Map<T, Map<T, T | null>>;
}

/**
 * Computes all-pairs shortest paths using the Floyd-Warshall algorithm in
 * `O(V^3)` time. Negative edge weights are supported; behaviour is undefined in
 * the presence of a negative-weight cycle. The distance from a node to itself
 * is `0`, and unreachable pairs have distance `Infinity` with a `null`
 * successor.
 * @typeParam T node identifier type
 * @param graph graph to analyse (may contain negative edge weights)
 * @returns pairwise distance and successor maps for path reconstruction
 */
export function floydWarshall<T>(graph: Graph<T>): FloydWarshallResult<T> {
  const nodes = graph.nodes();
  const distances = new Map<T, Map<T, number>>();
  const next = new Map<T, Map<T, T | null>>();

  // Initialise: 0 on the diagonal, Infinity elsewhere.
  for (const u of nodes) {
    const distRow = new Map<T, number>();
    const nextRow = new Map<T, T | null>();
    for (const v of nodes) {
      distRow.set(v, u === v ? 0 : Infinity);
      nextRow.set(v, u === v ? v : null);
    }
    distances.set(u, distRow);
    next.set(u, nextRow);
  }

  // Seed with direct edge weights (keep the lightest parallel edge).
  for (const u of nodes) {
    const distRow = distances.get(u);
    const nextRow = next.get(u);
    if (distRow === undefined || nextRow === undefined) continue;
    for (const { node: v, weight } of graph.neighbors(u)) {
      const existing = distRow.get(v);
      if (existing === undefined || weight < existing) {
        distRow.set(v, weight);
        nextRow.set(v, v);
      }
    }
  }

  // Core relaxation over every intermediate node k.
  for (const k of nodes) {
    const distK = distances.get(k);
    if (distK === undefined) continue;
    for (const i of nodes) {
      const distI = distances.get(i);
      const nextI = next.get(i);
      if (distI === undefined || nextI === undefined) continue;
      const distIK = distI.get(k);
      if (distIK === undefined || distIK === Infinity) continue;
      for (const j of nodes) {
        const distKJ = distK.get(j);
        if (distKJ === undefined || distKJ === Infinity) continue;
        const candidate = distIK + distKJ;
        const distIJ = distI.get(j);
        if (distIJ === undefined || candidate < distIJ) {
          distI.set(j, candidate);
          nextI.set(j, nextI.get(k) ?? null);
        }
      }
    }
  }

  return { distances, next };
}

/**
 * Reconstructs a shortest path between two nodes from a {@link floydWarshall}
 * result.
 * @typeParam T node identifier type
 * @param result output produced by {@link floydWarshall}
 * @param from source node
 * @param to target node
 * @returns the ordered list of nodes on a shortest path, or `null` if `to` is
 * unreachable from `from` (or either node is unknown)
 */
export function floydWarshallPath<T>(
  result: FloydWarshallResult<T>,
  from: T,
  to: T
): T[] | null {
  const nextRow = result.next.get(from);
  if (nextRow === undefined) return null;
  if (nextRow.get(to) === null || nextRow.get(to) === undefined) {
    // No path unless the endpoints coincide and the node exists.
    return from === to && result.distances.get(from)?.has(to) ? [from] : null;
  }

  const path: T[] = [from];
  let current: T = from;
  while (current !== to) {
    const step = result.next.get(current)?.get(to);
    if (step === null || step === undefined) return null;
    current = step;
    path.push(current);
  }
  return path;
}
