/**
 * Least-Recently-Used (LRU) cache backed by a native Map.
 *
 * The Map preserves insertion order, so the first key is the least recently
 * used and the last key is the most recently used. Reads and writes move the
 * touched entry to the end; once the capacity is exceeded the front entry is
 * evicted. Iteration order is least-recently-used -> most-recently-used.
 *
 * @typeParam K key type
 * @typeParam V value type
 */
export class LRUCache<K, V> implements Iterable<[K, V]> {
  private readonly map = new Map<K, V>();
  private readonly maxSize: number;

  /**
   * Creates a cache that holds at most `capacity` entries.
   * @param capacity maximum number of entries; must be a positive integer
   */
  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError("capacity must be a positive integer");
    }
    this.maxSize = capacity;
  }

  /**
   * Returns the value for `key` and marks it as most recently used, or
   * undefined if the key is absent.
   */
  get(key: K): V | undefined {
    if (!this.map.has(key)) {
      return undefined;
    }
    const value = this.map.get(key) as V;
    // Re-insert to move the entry to the most-recently-used position.
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  /**
   * Inserts or updates `key` as most recently used. Evicts the least recently
   * used entry when the capacity is exceeded.
   */
  set(key: K, value: V): this {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);
    if (this.map.size > this.maxSize) {
      const oldest = this.map.keys().next();
      if (!oldest.done) {
        this.map.delete(oldest.value);
      }
    }
    return this;
  }

  /** Returns true if `key` is present without changing its recency. */
  has(key: K): boolean {
    return this.map.has(key);
  }

  /** Removes `key`. Returns true if it existed. */
  delete(key: K): boolean {
    return this.map.delete(key);
  }

  /** Number of entries currently stored. */
  get size(): number {
    return this.map.size;
  }

  /** Removes every entry. */
  clear(): void {
    this.map.clear();
  }

  /** Returns the keys ordered least-recently-used -> most-recently-used. */
  keys(): K[] {
    return [...this.map.keys()];
  }

  /** Iterates entries ordered least-recently-used -> most-recently-used. */
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.map[Symbol.iterator]();
  }
}
