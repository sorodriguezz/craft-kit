/**
 * Test whether a value is a plain object (created via object literal or
 * `Object.create(null)`), excluding arrays, dates, and class instances.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value) as object | null;
  return proto === Object.prototype || proto === null;
}

/**
 * Recursively clone a value without relying on `structuredClone`. Handles
 * arrays, dates, and plain/typed objects; primitives are returned as-is.
 */
function cloneRecursive<T>(value: T, seen: WeakMap<object, unknown>): T {
  if (value === null || typeof value !== "object") return value;

  const objectValue = value as unknown as object;
  const cached = seen.get(objectValue);
  if (cached !== undefined) return cached as T;

  if (value instanceof Date) {
    return new Date(value.getTime()) as unknown as T;
  }

  if (Array.isArray(value)) {
    const copy: unknown[] = [];
    seen.set(objectValue, copy);
    for (let i = 0; i < value.length; i++) {
      copy[i] = cloneRecursive(value[i], seen);
    }
    return copy as unknown as T;
  }

  const copy: Record<string, unknown> = {};
  seen.set(objectValue, copy);
  for (const key of Object.keys(value as Record<string, unknown>)) {
    copy[key] = cloneRecursive((value as Record<string, unknown>)[key], seen);
  }
  return copy as unknown as T;
}

/**
 * Split a property path string (`"a.b.c"` or `"a[0].b"`) into discrete keys.
 */
function parsePath(path: string): string[] {
  if (path.length === 0) return [];
  const tokens: string[] = [];
  const matches = path.match(/[^.[\]]+/g);
  if (matches) {
    for (const token of matches) tokens.push(token);
  }
  return tokens;
}

/**
 * Immutable object helpers. Every function treats its arguments as read-only
 * and returns fresh values rather than mutating inputs.
 */
