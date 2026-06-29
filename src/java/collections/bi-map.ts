/**
 * A bidirectional map (bijection) that enforces uniqueness of both keys and
 * values, mirroring the spirit of Guava's BiMap. Two native `Map`s are kept in
 * sync so lookups by key or by value are both O(1).
 * @typeParam K key type
 * @typeParam V value type
 */
export class BiMap<K, V> implements Iterable<[K, V]> {
  private readonly forward = new Map<K, V>();
  private readonly backward = new Map<V, K>();

  /**
   * Associates a key with a value, preserving the bijection. If the key was
   * already mapped, its old value's reverse entry is removed; if the value was
   * already mapped to a different key, that other key is removed. This keeps
   * every key and every value unique.
   * @param key key to associate
   * @param value value to associate
   * @returns this bimap for chaining
   */
  set(key: K, value: V): this {
    // Detach any existing value for this key.
    const previousValue = this.forward.get(key);
    if (previousValue !== undefined || this.forward.has(key)) {
      this.backward.delete(previousValue as V);
    }
    // Detach any existing key for this value to maintain value uniqueness.
    const previousKey = this.backward.get(value);
    if (previousKey !== undefined || this.backward.has(value)) {
      this.forward.delete(previousKey as K);
    }
    this.forward.set(key, value);
    this.backward.set(value, key);
    return this;
  }

  /**
   * Looks up the value associated with a key.
   * @param key key to look up
   * @returns the mapped value, or `undefined` if absent
   */
  get(key: K): V | undefined {
    return this.forward.get(key);
  }

  /**
   * Looks up the key associated with a value (reverse lookup).
   * @param value value to look up
   * @returns the mapped key, or `undefined` if absent
   */
  getKey(value: V): K | undefined {
    return this.backward.get(value);
  }

  /**
   * Removes the entry for a key.
   * @param key key to remove
   * @returns `true` if the key existed and was removed
   */
  deleteKey(key: K): boolean {
    if (!this.forward.has(key)) return false;
    const value = this.forward.get(key) as V;
    this.forward.delete(key);
    this.backward.delete(value);
    return true;
  }

  /**
   * Removes the entry for a value (reverse delete).
   * @param value value to remove
   * @returns `true` if the value existed and was removed
   */
  deleteValue(value: V): boolean {
    if (!this.backward.has(value)) return false;
    const key = this.backward.get(value) as K;
    this.backward.delete(value);
    this.forward.delete(key);
    return true;
  }

  /**
   * Builds a new bimap with keys and values swapped. The returned bimap is
   * independent of this one.
   * @returns the inverse bimap mapping values to keys
   */
  inverse(): BiMap<V, K> {
    const result = new BiMap<V, K>();
    for (const [key, value] of this.forward) {
      result.set(value, key);
    }
    return result;
  }

  /** Number of entries in the bimap. */
  get size(): number {
    return this.forward.size;
  }

  /**
   * Iterates over the entries as `[key, value]` tuples in key insertion order.
   * @returns an iterator over the entries
   */
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.forward[Symbol.iterator]();
  }
}
