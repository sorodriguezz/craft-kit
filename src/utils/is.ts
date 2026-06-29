/**
 * Runtime type guards. Each predicate narrows the type when used in a
 * conditional, mirroring common checks needed across applications.
 */
export const is = {
  number(value: unknown): value is number {
    return typeof value === "number";
  },
  finite(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
  },
  integer(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value);
  },
  nan(value: unknown): boolean {
    return typeof value === "number" && Number.isNaN(value);
  },
  string(value: unknown): value is string {
    return typeof value === "string";
  },
  boolean(value: unknown): value is boolean {
    return typeof value === "boolean";
  },
  bigint(value: unknown): value is bigint {
    return typeof value === "bigint";
  },
  symbol(value: unknown): value is symbol {
    return typeof value === "symbol";
  },
  function(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === "function";
  },
  array(value: unknown): value is unknown[] {
    return Array.isArray(value);
  },
  object(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  },
  plainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== "object") return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  },
  date(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime());
  },
  regexp(value: unknown): value is RegExp {
    return value instanceof RegExp;
  },
  map(value: unknown): value is Map<unknown, unknown> {
    return value instanceof Map;
  },
  set(value: unknown): value is Set<unknown> {
    return value instanceof Set;
  },
  promise(value: unknown): value is Promise<unknown> {
    if (value instanceof Promise) return true;
    return (
      value !== null &&
      (typeof value === "object" || typeof value === "function") &&
      typeof (value as { then?: unknown }).then === "function"
    );
  },
  error(value: unknown): value is Error {
    return value instanceof Error;
  },
  null(value: unknown): value is null {
    return value === null;
  },
  undefined(value: unknown): value is undefined {
    return value === undefined;
  },
  nullish(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  },
  defined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
  },
  primitive(value: unknown): boolean {
    return (
      value === null || (typeof value !== "object" && typeof value !== "function")
    );
  },
  empty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
    if (value instanceof Map || value instanceof Set) return value.size === 0;
    if (typeof value === "object") {
      return Object.keys(value as Record<string, unknown>).length === 0;
    }
    return false;
  },
} as const;
