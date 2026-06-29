/**
 * Disjoint-set (union-find) structure with path compression and union by rank,
 * giving near-constant amortized time per operation.
 * @typeParam T element type
 */
export class UnionFind<T = number> {
  private readonly parent = new Map<T, T>();
  private readonly rank = new Map<T, number>();
  private setCount = 0;

  /**
   * Creates a union-find, optionally seeding it with initial singleton sets.
   * @param initial optional iterable of elements to register up front
   */
  constructor(initial?: Iterable<T>) {
    if (initial) {
      for (const value of initial) this.makeSet(value);
    }
  }

  /**
   * Registers `x` as a new singleton set. No-op if already present.
   * @param x element to register
   */
  makeSet(x: T): void {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
      this.setCount++;
    }
  }

  /**
   * Finds the representative (root) of the set containing `x`, applying path
   * compression. Unknown elements are registered as their own set first.
   * @param x element to look up
   * @returns the set representative
   */
  find(x: T): T {
    if (!this.parent.has(x)) {
      this.makeSet(x);
      return x;
    }
    let root = x;
    let next = this.parent.get(root);
    while (next !== undefined && next !== root) {
      root = next;
      next = this.parent.get(root);
    }
    // Path compression: point every node on the path directly at the root.
    let current = x;
    let parentOfCurrent = this.parent.get(current);
    while (parentOfCurrent !== undefined && parentOfCurrent !== root) {
      this.parent.set(current, root);
      current = parentOfCurrent;
      parentOfCurrent = this.parent.get(current);
    }
    return root;
  }

  /**
   * Merges the sets containing `a` and `b` using union by rank.
   * @param a first element
   * @param b second element
   * @returns `true` if two distinct sets were merged, `false` if already joined
   */
  union(a: T, b: T): boolean {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return false;

    const rankA = this.rank.get(rootA) ?? 0;
    const rankB = this.rank.get(rootB) ?? 0;
    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }
    this.setCount--;
    return true;
  }

  /**
   * Checks whether two elements belong to the same set.
   * @param a first element
   * @param b second element
   * @returns `true` if connected
   */
  connected(a: T, b: T): boolean {
    return this.find(a) === this.find(b);
  }

  /**
   * Returns the current number of disjoint sets.
   * @returns count of distinct sets
   */
  count(): number {
    return this.setCount;
  }
}

export { UnionFind as DisjointSet };
