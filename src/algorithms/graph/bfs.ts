import { Graph } from "../../structures/graph";

/**
 * Breadth-first traversal from `start`, returning nodes in the order they are
 * first visited. Unreachable nodes are not included.
 * @typeParam T node identifier type
 * @param graph graph to traverse
 * @param start node to start from
 * @returns nodes in visitation order (empty if `start` is absent)
 */
export function bfs<T>(graph: Graph<T>, start: T): T[] {
  if (!graph.hasNode(start)) return [];
  const visited = new Set<T>([start]);
  const order: T[] = [];
  const queue: T[] = [start];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    order.push(node);
    for (const { node: next } of graph.neighbors(node)) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return order;
}

/**
 * Finds a shortest path (fewest edges) between `start` and `end` using BFS,
 * ignoring edge weights.
 * @typeParam T node identifier type
 * @param graph graph to search
 * @param start source node
 * @param end target node
 * @returns the path from `start` to `end` inclusive, or `null` if unreachable
 */
export function bfsShortestPath<T>(
  graph: Graph<T>,
  start: T,
  end: T
): T[] | null {
  if (!graph.hasNode(start) || !graph.hasNode(end)) return null;
  if (start === end) return [start];

  const previous = new Map<T, T>();
  const visited = new Set<T>([start]);
  const queue: T[] = [start];
  let head = 0;

  while (head < queue.length) {
    const node = queue[head++];
    if (node === end) break;
    for (const { node: next } of graph.neighbors(node)) {
      if (!visited.has(next)) {
        visited.add(next);
        previous.set(next, node);
        queue.push(next);
      }
    }
  }

  if (!visited.has(end)) return null;

  const path: T[] = [];
  let current: T | undefined = end;
  while (current !== undefined) {
    path.push(current);
    if (current === start) break;
    current = previous.get(current);
  }
  path.reverse();
  return path;
}
