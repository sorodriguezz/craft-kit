import { Graph } from "../../structures/graph";

/**
 * Computes a two-coloring of the graph via BFS. Returns a map from each node to
 * its color (0 or 1), or `null` if an odd cycle is detected (not bipartite).
 * Each connected component is colored independently.
 */
function twoColor<T>(graph: Graph<T>): Map<T, 0 | 1> | null {
  const color = new Map<T, 0 | 1>();

  for (const start of graph.nodes()) {
    if (color.has(start)) continue;
    color.set(start, 0);
    const queue: T[] = [start];
    let head = 0;
    while (head < queue.length) {
      const node = queue[head++];
      const nodeColor = color.get(node) ?? 0;
      const nextColor: 0 | 1 = nodeColor === 0 ? 1 : 0;
      for (const { node: neighbor } of graph.neighbors(node)) {
        const existing = color.get(neighbor);
        if (existing === undefined) {
          color.set(neighbor, nextColor);
          queue.push(neighbor);
        } else if (existing === nodeColor) {
          // Adjacent nodes share a color: an odd cycle exists.
          return null;
        }
      }
    }
  }

  return color;
}

/**
 * Determines whether an undirected graph is bipartite, i.e. its nodes can be
 * split into two sets so that every edge connects nodes from different sets.
 * Implemented with BFS two-coloring over each connected component.
 * @typeParam T node identifier type
 * @param graph undirected graph to test
 * @returns `true` if the graph is bipartite
 */
export function isBipartite<T>(graph: Graph<T>): boolean {
  return twoColor(graph) !== null;
}

/**
 * Partitions a bipartite graph into its two independent sets. Returns the pair
 * of sets, or `null` if the graph is not bipartite. Isolated nodes are placed in
 * the first set.
 * @typeParam T node identifier type
 * @param graph undirected graph to partition
 * @returns a tuple `[setA, setB]` of node arrays, or `null` if not bipartite
 */
export function bipartitePartition<T>(graph: Graph<T>): [T[], T[]] | null {
  const color = twoColor(graph);
  if (color === null) return null;

  const setA: T[] = [];
  const setB: T[] = [];
  // Iterate over the graph's node order for deterministic output.
  for (const node of graph.nodes()) {
    if ((color.get(node) ?? 0) === 0) setA.push(node);
    else setB.push(node);
  }
  return [setA, setB];
}
