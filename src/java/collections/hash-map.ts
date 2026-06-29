/**
 * Key/value map mirroring java.util.HashMap, backed by a native Map.
 * Iteration order follows insertion order.
 * @typeParam K key type
 * @typeParam V value type
 */
export class HashMap<K, V> implements Iterable<[K, V]> {
  protected readonly map: Map<K, V>;

  constructor(initial?: Iterable<readonly [K, V]>) {
    this.map = new Map<K, V>();
    if (initial) for (const [k, v] of initial) this.map.set(k, v);
  }

  /** Associates value with key, returning the previous value if any. */
  put(key: K, value: V): V | undefined {
    const old = this.map.get(key);
    this.map.set(key, value);
    return old;
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  getOrDefault(key: K, defaultValue: V): V {
    const v = this.map.get(key);
    return v === undefined ? defaultValue : v;
  }

  containsKey(key: K): boolean {
    return this.map.has(key);
  }

  containsValue(value: V): boolean {
    for (const v of this.map.values()) if (v === value) return true;
    return false;
  }

  remove(key: K): V | undefined {
    const old = this.map.get(key);
    this.map.delete(key);
    return old;
  }

  putIfAbsent(key: K, value: V): V | undefined {
    const existing = this.map.get(key);
    if (existing === undefined) {
      this.map.set(key, value);
      return undefined;
    }
    return existing;
  }

  computeIfAbsent(key: K, mapping: (key: K) => V): V {
    const existing = this.map.get(key);
    if (existing !== undefined) return existing;
    const created = mapping(key);
    this.map.set(key, created);
    return created;
  }

  merge(key: K, value: V, remap: (oldValue: V, value: V) => V): V {
    const existing = this.map.get(key);
    const next = existing === undefined ? value : remap(existing, value);
    this.map.set(key, next);
    return next;
  }

  keySet(): K[] {
    return [...this.map.keys()];
  }

  values(): V[] {
    return [...this.map.values()];
  }

  entrySet(): Array<[K, V]> {
    return [...this.map.entries()];
  }

  get size(): number {
    return this.map.size;
  }

  isEmpty(): boolean {
    return this.map.size === 0;
  }

  clear(): void {
    this.map.clear();
  }

  forEach(action: (value: V, key: K) => void): void {
    this.map.forEach((value, key) => action(value, key));
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.map[Symbol.iterator]();
  }
}
