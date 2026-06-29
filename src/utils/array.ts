/**
 * Immutable array helpers. Every method treats its inputs as read-only and
 * returns fresh arrays (or scalars) without mutating the arguments.
 */
export const arrays = {
  /**
   * Split an array into consecutive chunks of at most `size` elements.
   *
   * @param arr - Source array (not mutated).
   * @param size - Maximum length of each chunk. Must be a positive integer.
   * @returns A new array of chunk arrays. Returns an empty array when `size`
   * is not a positive integer.
   *
   * @example
   * arrays.chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
   */
  chunk<T>(arr: readonly T[], size: number): T[][] {
    if (!Number.isInteger(size) || size <= 0) {
      return [];
    }
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  },

  /**
   * Remove duplicate values, preserving first-seen order. Uses SameValueZero
   * equality (the same semantics as `Set`).
   *
   * @param arr - Source array (not mutated).
   * @returns A new array with duplicates removed.
   *
   * @example
   * arrays.unique([1, 1, 2, 3, 3]); // [1, 2, 3]
   */
  unique<T>(arr: readonly T[]): T[] {
    return [...new Set(arr)];
  },

  /**
   * Remove duplicates based on a key derived from each item, preserving
   * first-seen order.
   *
   * @param arr - Source array (not mutated).
   * @param keyFn - Maps an item to the key used for deduplication.
   * @returns A new array keeping the first item for each distinct key.
   *
   * @example
   * arrays.uniqueBy([{ id: 1 }, { id: 1 }, { id: 2 }], (x) => x.id);
   * // [{ id: 1 }, { id: 2 }]
   */
  uniqueBy<T, K>(arr: readonly T[], keyFn: (item: T) => K): T[] {
    const seen = new Set<K>();
    const result: T[] = [];
    for (const item of arr) {
      const key = keyFn(item);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    return result;
  },

  /**
   * Group items into a `Map` keyed by the value returned from `keyFn`.
   *
   * @param arr - Source array (not mutated).
   * @param keyFn - Maps an item to its group key.
   * @returns A new `Map` from key to the array of items in that group.
   *
   * @example
   * arrays.groupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? "even" : "odd"));
   * // Map { "odd" => [1, 3], "even" => [2, 4] }
   */
  groupBy<T, K>(arr: readonly T[], keyFn: (item: T) => K): Map<K, T[]> {
    const result = new Map<K, T[]>();
    for (const item of arr) {
      const key = keyFn(item);
      const bucket = result.get(key);
      if (bucket) {
        bucket.push(item);
      } else {
        result.set(key, [item]);
      }
    }
    return result;
  },

  /**
   * Split an array into two arrays: items that match the predicate and items
   * that do not.
   *
   * @param arr - Source array (not mutated).
   * @param predicate - Returns `true` for items placed in the first array.
   * @returns A tuple `[matched, rest]` of new arrays.
   *
   * @example
   * arrays.partition([1, 2, 3, 4], (n) => n % 2 === 0); // [[2, 4], [1, 3]]
   */
  partition<T>(arr: readonly T[], predicate: (item: T) => boolean): [T[], T[]] {
    const matched: T[] = [];
    const rest: T[] = [];
    for (const item of arr) {
      if (predicate(item)) {
        matched.push(item);
      } else {
        rest.push(item);
      }
    }
    return [matched, rest];
  },

  /**
   * Flatten one level of nesting. Nested arrays are spread; non-array items are
   * kept as-is.
   *
   * @param arr - Source array of items or arrays (not mutated).
   * @returns A new array flattened by a single level.
   *
   * @example
   * arrays.flatten([1, [2, 3], 4]); // [1, 2, 3, 4]
   */
  flatten<T>(arr: ReadonlyArray<T | readonly T[]>): T[] {
    const result: T[] = [];
    for (const item of arr) {
      if (Array.isArray(item)) {
        result.push(...(item as readonly T[]));
      } else {
        result.push(item as T);
      }
    }
    return result;
  },

  /**
   * Recursively flatten arbitrarily nested arrays into a single flat array.
   *
   * @param arr - Source array of unknown depth (not mutated).
   * @returns A new fully flattened array.
   *
   * @example
   * arrays.flattenDeep([1, [2, [3, [4]]]]); // [1, 2, 3, 4]
   */
  flattenDeep(arr: readonly unknown[]): unknown[] {
    const result: unknown[] = [];
    for (const item of arr) {
      if (Array.isArray(item)) {
        result.push(...arrays.flattenDeep(item as readonly unknown[]));
      } else {
        result.push(item);
      }
    }
    return result;
  },

  /**
   * Pair up elements from two arrays positionally, stopping at the length of
   * the shorter array.
   *
   * @param a - First array (not mutated).
   * @param b - Second array (not mutated).
   * @returns A new array of `[a[i], b[i]]` tuples.
   *
   * @example
   * arrays.zip([1, 2, 3], ["a", "b"]); // [[1, "a"], [2, "b"]]
   */
  zip<A, B>(a: readonly A[], b: readonly B[]): Array<[A, B]> {
    const length = Math.min(a.length, b.length);
    const result: Array<[A, B]> = [];
    for (let i = 0; i < length; i++) {
      result.push([a[i], b[i]]);
    }
    return result;
  },

  /**
   * Generate a numeric range from `start` (inclusive) to `end` (exclusive).
   *
   * @param start - Inclusive lower bound.
   * @param end - Exclusive upper bound.
   * @param step - Increment between values. Defaults to `1`. The sign is
   * normalized to move from `start` toward `end`.
   * @returns A new array of numbers. Returns an empty array when `step` is `0`.
   *
   * @example
   * arrays.range(0, 5); // [0, 1, 2, 3, 4]
   * arrays.range(5, 0, 2); // [5, 3, 1]
   */
  range(start: number, end: number, step = 1): number[] {
    if (step === 0) {
      return [];
    }
    const magnitude = Math.abs(step);
    const result: number[] = [];
    if (start <= end) {
      for (let value = start; value < end; value += magnitude) {
        result.push(value);
      }
    } else {
      for (let value = start; value > end; value -= magnitude) {
        result.push(value);
      }
    }
    return result;
  },

  /**
   * Remove all falsy values (`null`, `undefined`, `false`, `0`, `""`, `NaN`).
   *
   * @param arr - Source array (not mutated).
   * @returns A new array containing only truthy values.
   *
   * @example
   * arrays.compact([0, 1, false, 2, "", 3, null]); // [1, 2, 3]
   */
  compact<T>(arr: readonly (T | null | undefined | false | 0 | "")[]): T[] {
    return arr.filter(Boolean) as T[];
  },

  /**
   * Return the values present in `a` but not in `b`, preserving order from `a`.
   * Uses SameValueZero equality.
   *
   * @param a - Base array (not mutated).
   * @param b - Values to exclude (not mutated).
   * @returns A new array of values unique to `a`.
   *
   * @example
   * arrays.difference([1, 2, 3, 4], [2, 4]); // [1, 3]
   */
  difference<T>(a: readonly T[], b: readonly T[]): T[] {
    const exclude = new Set(b);
    return a.filter((item) => !exclude.has(item));
  },

  /**
   * Return the values present in both arrays, preserving order from `a` and
   * removing duplicates. Uses SameValueZero equality.
   *
   * @param a - First array (not mutated).
   * @param b - Second array (not mutated).
   * @returns A new array of shared values.
   *
   * @example
   * arrays.intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
   */
  intersection<T>(a: readonly T[], b: readonly T[]): T[] {
    const other = new Set(b);
    const seen = new Set<T>();
    const result: T[] = [];
    for (const item of a) {
      if (other.has(item) && !seen.has(item)) {
        seen.add(item);
        result.push(item);
      }
    }
    return result;
  },

  /**
   * Merge several arrays into one, removing duplicates and preserving
   * first-seen order. Uses SameValueZero equality.
   *
   * @param arrays - The arrays to merge (not mutated).
   * @returns A new array containing each distinct value once.
   *
   * @example
   * arrays.union([1, 2], [2, 3], [3, 4]); // [1, 2, 3, 4]
   */
  union<T>(...arrays: ReadonlyArray<readonly T[]>): T[] {
    const seen = new Set<T>();
    for (const arr of arrays) {
      for (const item of arr) {
        seen.add(item);
      }
    }
    return [...seen];
  },

  /**
   * Count items grouped by a derived key.
   *
   * @param arr - Source array (not mutated).
   * @param keyFn - Maps an item to its group key.
   * @returns A new `Map` from key to the number of items with that key.
   *
   * @example
   * arrays.countBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? "even" : "odd"));
   * // Map { "odd" => 2, "even" => 2 }
   */
  countBy<T, K>(arr: readonly T[], keyFn: (item: T) => K): Map<K, number> {
    const result = new Map<K, number>();
    for (const item of arr) {
      const key = keyFn(item);
      result.set(key, (result.get(key) ?? 0) + 1);
    }
    return result;
  },

  /**
   * Return a stably sorted copy ordered by a derived comparable key. Numbers
   * are compared numerically and strings lexicographically.
   *
   * @param arr - Source array (not mutated).
   * @param keyFn - Maps an item to a numeric or string sort key.
   * @returns A new sorted array.
   *
   * @example
   * arrays.sortBy([{ n: 3 }, { n: 1 }], (x) => x.n); // [{ n: 1 }, { n: 3 }]
   */
  sortBy<T>(arr: readonly T[], keyFn: (item: T) => number | string): T[] {
    return [...arr].sort((left, right) => {
      const a = keyFn(left);
      const b = keyFn(right);
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
  },

  /**
   * Return the first element of the array.
   *
   * @param arr - Source array (not mutated).
   * @returns The first element, or `undefined` when the array is empty.
   *
   * @example
   * arrays.first([1, 2, 3]); // 1
   */
  first<T>(arr: readonly T[]): T | undefined {
    return arr.length > 0 ? arr[0] : undefined;
  },

  /**
   * Return the last element of the array.
   *
   * @param arr - Source array (not mutated).
   * @returns The last element, or `undefined` when the array is empty.
   *
   * @example
   * arrays.last([1, 2, 3]); // 3
   */
  last<T>(arr: readonly T[]): T | undefined {
    return arr.length > 0 ? arr[arr.length - 1] : undefined;
  },

  /**
   * Sum all numbers in the array.
   *
   * @param arr - Source array of numbers (not mutated).
   * @returns The sum, or `0` for an empty array.
   *
   * @example
   * arrays.sum([1, 2, 3]); // 6
   */
  sum(arr: readonly number[]): number {
    let total = 0;
    for (const value of arr) {
      total += value;
    }
    return total;
  },

  /**
   * Compute the arithmetic mean of the array.
   *
   * @param arr - Source array of numbers (not mutated).
   * @returns The average, or `NaN` for an empty array.
   *
   * @example
   * arrays.mean([1, 2, 3, 4]); // 2.5
   */
  mean(arr: readonly number[]): number {
    if (arr.length === 0) {
      return NaN;
    }
    return arrays.sum(arr) / arr.length;
  },

  /**
   * Find the minimum value in the array.
   *
   * @param arr - Source array of numbers (not mutated).
   * @returns The smallest value, or `undefined` for an empty array.
   *
   * @example
   * arrays.min([3, 1, 2]); // 1
   */
  min(arr: readonly number[]): number | undefined {
    if (arr.length === 0) {
      return undefined;
    }
    let result = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < result) {
        result = arr[i];
      }
    }
    return result;
  },

  /**
   * Find the maximum value in the array.
   *
   * @param arr - Source array of numbers (not mutated).
   * @returns The largest value, or `undefined` for an empty array.
   *
   * @example
   * arrays.max([3, 1, 2]); // 3
   */
  max(arr: readonly number[]): number | undefined {
    if (arr.length === 0) {
      return undefined;
    }
    let result = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > result) {
        result = arr[i];
      }
    }
    return result;
  },

  /**
   * Return the first `n` elements.
   *
   * @param arr - Source array (not mutated).
   * @param n - Number of elements to take. Values `<= 0` yield an empty array.
   * @returns A new array with at most `n` leading elements.
   *
   * @example
   * arrays.take([1, 2, 3, 4], 2); // [1, 2]
   */
  take<T>(arr: readonly T[], n: number): T[] {
    if (n <= 0) {
      return [];
    }
    return arr.slice(0, n);
  },

  /**
   * Return the array without its first `n` elements.
   *
   * @param arr - Source array (not mutated).
   * @param n - Number of elements to drop. Values `<= 0` return a full copy.
   * @returns A new array with the leading `n` elements removed.
   *
   * @example
   * arrays.drop([1, 2, 3, 4], 2); // [3, 4]
   */
  drop<T>(arr: readonly T[], n: number): T[] {
    if (n <= 0) {
      return [...arr];
    }
    return arr.slice(n);
  },

  /** Count how many times a value appears (strict equality). */
  count<T>(arr: readonly T[], value: T): number {
    let n = 0;
    for (const item of arr) if (item === value) n++;
    return n;
  },

  /** Frequency map of every distinct element. */
  frequencies<T>(arr: readonly T[]): Map<T, number> {
    const map = new Map<T, number>();
    for (const item of arr) map.set(item, (map.get(item) ?? 0) + 1);
    return map;
  },

  /** Most frequent element (first seen on ties), or undefined if empty. */
  mode<T>(arr: readonly T[]): T | undefined {
    let best: T | undefined;
    let bestCount = 0;
    const map = new Map<T, number>();
    for (const item of arr) {
      const c = (map.get(item) ?? 0) + 1;
      map.set(item, c);
      if (c > bestCount) {
        bestCount = c;
        best = item;
      }
    }
    return best;
  },

  /** Type guard: every element is a number. */
  isAllNumbers(arr: readonly unknown[]): arr is number[] {
    return arr.every((x) => typeof x === "number");
  },

  /** Type guard: every element is a string. */
  isAllStrings(arr: readonly unknown[]): arr is string[] {
    return arr.every((x) => typeof x === "string");
  },

  /** Type guard: every element is a boolean. */
  isAllBooleans(arr: readonly unknown[]): arr is boolean[] {
    return arr.every((x) => typeof x === "boolean");
  },

  /** Whether every element satisfies the predicate. */
  isAllOf<T>(arr: readonly T[], predicate: (item: T) => boolean): boolean {
    return arr.every(predicate);
  },

  /** Whether the array contains all of the given values. */
  includesAll<T>(arr: readonly T[], values: readonly T[]): boolean {
    return values.every((v) => arr.includes(v));
  },

  /** Whether the array contains any of the given values. */
  includesAny<T>(arr: readonly T[], values: readonly T[]): boolean {
    return values.some((v) => arr.includes(v));
  },

  /** Shallow copy of the array. */
  shallowClone<T>(arr: readonly T[]): T[] {
    return [...arr];
  },

  /** New array with `items` inserted at `index`. */
  insertAt<T>(arr: readonly T[], index: number, ...items: T[]): T[] {
    return [...arr.slice(0, index), ...items, ...arr.slice(index)];
  },

  /** New array with the element at `index` removed. */
  removeAt<T>(arr: readonly T[], index: number): T[] {
    if (index < 0 || index >= arr.length) return [...arr];
    return [...arr.slice(0, index), ...arr.slice(index + 1)];
  },

  /** New array with an element moved from one index to another. */
  move<T>(arr: readonly T[], from: number, to: number): T[] {
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  },

  /** New array rotated left by `n` (negative rotates right). */
  rotate<T>(arr: readonly T[], n: number): T[] {
    const len = arr.length;
    if (len === 0) return [];
    const shift = ((n % len) + len) % len;
    return [...arr.slice(shift), ...arr.slice(0, shift)];
  },

  /** Shallow element-by-element equality of two arrays. */
  equals<T>(a: readonly T[], b: readonly T[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  },
};
