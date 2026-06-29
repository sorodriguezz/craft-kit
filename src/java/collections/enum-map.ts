/**
 * A map keyed by a fixed domain of string or numeric constants, mirroring the
 * spirit of java.util.EnumMap. Backed by a native `Map`; the key type parameter
 * constrains keys to a known enum-like set. Iteration follows insertion order.
 * @typeParam K key type (a string or number, typically a TypeScript enum)
 * @typeParam V value type
 */
export class EnumMap<K extends string | number, V> implements Iterable<[K, V]> {
  private readonly map = new Map<K, V>();

  /**
   * Creates an enum map, optionally seeded with initial entries.
   * @param initial optional iterable of `[key, value]` pairs to insert
   */
  constructor(initial?: Iterable<readonly [K, V]>) {
    if (initial) {
      for (const [key, value] of initial) this.map.set(key, value);
    }
  }

  /**
   * Associates a value with a key.
   * @param key key to set
   * @param value value to store
   * @returns this map for chaining
   */
  set(key: K, value: V): this {
    this.map.set(key, value);
    return this;
  }

  /**
   * Looks up the value for a key.
   * @param key key to look up
   * @returns the value, or `undefined` if absent
   */
  get(key: K): V | undefined {
    return this.map.get(key);
  }

  /**
   * Tests whether a key is present.
   * @param key key to test
   * @returns `true` if the key exists
   */
  has(key: K): boolean {
    return this.map.has(key);
  }

  /**
   * Removes the entry for a key.
   * @param key key to remove
   * @returns `true` if the key existed and was removed
   */
  delete(key: K): boolean {
    return this.map.delete(key);
  }

  /**
   * Lists the keys in insertion order.
   * @returns an iterator over the keys
   */
  keys(): IterableIterator<K> {
    return this.map.keys();
  }

  /**
   * Lists the values in insertion order.
   * @returns an iterator over the values
   */
  values(): IterableIterator<V> {
    return this.map.values();
  }

  /**
   * Lists the entries in insertion order.
   * @returns an iterator over `[key, value]` tuples
   */
  entries(): IterableIterator<[K, V]> {
    return this.map.entries();
  }

  /** Number of entries in the map. */
  get size(): number {
    return this.map.size;
  }

  /**
   * Invokes a callback for each entry in insertion order.
   * @param fn callback receiving each value and its key
   */
  forEach(fn: (value: V, key: K) => void): void {
    this.map.forEach((value, key) => fn(value, key));
  }

  /**
   * Iterates over the entries as `[key, value]` tuples.
   * @returns an iterator over the entries
   */
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.map[Symbol.iterator]();
  }
}
