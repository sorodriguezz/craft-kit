import { Graph } from "../../structures/graph";

/**
 * Computes the maximum flow from `source` to `sink` in a directed graph using
 * the Edmonds-Karp algorithm (BFS augmenting paths on the residual network).
 * Edge weights are interpreted as capacities. Parallel forward and reverse
 * capacities are accumulated into a single residual matrix.
 *
 * The input graph is not mutated; a private residual capacity map is built from
 * its edges.
 * @typeParam T node identifier type
 * @param graph directed graph whose edge weights are capacities
 * @param source node where flow originates
 * @param sink node where flow is collected
 * @returns the value of the maximum flow (0 if `source === sink` or either node
 * is absent)
 */
export function maxFlow<T>(graph: Graph<T>, source: T, sink: T): number {
  if (!graph.hasNode(source) || !graph.hasNode(sink)) return 0;
  if (source === sink) return 0;

  // Residual capacity: residual[u].get(v) is the remaining capacity u -> v.
  const residual = new Map<T, Map<T, number>>();
  const ensure = (node: T): Map<T, number> => {
    let row = residual.get(node);
    if (row === undefined) {
      row = new Map<T, number>();
      residual.set(node, row);
    }
    return row;
  };

  for (const node of graph.nodes()) ensure(node);
  for (const { from, to, weight } of graph.edges()) {
    const row = ensure(from);
    // Accumulate capacity so multiple edges between the same pair combine.
    row.set(to, (row.get(to) ?? 0) + weight);
    // Ensure a reverse residual slot exists (starts at 0 unless a reverse edge
    // already contributed capacity).
    const reverseRow = ensure(to);
    if (!reverseRow.has(from)) reverseRow.set(from, 0);
  }

  let totalFlow = 0;

  for (;;) {
    // BFS to find a shortest augmenting path in the residual network.
    const parent = new Map<T, T>();
    const visited = new Set<T>([source]);
    const queue: T[] = [source];
    let head = 0;
    let reachedSink = false;

    while (head < queue.length) {
      const node = queue[head++];
      if (node === sink) {
        reachedSink = true;
        break;
      }
      const row = residual.get(node);
      if (row === undefined) continue;
      for (const [next, capacity] of row) {
        if (capacity > 0 && !visited.has(next)) {
          visited.add(next);
          parent.set(next, node);
          queue.push(next);
        }
      }
    }

    if (!reachedSink) break;

    // Find the bottleneck capacity along the augmenting path.
    let bottleneck = Number.POSITIVE_INFINITY;
    let current: T = sink;
    while (current !== source) {
      const prev = parent.get(current);
      if (prev === undefined) break;
      const capacity = residual.get(prev)?.get(current) ?? 0;
      if (capacity < bottleneck) bottleneck = capacity;
      current = prev;
    }

    if (!Number.isFinite(bottleneck) || bottleneck <= 0) break;

    // Augment flow: decrease forward residuals, increase reverse residuals.
    current = sink;
    while (current !== source) {
      const prev = parent.get(current);
      if (prev === undefined) break;
      const forwardRow = ensure(prev);
      forwardRow.set(current, (forwardRow.get(current) ?? 0) - bottleneck);
      const backwardRow = ensure(current);
      backwardRow.set(prev, (backwardRow.get(prev) ?? 0) + bottleneck);
      current = prev;
    }

    totalFlow += bottleneck;
  }

  return totalFlow;
}
