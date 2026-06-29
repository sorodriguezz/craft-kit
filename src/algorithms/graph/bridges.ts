import { Graph } from "../../structures/graph";

/**
 * Finds all bridges of an undirected graph. A bridge is an edge whose removal
 * increases the number of connected components. Uses an iterative DFS computing
 * discovery times and low-link values (Tarjan's bridge-finding algorithm).
 *
 * Parallel edges are not modeled by the underlying graph, so a node connected
 * to its parent by a single edge treats that edge as the tree edge.
 * @typeParam T node identifier type
 * @param graph undirected graph to analyze
 * @returns array of bridges as `[from, to]` tuples
 */
export function bridges<T>(graph: Graph<T>): Array<[T, T]> {
  const disc = new Map<T, number>();
  const low = new Map<T, number>();
  const result: Array<[T, T]> = [];
  let timer = 0;

  interface Frame {
    node: T;
    parent: T | undefined;
    neighbors: T[];
    next: number;
  }

  for (const start of graph.nodes()) {
    if (disc.has(start)) continue;

    disc.set(start, timer);
    low.set(start, timer);
    timer++;
    const callStack: Frame[] = [
      {
        node: start,
        parent: undefined,
        neighbors: graph.neighbors(start).map((e) => e.node),
        next: 0,
      },
    ];

    while (callStack.length > 0) {
      const frame = callStack[callStack.length - 1];
      if (frame.next < frame.neighbors.length) {
        const child = frame.neighbors[frame.next];
        frame.next++;
        if (child === frame.parent) {
          // Skip the single edge back to the immediate parent.
          continue;
        }
        if (!disc.has(child)) {
          disc.set(child, timer);
          low.set(child, timer);
          timer++;
          callStack.push({
            node: child,
            parent: frame.node,
            neighbors: graph.neighbors(child).map((e) => e.node),
            next: 0,
          });
        } else {
          // Already visited: relax low-link using its discovery time.
          const current = low.get(frame.node) ?? 0;
          const childDisc = disc.get(child) ?? 0;
          low.set(frame.node, Math.min(current, childDisc));
        }
      } else {
        callStack.pop();
        const parentFrame = callStack[callStack.length - 1];
        if (parentFrame !== undefined) {
          const parentLow = low.get(parentFrame.node) ?? 0;
          const childLow = low.get(frame.node) ?? 0;
          low.set(parentFrame.node, Math.min(parentLow, childLow));
          // Bridge condition: the child's subtree cannot reach the parent.
          if (childLow > (disc.get(parentFrame.node) ?? 0)) {
            result.push([parentFrame.node, frame.node]);
          }
        }
      }
    }
  }

  return result;
}

/**
 * Finds all articulation points (cut vertices) of an undirected graph. An
 * articulation point is a node whose removal increases the number of connected
 * components. Uses an iterative DFS with discovery/low-link values; the number
 * of DFS-tree children of each root is tracked to apply the root rule.
 * @typeParam T node identifier type
 * @param graph undirected graph to analyze
 * @returns array of articulation point nodes (each reported once)
 */
export function articulationPoints<T>(graph: Graph<T>): T[] {
  const disc = new Map<T, number>();
  const low = new Map<T, number>();
  const isArticulation = new Set<T>();
  let timer = 0;

  interface Frame {
    node: T;
    parent: T | undefined;
    neighbors: T[];
    next: number;
    children: number;
  }

  for (const start of graph.nodes()) {
    if (disc.has(start)) continue;

    disc.set(start, timer);
    low.set(start, timer);
    timer++;
    const root = start;
    let rootChildren = 0;
    const callStack: Frame[] = [
      {
        node: start,
        parent: undefined,
        neighbors: graph.neighbors(start).map((e) => e.node),
        next: 0,
        children: 0,
      },
    ];

    while (callStack.length > 0) {
      const frame = callStack[callStack.length - 1];
      if (frame.next < frame.neighbors.length) {
        const child = frame.neighbors[frame.next];
        frame.next++;
        if (child === frame.parent) {
          continue;
        }
        if (!disc.has(child)) {
          frame.children++;
          if (frame.node === root) rootChildren++;
          disc.set(child, timer);
          low.set(child, timer);
          timer++;
          callStack.push({
            node: child,
            parent: frame.node,
            neighbors: graph.neighbors(child).map((e) => e.node),
            next: 0,
            children: 0,
          });
        } else {
          const current = low.get(frame.node) ?? 0;
          const childDisc = disc.get(child) ?? 0;
          low.set(frame.node, Math.min(current, childDisc));
        }
      } else {
        callStack.pop();
        const parentFrame = callStack[callStack.length - 1];
        if (parentFrame !== undefined) {
          const parentLow = low.get(parentFrame.node) ?? 0;
          const childLow = low.get(frame.node) ?? 0;
          low.set(parentFrame.node, Math.min(parentLow, childLow));
          // Non-root rule: a non-root node is an articulation point when one of
          // its children cannot reach above it.
          if (
            parentFrame.node !== root &&
            childLow >= (disc.get(parentFrame.node) ?? 0)
          ) {
            isArticulation.add(parentFrame.node);
          }
        }
      }
    }

    // Root rule: the root is an articulation point iff it has > 1 DFS child.
    if (rootChildren > 1) {
      isArticulation.add(root);
    }
  }

  return [...isArticulation];
}
