/**
 * Fenwick tree (Binary Indexed Tree) supporting O(log n) point updates and
 * prefix-sum queries over an array of numbers.
 *
 * The public API is 0-based: indices passed to {@link update}, {@link prefixSum}
 * and {@link rangeSum} refer to positions 0 .. size - 1. Internally a 1-based
 * array is used because the low-bit traversal that Fenwick trees rely on is
 * defined for positive indices.
 *
 * @example
 * const bit = new FenwickTree([1, 2, 3, 4, 5]);
 * bit.prefixSum(2); // 6  (1 + 2 + 3)
 * bit.update(0, 10); // add 10 to element 0
 * bit.rangeSum(0, 2); // 16 (11 + 2 + 3)
 */
export class FenwickTree {
  private readonly n: number;
  /** 1-based internal storage; index 0 is unused. */
  private readonly tree: number[];

  /**
   * Creates a tree of a given length (all zeros) or from initial values.
   * @param sizeOrValues a non-negative integer length, or the initial values
   * @throws RangeError if a numeric length is negative or not an integer
   */
  constructor(sizeOrValues: number | readonly number[]) {
    if (typeof sizeOrValues === "number") {
      if (!Number.isInteger(sizeOrValues) || sizeOrValues < 0) {
        throw new RangeError("size must be a non-negative integer");
      }
      this.n = sizeOrValues;
      this.tree = new Array<number>(this.n + 1).fill(0);
    } else {
      this.n = sizeOrValues.length;
      this.tree = new Array<number>(this.n + 1).fill(0);
      // Seed each position with a point update; O(n log n) but simple and safe.
      for (let i = 0; i < this.n; i++) {
        this.update(i, sizeOrValues[i]);
      }
    }
  }

  /**
   * Adds `delta` to the element at `index`.
   * @throws RangeError if `index` is out of bounds
   */
  update(index: number, delta: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.n) {
      throw new RangeError(`index ${index} out of bounds for size ${this.n}`);
    }
    // Walk to parents by adding the lowest set bit (1-based).
    for (let i = index + 1; i <= this.n; i += i & -i) {
      this.tree[i] += delta;
    }
  }

  /**
   * Returns the sum of elements in the inclusive prefix [0, index].
   * @throws RangeError if `index` is out of bounds
   */
  prefixSum(index: number): number {
    if (!Number.isInteger(index) || index < 0 || index >= this.n) {
      throw new RangeError(`index ${index} out of bounds for size ${this.n}`);
    }
    let sum = 0;
    // Walk down by removing the lowest set bit (1-based).
    for (let i = index + 1; i > 0; i -= i & -i) {
      sum += this.tree[i];
    }
    return sum;
  }

  /**
   * Returns the sum of elements in the inclusive range [left, right].
   * @throws RangeError if the range is out of bounds or inverted
   */
  rangeSum(left: number, right: number): number {
    if (
      !Number.isInteger(left) ||
      !Number.isInteger(right) ||
      left < 0 ||
      right >= this.n ||
      left > right
    ) {
      throw new RangeError(
        `invalid range [${left}, ${right}] for size ${this.n}`
      );
    }
    const upper = this.prefixSum(right);
    // Subtract the prefix before `left`; for left === 0 there is nothing to drop.
    const lower = left === 0 ? 0 : this.prefixSum(left - 1);
    return upper - lower;
  }

  /** Number of elements covered by the tree. */
  get size(): number {
    return this.n;
  }
}

export { FenwickTree as BinaryIndexedTree };
