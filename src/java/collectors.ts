/**
 * Factory helpers for terminal reductions, inspired by
 * `java.util.stream.Collectors`. Each factory returns a function of the form
 * `(items: T[]) => R`, designed to be passed to a stream's `collect` method,
 * which supplies the already-materialized array of elements.
 */
export const Collectors = {
  /** Collects the elements into a new array (a shallow copy). */
  toArray<T>(): (items: T[]) => T[] {
    return (items: T[]): T[] => items.slice();
  },

  /** Collects the elements into a `Set`, removing duplicates. */
  toSet<T>(): (items: T[]) => Set<T> {
    return (items: T[]): Set<T> => new Set<T>(items);
  },

  /**
   * Groups elements into a `Map` keyed by the result of `keyFn`, with each
   * value being the list of elements that produced that key.
   * @typeParam T element type
   * @typeParam K key type
   */
  groupingBy<T, K>(keyFn: (item: T) => K): (items: T[]) => Map<K, T[]> {
    return (items: T[]): Map<K, T[]> => {
      const result = new Map<K, T[]>();
      for (const item of items) {
        const key = keyFn(item);
        const bucket = result.get(key);
        if (bucket === undefined) {
          result.set(key, [item]);
        } else {
          bucket.push(item);
        }
      }
      return result;
    };
  },

  /**
   * Builds a `Map` from each element's key and value. Later elements with the
   * same key overwrite earlier ones.
   * @typeParam T element type
   * @typeParam K key type
   * @typeParam V value type
   */
  toMap<T, K, V>(
    keyFn: (item: T) => K,
    valueFn: (item: T) => V,
  ): (items: T[]) => Map<K, V> {
    return (items: T[]): Map<K, V> => {
      const result = new Map<K, V>();
      for (const item of items) {
        result.set(keyFn(item), valueFn(item));
      }
      return result;
    };
  },

  /**
   * Partitions elements into those matching `predicate` (`true`) and those
   * that do not (`false`).
   * @typeParam T element type
   */
  partitioningBy<T>(
    predicate: (item: T) => boolean,
  ): (items: T[]) => { true: T[]; false: T[] } {
    return (items: T[]): { true: T[]; false: T[] } => {
      const result: { true: T[]; false: T[] } = { true: [], false: [] };
      for (const item of items) {
        if (predicate(item)) {
          result.true.push(item);
        } else {
          result.false.push(item);
        }
      }
      return result;
    };
  },

  /** Counts the elements. */
  counting<T>(): (items: T[]) => number {
    return (items: T[]): number => items.length;
  },

  /**
   * Concatenates the string form of each element, optionally separated by
   * `separator` and wrapped with `prefix` and `suffix`.
   */
  joining(
    separator = "",
    prefix = "",
    suffix = "",
  ): (items: unknown[]) => string {
    return (items: unknown[]): string =>
      prefix + items.map((item) => String(item)).join(separator) + suffix;
  },

  /**
   * Sums the numeric values produced by `fn` over all elements.
   * @typeParam T element type
   */
  summing<T>(fn: (item: T) => number): (items: T[]) => number {
    return (items: T[]): number => {
      let total = 0;
      for (const item of items) {
        total += fn(item);
      }
      return total;
    };
  },

  /**
   * Computes the arithmetic mean of the numeric values produced by `fn`.
   * Returns `0` for an empty input.
   * @typeParam T element type
   */
  averaging<T>(fn: (item: T) => number): (items: T[]) => number {
    return (items: T[]): number => {
      if (items.length === 0) {
        return 0;
      }
      let total = 0;
      for (const item of items) {
        total += fn(item);
      }
      return total / items.length;
    };
  },

  /** Forwards elements to two collectors and merges their results (Java 12). */
  teeing<T, R1, R2, R>(
    collector1: (items: T[]) => R1,
    collector2: (items: T[]) => R2,
    merger: (result1: R1, result2: R2) => R,
  ): (items: T[]) => R {
    return (items) => merger(collector1(items), collector2(items));
  },

  /** Maps elements before passing them to a downstream collector. */
  mapping<T, U, R>(mapper: (item: T) => U, downstream: (items: U[]) => R): (items: T[]) => R {
    return (items) => downstream(items.map(mapper));
  },

  /** Filters elements before passing them to a downstream collector. */
  filtering<T, R>(predicate: (item: T) => boolean, downstream: (items: T[]) => R): (items: T[]) => R {
    return (items) => downstream(items.filter(predicate));
  },

  /** Reduces to a single value using an identity and a binary operator. */
  reducing<T>(identity: T, reducer: (a: T, b: T) => T): (items: T[]) => T {
    return (items) => items.reduce(reducer, identity);
  },

  /** Finds the minimum element per the comparator (undefined if empty). */
  minBy<T>(comparator: (a: T, b: T) => number): (items: T[]) => T | undefined {
    return (items) => (items.length === 0 ? undefined : items.reduce((m, x) => (comparator(x, m) < 0 ? x : m)));
  },

  /** Finds the maximum element per the comparator (undefined if empty). */
  maxBy<T>(comparator: (a: T, b: T) => number): (items: T[]) => T | undefined {
    return (items) => (items.length === 0 ? undefined : items.reduce((m, x) => (comparator(x, m) > 0 ? x : m)));
  },
};
