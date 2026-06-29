import { Graph } from "../../structures/graph";

/**
 * Computes single-source shortest paths from `start` using the Bellman-Ford
 * algorithm. Unlike Dijkstra's algorithm, negative edge weights are supported.
 * Distances to unreachable nodes are `Infinity` with a `null` predecessor.
 *
 * The algorithm performs `|V| - 1` rounds of edge relaxation; one additional
 * round is then used to detect a negative-weight cycle reachable from `start`.
 * When such a cycle exists the returned distances are not guaranteed to be the
 * true shortest paths, and `hasNegativeCycle` is set to `true`.
 * @typeParam T node identifier type
 * @param graph graph to search (may contain negative edge weights)
 * @param start source node
 * @returns shortest distances, predecessor pointers and a negative-cycle flag
 */
export function bellmanFord<T>(
  graph: Graph<T>,
  start: T
): {
  distances: Map<T, number>;
  previous: Map<T, T | null>;
  hasNegativeCycle: boolean;
} {
  const distances = new Map<T, number>();
  const previous = new Map<T, T | null>();

  for (const node of graph.nodes()) {
    distances.set(node, Infinity);
    previous.set(node, null);
  }

  if (!graph.hasNode(start)) {
    return { distances, previous, hasNegativeCycle: false };
  }
  distances.set(start, 0);

  const nodes = graph.nodes();
  // Pre-collect directed edges (undirected edges relax in both directions).
  const edges: Array<{ from: T; to: T; weight: number }> = [];
  for (const from of nodes) {
    for (const { node: to, weight } of graph.neighbors(from)) {
      edges.push({ from, to, weight });
    }
  }

  // Relax every edge |V| - 1 times.
  for (let i = 0; i < nodes.length - 1; i++) {
    let changed = false;
    for (const { from, to, weight } of edges) {
      const distFrom = distances.get(from);
      if (distFrom === undefined || distFrom === Infinity) continue;
      const candidate = distFrom + weight;
      const distTo = distances.get(to);
      if (distTo === undefined || candidate < distTo) {
        distances.set(to, candidate);
        previous.set(to, from);
        changed = true;
      }
    }
    // Early exit once no distance improves.
    if (!changed) break;
  }

  // A further relaxation that still improves a distance proves a negative cycle.
  let hasNegativeCycle = false;
  for (const { from, to, weight } of edges) {
    const distFrom = distances.get(from);
    if (distFrom === undefined || distFrom === Infinity) continue;
    const distTo = distances.get(to);
    if (distTo === undefined || distFrom + weight < distTo) {
      hasNegativeCycle = true;
      break;
    }
  }

  return { distances, previous, hasNegativeCycle };
}
