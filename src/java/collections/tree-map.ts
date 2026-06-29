import { type Comparator, naturalOrder } from "../../common/comparator";

/**
 * Sorted key/value map mirroring java.util.TreeMap. Keys are ordered by the
 * comparator; lookups use binary search (O(log n)), inserts/removes are O(n).
 * @typeParam K key type
 * @typeParam V value type
 */
export class TreeMap<K, V> implements Iterable<[K, V]> {
  private ks: K[] = [];
  private vs: V[] = [];

  constructor(
    private readonly comparator: Comparator<K> = naturalOrder,
    initial?: Iterable<readonly [K, V]>
  ) {
    if (initial) for (const [k, v] of initial) this.put(k, v);
  }

  private locate(key: K): { found: boolean; index: number } {
    let lo = 0;
    let hi = this.ks.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const cmp = this.comparator(key, this.ks[mid]);
      if (cmp === 0) return { found: true, index: mid };
      if (cmp < 0) hi = mid - 1;
      else lo = mid + 1;
    }
    return { found: false, index: lo };
  }

  put(key: K, value: V): V | undefined {
    const { found, index } = this.locate(key);
    if (found) {
      const old = this.vs[index];
      this.vs[index] = value;
      return old;
    }
    this.ks.splice(index, 0, key);
    this.vs.splice(index, 0, value);
    return undefined;
  }

  get(key: K): V | undefined {
    const { found, index } = this.locate(key);
    return found ? this.vs[index] : undefined;
  }

  getOrDefault(key: K, defaultValue: V): V {
    const { found, index } = this.locate(key);
    return found ? this.vs[index] : defaultValue;
  }

  containsKey(key: K): boolean {
    return this.locate(key).found;
  }

  remove(key: K): V | undefined {
    const { found, index } = this.locate(key);
    if (!found) return undefined;
    const old = this.vs[index];
    this.ks.splice(index, 1);
    this.vs.splice(index, 1);
    return old;
  }

  firstKey(): K | undefined {
    return this.ks[0];
  }

  lastKey(): K | undefined {
    return this.ks[this.ks.length - 1];
  }

  /** Greatest key <= given key. */
  floorKey(key: K): K | undefined {
    const { found, index } = this.locate(key);
    if (found) return this.ks[index];
    return index - 1 >= 0 ? this.ks[index - 1] : undefined;
  }

  /** Least key >= given key. */
  ceilingKey(key: K): K | undefined {
    const { found, index } = this.locate(key);
    if (found) return this.ks[index];
    return index < this.ks.length ? this.ks[index] : undefined;
  }

  /** Greatest key strictly < given key. */
  lowerKey(key: K): K | undefined {
    const { found, index } = this.locate(key);
    const i = found ? index - 1 : index - 1;
    return i >= 0 ? this.ks[i] : undefined;
  }

  /** Least key strictly > given key. */
  higherKey(key: K): K | undefined {
    const { found, index } = this.locate(key);
    const i = found ? index + 1 : index;
    return i < this.ks.length ? this.ks[i] : undefined;
  }

  keySet(): K[] {
    return [...this.ks];
  }

  values(): V[] {
    return [...this.vs];
  }

  entrySet(): Array<[K, V]> {
    return this.ks.map((k, i) => [k, this.vs[i]] as [K, V]);
  }

  get size(): number {
    return this.ks.length;
  }

  isEmpty(): boolean {
    return this.ks.length === 0;
  }

  clear(): void {
    this.ks = [];
    this.vs = [];
  }

  forEach(action: (value: V, key: K) => void): void {
    for (let i = 0; i < this.ks.length; i++) action(this.vs[i], this.ks[i]);
  }

  *[Symbol.iterator](): IterableIterator<[K, V]> {
    for (let i = 0; i < this.ks.length; i++) yield [this.ks[i], this.vs[i]];
  }
}
