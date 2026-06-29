import { Graph } from "../../structures/graph";
import { UnionFind } from "../../structures/union-find";
import { PriorityQueue } from "../../structures/priority-queue";
import { type Comparator } from "../../common/comparator";

/** An edge of a minimum spanning tree. */
interface MstEdge<T> {
  from: T;
  to: T;
  weight: number;
}

/**
 * Builds a minimum spanning tree (or forest) of an undirected graph using
 * Kruskal's algorithm backed by a union-find. For a connected graph the result
 * spans every node; for a disconnected graph it yields a spanning forest.
 * @typeParam T node identifier type
 * @param graph undirected graph
 * @returns the selected MST edges
 */
export function kruskalMST<T>(graph: Graph<T>): Array<MstEdge<T>> {
  const edges = graph.edges();
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);

  const unionFind = new UnionFind<T>(graph.nodes());
  const result: Array<MstEdge<T>> = [];

  for (const edge of sorted) {
    if (unionFind.union(edge.from, edge.to)) {
      result.push({ from: edge.from, to: edge.to, weight: edge.weight });
    }
  }

  return result;
}

/**
 * Builds a minimum spanning tree of an undirected connected graph using Prim's
 * algorithm with a priority queue. If `start` is omitted the first node of the
 * graph is used. Only the component reachable from `start` is spanned.
 * @typeParam T node identifier type
 * @param graph undirected graph
 * @param start optional node to grow the tree from
 * @returns the selected MST edges
 */
export function primMST<T>(graph: Graph<T>, start?: T): Array<MstEdge<T>> {
  const nodes = graph.nodes();
  if (nodes.length === 0) return [];

  const source = start !== undefined ? start : nodes[0];
  if (!graph.hasNode(source)) return [];

  const inTree = new Set<T>([source]);
  const result: Array<MstEdge<T>> = [];

  const byWeight: Comparator<MstEdge<T>> = (a, b) => a.weight - b.weight;
  const queue = new PriorityQueue<MstEdge<T>>(byWeight);
  for (const { node, weight } of graph.neighbors(source)) {
    queue.enqueue({ from: source, to: node, weight });
  }

  while (!queue.isEmpty() && inTree.size < nodes.length) {
    const edge = queue.dequeue();
    if (edge === undefined) break;
    if (inTree.has(edge.to)) continue;

    inTree.add(edge.to);
    result.push({ from: edge.from, to: edge.to, weight: edge.weight });

    for (const { node, weight } of graph.neighbors(edge.to)) {
      if (!inTree.has(node)) {
        queue.enqueue({ from: edge.to, to: node, weight });
      }
    }
  }

  return result;
}
