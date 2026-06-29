/**
 * Quick value guards for the checks you write over and over: null, undefined,
 * empty strings/collections, blanks, defaults and assertions. Exported at the
 * top level so you can use them directly without a namespace.
 */

/** True if the value is null or undefined. */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/** True if the value is neither null nor undefined (narrows the type). */
export function isNotNil<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/**
 * True if the value is "empty": null, undefined, "", [], {}, or an empty
 * Map/Set. Numbers, booleans and functions are never considered empty.
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length === 0;
  }
  return false;
}

/** Negation of {@link isEmpty}. */
export function isNotEmpty(value: unknown): boolean {
  return !isEmpty(value);
}

/** True if the value is null, undefined, or a string that is empty/whitespace. */
export function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  return false;
}

/** Negation of {@link isBlank}. */
export function isNotBlank(value: unknown): boolean {
  return !isBlank(value);
}

/** Returns the first value that is neither null nor undefined. */
export function coalesce<T>(...values: Array<T | null | undefined>): T | undefined {
  for (const value of values) {
    if (value !== null && value !== undefined) return value;
  }
  return undefined;
}

/** Returns the value, or the fallback when it is null/undefined. */
export function defaultTo<T>(value: T | null | undefined, fallback: T): T {
  return value === null || value === undefined ? fallback : value;
}

/**
 * Returns the value, or throws a TypeError when it is null/undefined.
 * Mirrors Java's Objects.requireNonNull.
 */
export function requireNonNull<T>(
  value: T | null | undefined,
  message = "Value must not be null or undefined."
): T {
  if (value === null || value === undefined) throw new TypeError(message);
  return value;
}

/** Wraps a value in an array (empty for nullish, unchanged if already an array). */
export function ensureArray<T>(value: T | readonly T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? [...value] : [value as T];
}

/** Safely parses a number, returning the fallback (or undefined) when invalid. */
export function parseNumber(value: unknown, fallback: number): number;
export function parseNumber(value: unknown): number | undefined;
export function parseNumber(value: unknown, fallback?: number): number | undefined {
  if (typeof value === "number") return Number.isNaN(value) ? fallback : value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return fallback;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/** Coerces a value to boolean ("true"/"1"/"yes"/"y"/"on" and non-zero => true). */
export function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes" || v === "y" || v === "on";
  }
  return false;
}

/** Coerces a value to an integer, returning `fallback` when invalid. */
export function toInt(value: unknown, fallback = 0): number {
  const n = parseNumber(value);
  return n === undefined ? fallback : Math.trunc(n);
}

/** Coerces a value to a float, returning `fallback` when invalid. */
export function toFloat(value: unknown, fallback = 0): number {
  const n = parseNumber(value);
  return n === undefined ? fallback : n;
}

/** Coerces a value to a valid Date, or undefined when it cannot be parsed. */
export function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value === "number" || typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

/** Throws an Error with `message` when `condition` is falsy (narrows the type). */
export function assert(condition: unknown, message = "Assertion failed"): asserts condition {
  if (!condition) throw new Error(message);
}

/** Alias of {@link assert} with an "invariant" message default. */
export function invariant(condition: unknown, message = "Invariant violation"): asserts condition {
  if (!condition) throw new Error(message);
}
