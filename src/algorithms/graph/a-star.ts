import { Graph } from "../../structures/graph";
import { PriorityQueue } from "../../structures/priority-queue";
import { type Comparator } from "../../common/comparator";

/** A frontier entry pairing a node with its estimated total cost `f = g + h`. */
interface Entry<T> {
  node: T;
  /** Estimated total cost of the cheapest path through this node. */
  f: number;
}

/**
 * Finds the lowest-cost path between `start` and `goal` using the A* search
 * algorithm. The search is guided by `heuristic`, which must be admissible
 * (never overestimating the true remaining cost) for the result to be optimal.
 * Edge weights must be non-negative.
 * @typeParam T node identifier type
 * @param graph graph to search (weights must be non-negative)
 * @param start source node
 * @param goal target node
 * @param heuristic estimated remaining cost from a node to the goal
 * @returns the path and its total cost, or `null` if the goal is unreachable
 */
export function aStar<T>(
  graph: Graph<T>,
  start: T,
  goal: T,
  heuristic: (node: T, goal: T) => number
): { path: T[]; cost: number } | null {
  if (!graph.hasNode(start) || !graph.hasNode(goal)) return null;

  // gScore: best known cost from start to each node.
  const gScore = new Map<T, number>();
  const cameFrom = new Map<T, T>();
  gScore.set(start, 0);

  if (start === goal) {
    return { path: [start], cost: 0 };
  }

  const byF: Comparator<Entry<T>> = (a, b) => a.f - b.f;
  const frontier = new PriorityQueue<Entry<T>>(byF);
  frontier.enqueue({ node: start, f: heuristic(start, goal) });

  while (!frontier.isEmpty()) {
    const current = frontier.dequeue();
    if (current === undefined) break;

    const currentG = gScore.get(current.node);
    if (currentG === undefined) continue;
    // Skip stale frontier entries superseded by a cheaper path.
    if (current.f > currentG + heuristic(current.node, goal)) continue;

    if (current.node === goal) {
      return reconstruct(cameFrom, current.node, currentG);
    }

    for (const { node: next, weight } of graph.neighbors(current.node)) {
      const tentativeG = currentG + weight;
      const knownG = gScore.get(next);
      if (knownG === undefined || tentativeG < knownG) {
        cameFrom.set(next, current.node);
        gScore.set(next, tentativeG);
        frontier.enqueue({ node: next, f: tentativeG + heuristic(next, goal) });
      }
    }
  }

  return null;
}

/** Rebuilds the path from the predecessor map and reports its total cost. */
function reconstruct<T>(
  cameFrom: Map<T, T>,
  goal: T,
  cost: number
): { path: T[]; cost: number } {
  const path: T[] = [goal];
  let current: T | undefined = goal;
  while (current !== undefined) {
    const prev = cameFrom.get(current);
    if (prev === undefined) break;
    path.push(prev);
    current = prev;
  }
  path.reverse();
  return { path, cost };
}