export const objects = {
  /**
   * Deep-clone a value. Uses `structuredClone` when available; otherwise falls
   * back to a recursive clone covering arrays, dates, and plain objects.
   *
   * @typeParam T - The value type.
   * @param value - Value to clone.
   * @returns A deep copy of `value`.
   *
   * @example
   * const copy = objects.deepClone({ a: { b: [1, 2] } });
   */
  deepClone<T>(value: T): T {
    if (typeof structuredClone === "function") {
      try {
        return structuredClone(value);
      } catch {
        // Fall through to the manual clone for non-cloneable inputs.
      }
    }
    return cloneRecursive(value, new WeakMap<object, unknown>());
  },

  /**
   * Deeply compare two values for structural equality. Handles primitives,
   * arrays, dates, and plain objects; other object types compare by reference.
   *
   * @param a - First value.
   * @param b - Second value.
   * @returns `true` when the values are structurally equal.
   *
   * @example
   * objects.deepEqual({ a: [1] }, { a: [1] }); // true
   */
  deepEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;

    if (
      typeof a !== "object" ||
      typeof b !== "object" ||
      a === null ||
      b === null
    ) {
      return false;
    }

    if (a instanceof Date || b instanceof Date) {
      return (
        a instanceof Date &&
        b instanceof Date &&
        a.getTime() === b.getTime()
      );
    }

    const aIsArray = Array.isArray(a);
    const bIsArray = Array.isArray(b);
    if (aIsArray !== bIsArray) return false;

    if (aIsArray && bIsArray) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!objects.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(bObj, key)) return false;
      if (!objects.deepEqual(aObj[key], bObj[key])) return false;
    }
    return true;
  },

  /**
   * Deeply merge plain objects into a new object. Later sources win; nested
   * plain objects are merged recursively while arrays and other values are
   * replaced. Inputs are never mutated.
   *
   * @typeParam T - The target type.
   * @param target - Base object.
   * @param sources - Partial objects merged left-to-right over the target.
   * @returns A new merged object.
   *
   * @example
   * objects.deepMerge({ a: { x: 1 } }, { a: { y: 2 } }); // { a: { x: 1, y: 2 } }
   */
  deepMerge<T>(target: T, ...sources: Partial<T>[]): T {
    const output = objects.deepClone(target);

    for (const source of sources) {
      if (!isPlainObject(source)) continue;
      if (!isPlainObject(output)) continue;

      const out = output as Record<string, unknown>;
      const src = source as Record<string, unknown>;
      for (const key of Object.keys(src)) {
        const srcValue = src[key];
        const outValue = out[key];
        if (isPlainObject(srcValue) && isPlainObject(outValue)) {
          out[key] = objects.deepMerge(outValue, srcValue);
        } else {
          out[key] = objects.deepClone(srcValue);
        }
      }
    }

    return output;
  },

  /**
   * Create a new object containing only the selected keys.
   *
   * @typeParam T - The source type.
   * @typeParam K - The keys to keep.
   * @param obj - Source object.
   * @param keys - Keys to retain.
   * @returns A new object with just `keys`.
   *
   * @example
   * objects.pick({ a: 1, b: 2, c: 3 }, ["a", "c"]); // { a: 1, c: 3 }
   */
  pick<T extends object, K extends keyof T>(
    obj: T,
    keys: readonly K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = obj[key];
      }
    }
    return result;
  },

  /**
   * Create a new object excluding the selected keys.
   *
   * @typeParam T - The source type.
   * @typeParam K - The keys to drop.
   * @param obj - Source object.
   * @param keys - Keys to remove.
   * @returns A new object without `keys`.
   *
   * @example
   * objects.omit({ a: 1, b: 2, c: 3 }, ["b"]); // { a: 1, c: 3 }
   */
  omit<T extends object, K extends keyof T>(
    obj: T,
    keys: readonly K[]
  ): Omit<T, K> {
    const exclude = new Set<PropertyKey>(keys);
    const result: Record<PropertyKey, unknown> = {};
    for (const key of Object.keys(obj) as Array<keyof T>) {
      if (!exclude.has(key)) {
        result[key as PropertyKey] = obj[key];
      }
    }
    return result as Omit<T, K>;
  },

  /**
   * Safely read a nested value by path string (`"a.b.c"` or `"a[0].b"`).
   * Returns `defaultValue` when any segment is missing.
   *
   * @param obj - Source value.
   * @param path - Dot/bracket path to read.
   * @param defaultValue - Value returned when the path is absent.
   * @returns The value at `path`, or `defaultValue`.
   *
   * @example
   * objects.get({ a: [{ b: 1 }] }, "a[0].b"); // 1
   */
  get(obj: unknown, path: string, defaultValue?: unknown): unknown {
    const keys = parsePath(path);
    let current: unknown = obj;
    for (const key of keys) {
      if (current === null || current === undefined) return defaultValue;
      if (typeof current !== "object") return defaultValue;
      const container = current as Record<string, unknown>;
      if (!Object.prototype.hasOwnProperty.call(container, key)) {
        return defaultValue;
      }
      current = container[key];
    }
    return current === undefined ? defaultValue : current;
  },

  /**
   * Return a deep copy of `obj` with the value at `path` set. Intermediate
   * objects are created as needed; the original is never mutated.
   *
   * @typeParam T - The source type.
   * @param obj - Source object.
   * @param path - Dot/bracket path to write.
   * @param value - Value to set at `path`.
   * @returns A new object with the updated path.
   *
   * @example
   * objects.set({ a: { b: 1 } }, "a.c", 2); // { a: { b: 1, c: 2 } }
   */
  set<T extends object>(obj: T, path: string, value: unknown): T {
    const keys = parsePath(path);
    if (keys.length === 0) return objects.deepClone(obj);

    const root = objects.deepClone(obj) as Record<string, unknown>;
    let current: Record<string, unknown> = root;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i] as string;
      const next = current[key];
      if (next === null || typeof next !== "object") {
        const created: Record<string, unknown> = {};
        current[key] = created;
        current = created;
      } else {
        current = next as Record<string, unknown>;
      }
    }

    const lastKey = keys[keys.length - 1] as string;
    current[lastKey] = value;
    return root as T;
  },

  /**
   * Map a record's values to new values, preserving keys.
   *
   * @typeParam T - The input value type.
   * @typeParam U - The output value type.
   * @param obj - Source record.
   * @param fn - Mapper invoked with each value and key.
   * @returns A new record with mapped values.
   *
   * @example
   * objects.mapValues({ a: 1, b: 2 }, (v) => v * 10); // { a: 10, b: 20 }
   */
  mapValues<T, U>(
    obj: Record<string, T>,
    fn: (value: T, key: string) => U
  ): Record<string, U> {
    const result: Record<string, U> = {};
    for (const key of Object.keys(obj)) {
      result[key] = fn(obj[key] as T, key);
    }
    return result;
  },

  /**
   * Report whether a value is "empty": `null`, `undefined`, an empty string,
   * an empty array, or an object with no own enumerable keys.
   *
   * @param value - Value to inspect.
   * @returns `true` when the value is considered empty.
   *
   * @example
   * objects.isEmpty({}); // true
   * objects.isEmpty([0]); // false
   */
  isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string" || Array.isArray(value)) {
      return value.length === 0;
    }
    if (typeof value === "object") {
      return Object.keys(value as Record<string, unknown>).length === 0;
    }
    return false;
  },

  /** Shallow copy of an object or array (one level deep). */
  shallowClone<T>(value: T): T {
    if (Array.isArray(value)) return [...value] as T;
    if (value !== null && typeof value === "object") {
      return { ...(value as Record<string, unknown>) } as T;
    }
    return value;
  },

  /** Deep copy (alias of deepClone). */
  clone<T>(value: T): T {
    return this.deepClone(value);
  },

  /**
   * Flatten a nested object/array into a single-level object whose keys are
   * delimiter-separated paths (array indices included). Inverse of `unflatten`.
   *
   * @example
   * objects.flatten({ a: { b: 1 }, c: [10, 20] });
   * // { "a.b": 1, "c.0": 10, "c.1": 20 }
   */
  flatten(value: Record<string, unknown> | unknown[], delimiter = "."): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const walk = (node: unknown, prefix: string): void => {
      if (Array.isArray(node)) {
        if (node.length === 0 && prefix) {
          result[prefix] = [];
          return;
        }
        node.forEach((item, i) =>
          walk(item, prefix ? `${prefix}${delimiter}${i}` : String(i)),
        );
      } else if (node !== null && typeof node === "object" && !(node instanceof Date)) {
        const entries = Object.entries(node as Record<string, unknown>);
        if (entries.length === 0 && prefix) {
          result[prefix] = {};
          return;
        }
        for (const [k, v] of entries) {
          walk(v, prefix ? `${prefix}${delimiter}${k}` : k);
        }
      } else {
        result[prefix] = node;
      }
    };
    walk(value, "");
    return result;
  },

  /**
   * Rebuild a nested object/array from a flat path object produced by
   * `flatten`. Numeric path segments become array indices.
   *
   * @example
   * objects.unflatten({ "a.b": 1, "c.0": 10 }); // { a: { b: 1 }, c: [10] }
   */
  unflatten(value: Record<string, unknown>, delimiter = "."): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [path, val] of Object.entries(value)) {
      const keys = path.split(delimiter);
      let current: Record<string, unknown> = result;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
          current[key] = val;
        } else {
          const nextIsIndex = /^\d+$/.test(keys[i + 1]);
          const existing = current[key];
          if (existing === null || typeof existing !== "object") {
            current[key] = nextIsIndex ? [] : {};
          }
          current = current[key] as Record<string, unknown>;
        }
      }
    }
    return result;
  },

  /** Recursively freezes an object/array and all nested objects (in place). */
  deepFreeze<T>(value: T): T {
    if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const key of Object.keys(value as Record<string, unknown>)) {
        this.deepFreeze((value as Record<string, unknown>)[key]);
      }
    }
    return value;
  },

  /** Swaps keys and values, e.g. { a: "x" } -> { x: "a" }. */
  invert(obj: Record<string, string | number>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) result[String(v)] = k;
    return result;
  },

  /** Returns a new object with each key transformed by `fn`. */
  mapKeys<T>(obj: Record<string, T>, fn: (key: string, value: T) => string): Record<string, T> {
    const result: Record<string, T> = {};
    for (const [k, v] of Object.entries(obj)) result[fn(k, v)] = v;
    return result;
  },

  /** Returns a new object with only the entries that satisfy the predicate. */
  pickBy<T>(obj: Record<string, T>, predicate: (value: T, key: string) => boolean): Record<string, T> {
    const result: Record<string, T> = {};
    for (const [k, v] of Object.entries(obj)) if (predicate(v, k)) result[k] = v;
    return result;
  },

  /** Returns a new object without the entries that satisfy the predicate. */
  omitBy<T>(obj: Record<string, T>, predicate: (value: T, key: string) => boolean): Record<string, T> {
    const result: Record<string, T> = {};
    for (const [k, v] of Object.entries(obj)) if (!predicate(v, k)) result[k] = v;
    return result;
  },
};
