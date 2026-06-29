import { Graph } from "../../structures/graph";

/**
 * Computes the connected components of an undirected graph. Each component is
 * returned as an array of nodes, with components ordered by the first time each
 * representative node is encountered.
 * @typeParam T node identifier type
 * @param graph undirected graph to analyze
 * @returns array of components, each an array of node identifiers
 */
export function connectedComponents<T>(graph: Graph<T>): T[][] {
  const visited = new Set<T>();
  const components: T[][] = [];

  for (const start of graph.nodes()) {
    if (visited.has(start)) continue;

    const component: T[] = [];
    const stack: T[] = [start];
    visited.add(start);

    while (stack.length > 0) {
      const node = stack.pop();
      if (node === undefined) continue;
      component.push(node);
      for (const { node: next } of graph.neighbors(node)) {
        if (!visited.has(next)) {
          visited.add(next);
          stack.push(next);
        }
      }
    }

    components.push(component);
  }

  return components;
}
