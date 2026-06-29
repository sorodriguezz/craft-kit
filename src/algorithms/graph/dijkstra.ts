import { Graph } from "../../structures/graph";
import { PriorityQueue } from "../../structures/priority-queue";
import { type Comparator } from "../../common/comparator";

/** A queue entry pairing a node with its tentative distance from the source. */
interface Entry<T> {
  node: T;
  dist: number;
}

/**
 * Computes single-source shortest paths from `start` using Dijkstra's
 * algorithm. Edge weights must be non-negative. Distances to unreachable nodes
 * are `Infinity`, and their `previous` entry is `null`.
 * @typeParam T node identifier type
 * @param graph graph to search (weights must be non-negative)
 * @param start source node
 * @returns maps of shortest distances and predecessor pointers per node
 */
export function dijkstra<T>(
  graph: Graph<T>,
  start: T
): { distances: Map<T, number>; previous: Map<T, T | null> } {
  const distances = new Map<T, number>();
  const previous = new Map<T, T | null>();

  for (const node of graph.nodes()) {
    distances.set(node, Infinity);
    previous.set(node, null);
  }

  if (!graph.hasNode(start)) {
    return { distances, previous };
  }
  distances.set(start, 0);

  const byDistance: Comparator<Entry<T>> = (a, b) => a.dist - b.dist;
  const queue = new PriorityQueue<Entry<T>>(byDistance);
  queue.enqueue({ node: start, dist: 0 });

  while (!queue.isEmpty()) {
    const current = queue.dequeue();
    if (current === undefined) break;
    const knownDist = distances.get(current.node);
    // Skip stale entries left over from earlier relaxations.
    if (knownDist === undefined || current.dist > knownDist) continue;

    for (const { node: next, weight } of graph.neighbors(current.node)) {
      const candidate = current.dist + weight;
      const existing = distances.get(next);
      if (existing === undefined || candidate < existing) {
        distances.set(next, candidate);
        previous.set(next, current.node);
        queue.enqueue({ node: next, dist: candidate });
      }
    }
  }

  return { distances, previous };
}

/**
 * Finds the lowest-cost path between `start` and `end` using Dijkstra's
 * algorithm.
 * @typeParam T node identifier type
 * @param graph graph to search (weights must be non-negative)
 * @param start source node
 * @param end target node
 * @returns the path and its total distance, or `null` if unreachable
 */
export function shortestPath<T>(
  graph: Graph<T>,
  start: T,
  end: T
): { path: T[]; distance: number } | null {
  if (!graph.hasNode(start) || !graph.hasNode(end)) return null;

  const { distances, previous } = dijkstra(graph, start);
  const distance = distances.get(end);
  if (distance === undefined || distance === Infinity) return null;

  const path: T[] = [];
  let current: T | null | undefined = end;
  while (current !== null && current !== undefined) {
    path.push(current);
    if (current === start) break;
    current = previous.get(current);
  }

  if (path.length === 0 || path[path.length - 1] !== start) return null;
  path.reverse();
  return { path, distance };
}
