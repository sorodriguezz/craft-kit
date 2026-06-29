/**
 * Segment tree over a fixed-length array of numbers, supporting associative
 * range queries and point updates in O(log n).
 *
 * The tree is parameterised by an associative `merge` operation and its
 * `identity` element. By default it computes range sums, but supplying, for
 * example, `Math.min` with identity `Infinity` turns it into a range-minimum
 * structure. The underlying values are copied, so the source array is never
 * mutated.
 *
 * @example
 * const tree = new SegmentTree([1, 2, 3, 4, 5]);
 * tree.query(1, 3); // 9  (2 + 3 + 4)
 * tree.update(2, 10);
 * tree.query(1, 3); // 16 (2 + 10 + 4)
 *
 * @example
 * // Range minimum:
 * const min = new SegmentTree([5, 2, 8, 1], (a, b) => Math.min(a, b), Infinity);
 * min.query(0, 2); // 2
 */
export class SegmentTree {
  private readonly n: number;
  private readonly tree: number[];
  private readonly merge: (a: number, b: number) => number;
  private readonly identity: number;

  /**
   * Builds a segment tree from `values`.
   * @param values initial values; copied, never mutated
   * @param merge associative combine operation (default addition)
   * @param identity neutral element for `merge` (default 0)
   */
  constructor(
    values: readonly number[],
    merge: (a: number, b: number) => number = (a, b) => a + b,
    identity = 0
  ) {
    this.merge = merge;
    this.identity = identity;
    this.n = values.length;
    // A segment tree over n leaves needs at most 4n nodes.
    this.tree = new Array<number>(Math.max(1, this.n * 4)).fill(identity);
    if (this.n > 0) {
      this.build(values, 1, 0, this.n - 1);
    }
  }

  /** Recursively builds the tree node covering [start, end]. */
  private build(
    values: readonly number[],
    node: number,
    start: number,
    end: number
  ): void {
    if (start === end) {
      this.tree[node] = values[start];
      return;
    }
    const mid = (start + end) >> 1;
    this.build(values, node * 2, start, mid);
    this.build(values, node * 2 + 1, mid + 1, end);
    this.tree[node] = this.merge(this.tree[node * 2], this.tree[node * 2 + 1]);
  }

  /**
   * Returns the merged value over the inclusive range [left, right].
   * @throws RangeError if the range is out of bounds or inverted
   */
  query(left: number, right: number): number {
    if (
      !Number.isInteger(left) ||
      !Number.isInteger(right) ||
      left < 0 ||
      right >= this.n ||
      left > right
    ) {
      throw new RangeError(
        `invalid query range [${left}, ${right}] for size ${this.n}`
      );
    }
    return this.queryRange(1, 0, this.n - 1, left, right);
  }

  private queryRange(
    node: number,
    start: number,
    end: number,
    left: number,
    right: number
  ): number {
    // Node range lies entirely within the query range.
    if (left <= start && end <= right) {
      return this.tree[node];
    }
    const mid = (start + end) >> 1;
    // Query falls entirely in one child: recurse into it only.
    if (right <= mid) {
      return this.queryRange(node * 2, start, mid, left, right);
    }
    if (left > mid) {
      return this.queryRange(node * 2 + 1, mid + 1, end, left, right);
    }
    // Query spans both children.
    const leftValue = this.queryRange(node * 2, start, mid, left, right);
    const rightValue = this.queryRange(node * 2 + 1, mid + 1, end, left, right);
    return this.merge(leftValue, rightValue);
  }

  /**
   * Sets the element at `index` to `value` and refreshes the affected nodes.
   * @throws RangeError if `index` is out of bounds
   */
  update(index: number, value: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.n) {
      throw new RangeError(`index ${index} out of bounds for size ${this.n}`);
    }
    this.updatePoint(1, 0, this.n - 1, index, value);
  }

  private updatePoint(
    node: number,
    start: number,
    end: number,
    index: number,
    value: number
  ): void {
    if (start === end) {
      this.tree[node] = value;
      return;
    }
    const mid = (start + end) >> 1;
    if (index <= mid) {
      this.updatePoint(node * 2, start, mid, index, value);
    } else {
      this.updatePoint(node * 2 + 1, mid + 1, end, index, value);
    }
    this.tree[node] = this.merge(this.tree[node * 2], this.tree[node * 2 + 1]);
  }

  /** Number of elements covered by the tree. */
  get size(): number {
    return this.n;
  }
}
