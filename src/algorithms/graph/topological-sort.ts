import { Graph } from "../../structures/graph";

/**
 * Produces a topological ordering of a directed graph using Kahn's algorithm.
 * The graph is assumed to be directed; if it contains a cycle no valid ordering
 * exists and `null` is returned.
 * @typeParam T node identifier type
 * @param graph directed graph to order
 * @returns a topological ordering of all nodes, or `null` if a cycle is present
 */
export function topologicalSort<T>(graph: Graph<T>): T[] | null {
  const inDegree = new Map<T, number>();
  const nodes = graph.nodes();

  for (const node of nodes) {
    inDegree.set(node, 0);
  }
  for (const node of nodes) {
    for (const { node: next } of graph.neighbors(node)) {
      inDegree.set(next, (inDegree.get(next) ?? 0) + 1);
    }
  }

  const queue: T[] = [];
  for (const node of nodes) {
    if ((inDegree.get(node) ?? 0) === 0) queue.push(node);
  }

  const order: T[] = [];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    order.push(node);
    for (const { node: next } of graph.neighbors(node)) {
      const updated = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, updated);
      if (updated === 0) queue.push(next);
    }
  }

  // A cycle exists if some nodes never reached in-degree zero.
  return order.length === nodes.length ? order : null;
}
