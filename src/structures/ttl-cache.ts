interface TTLEntry<V> {
  value: V;
  /** Absolute expiry timestamp (ms since epoch), or null for no expiry. */
  expiresAt: number | null;
}

/** Options controlling the default behaviour of a {@link TTLCache}. */
export interface TTLCacheOptions {
  /** Default time-to-live in milliseconds for entries; omit for no expiry. */
  ttlMs?: number;
  /** Maximum number of live entries; the oldest is evicted when exceeded. */
  maxSize?: number;
}

/**
 * Key/value cache whose entries expire after a time-to-live. Expiration is
 * lazy: an entry is only removed when it is accessed (or when {@link size} is
 * read) after its deadline, using `Date.now()` as the clock. An optional
 * `maxSize` bounds the number of live entries, evicting the oldest on overflow.
 *
 * @typeParam K key type
 * @typeParam V value type
 *
 * @example
 * const cache = new TTLCache<string, number>({ ttlMs: 1000 });
 * cache.set("a", 1);
 * cache.get("a"); // 1 (within 1s)
 * // ...after more than 1s...
 * cache.get("a"); // undefined (expired and removed)
 */
export class TTLCache<K, V> {
  private readonly store = new Map<K, TTLEntry<V>>();
  private readonly defaultTtlMs: number | undefined;
  private readonly maxSize: number | undefined;

  /**
   * Creates a cache.
   * @param options default TTL and optional maximum size
   * @throws RangeError if `ttlMs` or `maxSize` is provided but not a positive value
   */
  constructor(options: TTLCacheOptions = {}) {
    const { ttlMs, maxSize } = options;
    if (ttlMs !== undefined && (!Number.isFinite(ttlMs) || ttlMs <= 0)) {
      throw new RangeError("ttlMs must be a positive, finite number");
    }
    if (
      maxSize !== undefined &&
      (!Number.isInteger(maxSize) || maxSize <= 0)
    ) {
      throw new RangeError("maxSize must be a positive integer");
    }
    this.defaultTtlMs = ttlMs;
    this.maxSize = maxSize;
  }

  /** Returns true if `entry` has passed its expiry deadline. */
  private isExpired(entry: TTLEntry<V>, now: number): boolean {
    return entry.expiresAt !== null && entry.expiresAt <= now;
  }

  /**
   * Stores `value` under `key`, refreshing its expiry.
   * @param key cache key
   * @param value value to store
   * @param ttlMs per-entry TTL overriding the default; omit to use the default
   * @returns this, for chaining
   * @throws RangeError if `ttlMs` is provided but not a positive value
   */
  set(key: K, value: V, ttlMs?: number): this {
    if (ttlMs !== undefined && (!Number.isFinite(ttlMs) || ttlMs <= 0)) {
      throw new RangeError("ttlMs must be a positive, finite number");
    }
    const effectiveTtl = ttlMs ?? this.defaultTtlMs;
    const expiresAt =
      effectiveTtl === undefined ? null : Date.now() + effectiveTtl;
    // Re-inserting moves the key to the most-recent position for eviction order.
    this.store.delete(key);
    this.store.set(key, { value, expiresAt });
    this.evictIfNeeded();
    return this;
  }

  /** Evicts the oldest live entries until the size is within `maxSize`. */
  private evictIfNeeded(): void {
    if (this.maxSize === undefined) return;
    while (this.store.size > this.maxSize) {
      const oldest = this.store.keys().next();
      if (oldest.done) break;
      this.store.delete(oldest.value);
    }
  }

  /**
   * Returns the value for `key`, or undefined if it is absent or expired.
   * An expired entry is removed as a side effect.
   */
  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (entry === undefined) return undefined;
    if (this.isExpired(entry, Date.now())) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /**
   * Returns true if `key` is present and not expired. An expired entry is
   * removed as a side effect.
   */
  has(key: K): boolean {
    const entry = this.store.get(key);
    if (entry === undefined) return false;
    if (this.isExpired(entry, Date.now())) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  /** Removes `key`. Returns true if a (live or expired) entry existed. */
  delete(key: K): boolean {
    return this.store.delete(key);
  }

  /** Removes every entry. */
  clear(): void {
    this.store.clear();
  }

  /**
   * Number of live (non-expired) entries. Reading this purges any entries that
   * have expired since they were last touched.
   */
  get size(): number {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (this.isExpired(entry, now)) {
        this.store.delete(key);
      }
    }
    return this.store.size;
  }
}
