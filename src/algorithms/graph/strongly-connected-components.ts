import { Graph } from "../../structures/graph";

/**
 * Computes the strongly connected components (SCCs) of a directed graph using
 * Tarjan's low-link algorithm. Each component is a maximal set of mutually
 * reachable nodes. The traversal is iterative to avoid recursion depth limits.
 *
 * Components are emitted as they are finalized, which yields them in reverse
 * topological order of the condensation graph.
 * @typeParam T node identifier type
 * @param graph directed graph to analyze
 * @returns array of strongly connected components, each an array of nodes
 */
export function stronglyConnectedComponents<T>(graph: Graph<T>): T[][] {
  const indexOf = new Map<T, number>();
  const lowLink = new Map<T, number>();
  const onStack = new Set<T>();
  const stack: T[] = [];
  const components: T[][] = [];
  let nextIndex = 0;

  // Each frame tracks a node and the position of the next neighbor to explore.
  interface Frame {
    node: T;
    neighbors: T[];
    next: number;
  }

  for (const start of graph.nodes()) {
    if (indexOf.has(start)) continue;

    const callStack: Frame[] = [
      {
        node: start,
        neighbors: graph.neighbors(start).map((e) => e.node),
        next: 0,
      },
    ];
    indexOf.set(start, nextIndex);
    lowLink.set(start, nextIndex);
    nextIndex++;
    stack.push(start);
    onStack.add(start);

    while (callStack.length > 0) {
      const frame = callStack[callStack.length - 1];
      if (frame.next < frame.neighbors.length) {
        const child = frame.neighbors[frame.next];
        frame.next++;
        if (!indexOf.has(child)) {
          // Tree edge: descend into the child.
          indexOf.set(child, nextIndex);
          lowLink.set(child, nextIndex);
          nextIndex++;
          stack.push(child);
          onStack.add(child);
          callStack.push({
            node: child,
            neighbors: graph.neighbors(child).map((e) => e.node),
            next: 0,
          });
        } else if (onStack.has(child)) {
          // Back/cross edge to a node on the stack: relax the low-link.
          const current = lowLink.get(frame.node) ?? 0;
          const childIndex = indexOf.get(child) ?? 0;
          lowLink.set(frame.node, Math.min(current, childIndex));
        }
      } else {
        // All neighbors processed: if this node is a root, pop its component.
        if ((lowLink.get(frame.node) ?? 0) === (indexOf.get(frame.node) ?? 0)) {
          const component: T[] = [];
          for (;;) {
            const popped = stack.pop();
            if (popped === undefined) break;
            onStack.delete(popped);
            component.push(popped);
            if (popped === frame.node) break;
          }
          components.push(component);
        }
        callStack.pop();
        // Propagate the low-link up to the parent frame.
        const parent = callStack[callStack.length - 1];
        if (parent !== undefined) {
          const parentLow = lowLink.get(parent.node) ?? 0;
          const childLow = lowLink.get(frame.node) ?? 0;
          lowLink.set(parent.node, Math.min(parentLow, childLow));
        }
      }
    }
  }

  return components;
}
