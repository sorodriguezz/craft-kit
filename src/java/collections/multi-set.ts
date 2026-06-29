/**
 * A multiset (a.k.a. bag or counter) that tracks how many times each distinct
 * value occurs, mirroring the spirit of Guava's Multiset. Counts are stored in a
 * native `Map`; values with a count of zero are removed.
 * @typeParam T element type
 */
export class MultiSet<T> implements Iterable<[T, number]> {
  private readonly counts = new Map<T, number>();
  private total = 0;

  /**
   * Adds occurrences of a value.
   * @param value value to add
   * @param count number of occurrences to add (defaults to 1); non-positive
   * values are ignored
   * @returns this multiset for chaining
   */
  add(value: T, count = 1): this {
    if (count <= 0) return this;
    this.counts.set(value, (this.counts.get(value) ?? 0) + count);
    this.total += count;
    return this;
  }

  /**
   * Removes occurrences of a value, never dropping the count below zero. The
   * value is deleted entirely when its count reaches zero.
   * @param value value to remove
   * @param count number of occurrences to remove (defaults to 1)
   * @returns `true` if at least one occurrence was removed
   */
  remove(value: T, count = 1): boolean {
    if (count <= 0) return false;
    const current = this.counts.get(value);
    if (current === undefined) return false;
    const removed = Math.min(current, count);
    const remaining = current - removed;
    if (remaining === 0) this.counts.delete(value);
    else this.counts.set(value, remaining);
    this.total -= removed;
    return removed > 0;
  }

  /**
   * Returns how many times a value occurs.
   * @param value value to count
   * @returns the occurrence count (0 if absent)
   */
  count(value: T): number {
    return this.counts.get(value) ?? 0;
  }

  /**
   * Sets the exact count of a value. A count of zero removes the value;
   * negative counts are treated as zero.
   * @param value value whose count to set
   * @param count desired non-negative count
   */
  setCount(value: T, count: number): void {
    const normalized = count < 0 ? 0 : count;
    const previous = this.counts.get(value) ?? 0;
    if (normalized === 0) this.counts.delete(value);
    else this.counts.set(value, normalized);
    this.total += normalized - previous;
  }

  /** Total number of elements counted, including repeats. */
  get totalSize(): number {
    return this.total;
  }

  /** Number of distinct elements. */
  get distinctSize(): number {
    return this.counts.size;
  }

  /**
   * Lists the distinct elements in insertion order.
   * @returns array of distinct elements
   */
  elements(): T[] {
    return [...this.counts.keys()];
  }

  /**
   * Returns the most common elements with their counts, sorted by descending
   * frequency. Ties keep insertion order (stable sort).
   * @param n optional maximum number of entries to return; when omitted all
   * distinct elements are returned
   * @returns array of `[element, count]` tuples ordered by frequency
   */
  mostCommon(n?: number): Array<[T, number]> {
    const entries: Array<[T, number]> = [...this.counts.entries()];
    entries.sort((a, b) => b[1] - a[1]);
    if (n === undefined) return entries;
    return entries.slice(0, Math.max(0, n));
  }

  /**
   * Iterates over each distinct element paired with its count.
   * @returns an iterator over `[element, count]` tuples
   */
  [Symbol.iterator](): IterableIterator<[T, number]> {
    return this.counts[Symbol.iterator]();
  }
}
