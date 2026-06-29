import { Graph } from "../../structures/graph";

/**
 * Depth-first traversal from `start`, returning nodes in preorder. The
 * implementation is iterative to avoid recursion depth limits, while still
 * matching the visitation order of a recursive preorder walk.
 * @typeParam T node identifier type
 * @param graph graph to traverse
 * @param start node to start from
 * @returns nodes in preorder visitation order (empty if `start` is absent)
 */
export function dfs<T>(graph: Graph<T>, start: T): T[] {
  if (!graph.hasNode(start)) return [];
  const visited = new Set<T>();
  const order: T[] = [];
  const stack: T[] = [start];

  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined || visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    // Push neighbors in reverse so the first neighbor is processed first.
    const neighbors = graph.neighbors(node);
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const next = neighbors[i].node;
      if (!visited.has(next)) stack.push(next);
    }
  }
  return order;
}
