/**
 * Adjacency-list graph supporting both directed and undirected variants with
 * weighted edges. Nodes are stored as keys of a `Map`, so any value usable as a
 * `Map` key is a valid node identifier.
 * @typeParam T node identifier type
 */
export class Graph<T = string> {
  private readonly adjacency = new Map<T, Map<T, number>>();
  private readonly directed: boolean;

  /**
   * Creates an empty graph.
   * @param directed when `true`, edges are one-way; otherwise each edge is
   * mirrored automatically. Defaults to `false`.
   */
  constructor(directed = false) {
    this.directed = directed;
  }

  /**
   * Adds a node to the graph. No-op if the node already exists.
   * @param node node identifier to add
   * @returns this graph for chaining
   */
  addNode(node: T): this {
    if (!this.adjacency.has(node)) {
      this.adjacency.set(node, new Map<T, number>());
    }
    return this;
  }

  /**
   * Adds an edge between two nodes, creating any missing endpoints. For
   * undirected graphs the reverse edge is added as well.
   * @param from source node
   * @param to destination node
   * @param weight edge weight, defaults to `1`
   * @returns this graph for chaining
   */
  addEdge(from: T, to: T, weight = 1): this {
    this.addNode(from);
    this.addNode(to);
    const fromEdges = this.adjacency.get(from);
    if (fromEdges) fromEdges.set(to, weight);
    if (!this.directed) {
      const toEdges = this.adjacency.get(to);
      if (toEdges) toEdges.set(from, weight);
    }
    return this;
  }

  /**
   * Removes a node and every edge incident to it.
   * @param node node identifier to remove
   * @returns `true` if the node existed and was removed
   */
  removeNode(node: T): boolean {
    if (!this.adjacency.has(node)) return false;
    this.adjacency.delete(node);
    for (const edges of this.adjacency.values()) {
      edges.delete(node);
    }
    return true;
  }

  /**
   * Removes the edge from `from` to `to` (and its mirror when undirected).
   * @param from source node
   * @param to destination node
   * @returns `true` if at least one edge was removed
   */
  removeEdge(from: T, to: T): boolean {
    const fromEdges = this.adjacency.get(from);
    let removed = false;
    if (fromEdges && fromEdges.delete(to)) removed = true;
    if (!this.directed) {
      const toEdges = this.adjacency.get(to);
      if (toEdges && toEdges.delete(from)) removed = true;
    }
    return removed;
  }

  /**
   * Checks whether a node exists.
   * @param node node identifier to test
   * @returns `true` if the node is present
   */
  hasNode(node: T): boolean {
    return this.adjacency.has(node);
  }

  /**
   * Checks whether an edge from `from` to `to` exists.
   * @param from source node
   * @param to destination node
   * @returns `true` if the edge is present
   */
  hasEdge(from: T, to: T): boolean {
    const fromEdges = this.adjacency.get(from);
    return fromEdges !== undefined && fromEdges.has(to);
  }

  /**
   * Returns the outgoing neighbors of a node together with edge weights.
   * @param node node whose neighbors are requested
   * @returns array of `{ node, weight }` (empty if the node is absent)
   */
  neighbors(node: T): Array<{ node: T; weight: number }> {
    const edges = this.adjacency.get(node);
    if (!edges) return [];
    const result: Array<{ node: T; weight: number }> = [];
    for (const [to, weight] of edges) {
      result.push({ node: to, weight });
    }
    return result;
  }

  /**
   * Lists all node identifiers in the graph.
   * @returns array of nodes in insertion order
   */
  nodes(): T[] {
    return [...this.adjacency.keys()];
  }

  /**
   * Lists all edges. For undirected graphs each undirected edge is reported
   * once (the second occurrence of a mirrored pair is skipped).
   * @returns array of `{ from, to, weight }`
   */
  edges(): Array<{ from: T; to: T; weight: number }> {
    const result: Array<{ from: T; to: T; weight: number }> = [];
    const seen = new Set<string>();
    let index = 0;
    const indexOf = new Map<T, number>();
    for (const node of this.adjacency.keys()) {
      indexOf.set(node, index++);
    }
    for (const [from, edges] of this.adjacency) {
      for (const [to, weight] of edges) {
        if (!this.directed) {
          const a = indexOf.get(from);
          const b = indexOf.get(to);
          const lo = a !== undefined && b !== undefined ? Math.min(a, b) : 0;
          const hi = a !== undefined && b !== undefined ? Math.max(a, b) : 0;
          const key = `${lo}|${hi}`;
          if (seen.has(key)) continue;
          seen.add(key);
        }
        result.push({ from, to, weight });
      }
    }
    return result;
  }

  /** Number of nodes in the graph. */
  get size(): number {
    return this.adjacency.size;
  }

  /**
   * Reports whether this graph is directed.
   * @returns `true` for directed graphs
   */
  isDirected(): boolean {
    return this.directed;
  }
}
