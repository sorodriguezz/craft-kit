/**
 * A map that associates each key with a list of values, mirroring the spirit of
 * Guava's ListMultimap. Backed by a native `Map` of arrays. Insertion order is
 * preserved both across keys and within each key's value list.
 * @typeParam K key type
 * @typeParam V value type
 */
export class MultiMap<K, V> implements Iterable<[K, V]> {
  private readonly map = new Map<K, V[]>();
  private total = 0;

  /**
   * Appends a value to the list associated with a key, creating the list if it
   * does not yet exist. Duplicate values are permitted.
   * @param key key to associate the value with
   * @param value value to append
   * @returns this multimap for chaining
   */
  put(key: K, value: V): this {
    let list = this.map.get(key);
    if (list === undefined) {
      list = [];
      this.map.set(key, list);
    }
    list.push(value);
    this.total++;
    return this;
  }

  /**
   * Returns a copy of the values associated with a key.
   * @param key key to look up
   * @returns array of values, or an empty array if the key is absent
   */
  get(key: K): V[] {
    const list = this.map.get(key);
    return list === undefined ? [] : [...list];
  }

  /**
   * Removes a single occurrence of a value from a key's list. Empties out the
   * key entirely when its last value is removed.
   * @param key key whose value should be removed
   * @param value value to remove
   * @returns `true` if a matching value was removed
   */
  remove(key: K, value: V): boolean {
    const list = this.map.get(key);
    if (list === undefined) return false;
    const index = list.indexOf(value);
    if (index === -1) return false;
    list.splice(index, 1);
    this.total--;
    if (list.length === 0) this.map.delete(key);
    return true;
  }

  /**
   * Removes all values associated with a key.
   * @param key key to clear
   * @returns `true` if the key existed and was removed
   */
  removeAll(key: K): boolean {
    const list = this.map.get(key);
    if (list === undefined) return false;
    this.total -= list.length;
    this.map.delete(key);
    return true;
  }

  /**
   * Checks for the presence of a key, or of a specific key/value pair when a
   * value is supplied.
   * @param key key to test
   * @param value optional value that must also be present under the key
   * @returns `true` if the key (and value, when given) exists
   */
  has(key: K, value?: V): boolean {
    const list = this.map.get(key);
    if (list === undefined) return false;
    if (arguments.length < 2) return true;
    return list.indexOf(value as V) !== -1;
  }

  /**
   * Lists all distinct keys in insertion order.
   * @returns array of keys
   */
  keys(): K[] {
    return [...this.map.keys()];
  }

  /** Total number of values across all keys. */
  get size(): number {
    return this.total;
  }

  /**
   * Invokes a callback for every key/value pair, in key insertion order and
   * then value insertion order.
   * @param fn callback receiving each value and its key
   */
  forEach(fn: (value: V, key: K) => void): void {
    for (const [key, list] of this.map) {
      for (const value of list) fn(value, key);
    }
  }

  /**
   * Iterates over every key/value pair as `[key, value]` tuples.
   * @returns an iterator over all pairs
   */
  *[Symbol.iterator](): IterableIterator<[K, V]> {
    for (const [key, list] of this.map) {
      for (const value of list) yield [key, value];
    }
  }
}
