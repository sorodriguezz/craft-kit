interface HTEntry<K, V> {
  key: K;
  value: V;
}

export interface HashTableOptions<K> {
  /** Initial bucket count. Default 16. */
  capacity?: number;
  /** Custom hash function. Defaults to a djb2 hash over String(key). */
  hash?: (key: K) => number;
  /** Custom equality. Defaults to ===. */
  equals?: (a: K, b: K) => boolean;
}

function djb2(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

/**
 * Hash table using separate chaining with automatic resizing.
 * Works out of the box for primitive keys; pass `hash`/`equals` for objects.
 * @typeParam K key type
 * @typeParam V value type
 */
export class HashTable<K, V> implements Iterable<[K, V]> {
  private buckets: Array<Array<HTEntry<K, V>>>;
  private capacity: number;
  private count = 0;
  private readonly loadFactor = 0.75;
  private readonly hashFn: (key: K) => number;
  private readonly equalsFn: (a: K, b: K) => boolean;

  constructor(options: HashTableOptions<K> = {}) {
    this.capacity = Math.max(4, options.capacity ?? 16);
    this.hashFn = options.hash ?? ((key: K) => djb2(String(key)));
    this.equalsFn = options.equals ?? ((a, b) => a === b);
    this.buckets = Array.from({ length: this.capacity }, () => []);
  }

  private indexFor(key: K, capacity = this.capacity): number {
    return Math.abs(this.hashFn(key)) % capacity;
  }

  /** Inserts or updates the value for a key. */
  set(key: K, value: V): this {
    const bucket = this.buckets[this.indexFor(key)]!;
    for (const entry of bucket) {
      if (this.equalsFn(entry.key, key)) {
        entry.value = value;
        return this;
      }
    }
    bucket.push({ key, value });
    this.count++;
    if (this.count / this.capacity > this.loadFactor) this.resize();
    return this;
  }

  get(key: K): V | undefined {
    const bucket = this.buckets[this.indexFor(key)]!;
    for (const entry of bucket) {
      if (this.equalsFn(entry.key, key)) return entry.value;
    }
    return undefined;
  }

  has(key: K): boolean {
    const bucket = this.buckets[this.indexFor(key)]!;
    return bucket.some((entry) => this.equalsFn(entry.key, key));
  }

  delete(key: K): boolean {
    const bucket = this.buckets[this.indexFor(key)]!;
    const idx = bucket.findIndex((entry) => this.equalsFn(entry.key, key));
    if (idx === -1) return false;
    bucket.splice(idx, 1);
    this.count--;
    return true;
  }

  private resize(): void {
    const newCapacity = this.capacity * 2;
    const newBuckets: Array<Array<HTEntry<K, V>>> = Array.from(
      { length: newCapacity },
      () => []
    );
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        newBuckets[this.indexFor(entry.key, newCapacity)]!.push(entry);
      }
    }
    this.buckets = newBuckets;
    this.capacity = newCapacity;
  }

  keys(): K[] {
    const result: K[] = [];
    for (const bucket of this.buckets) for (const e of bucket) result.push(e.key);
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    for (const bucket of this.buckets) for (const e of bucket) result.push(e.value);
    return result;
  }

  entries(): Array<[K, V]> {
    return [...this];
  }

  get size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  clear(): void {
    this.buckets = Array.from({ length: this.capacity }, () => []);
    this.count = 0;
  }

  *[Symbol.iterator](): IterableIterator<[K, V]> {
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        yield [entry.key, entry.value];
      }
    }
  }
}
