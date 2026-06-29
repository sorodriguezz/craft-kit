/**
 * Boolean helpers for parsing, truthiness checks and logical combinators.
 * None of these mutate their inputs.
 */
export const booleans = {
  /**
   * Parse an arbitrary value into a boolean using a permissive set of truthy
   * tokens. The value is considered `true` when it is the boolean `true`, the
   * number `1`, or one of the strings `"true"`, `"1"`, `"yes"`, `"y"`, `"on"`
   * (case-insensitive, surrounding whitespace ignored). Everything else is
   * `false`.
   *
   * @param value - The value to parse.
   * @returns `true` when the value matches a recognized truthy token.
   *
   * @example
   * booleans.parse("YES"); // true
   * booleans.parse(" on "); // true
   * booleans.parse(0); // false
   */
  parse(value: unknown): boolean {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value === 1;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return (
        normalized === "true" ||
        normalized === "1" ||
        normalized === "yes" ||
        normalized === "y" ||
        normalized === "on"
      );
    }
    return false;
  },

  /**
   * Report whether a value is truthy under JavaScript coercion rules.
   *
   * @param value - The value to test.
   * @returns `true` when `Boolean(value)` is `true`.
   *
   * @example
   * booleans.isTruthy("hello"); // true
   * booleans.isTruthy(""); // false
   */
  isTruthy(value: unknown): boolean {
    return Boolean(value);
  },

  /**
   * Logical exclusive-or of two booleans.
   *
   * @param a - First operand.
   * @param b - Second operand.
   * @returns `true` when exactly one operand is `true`.
   *
   * @example
   * booleans.xor(true, false); // true
   * booleans.xor(true, true); // false
   */
  xor(a: boolean, b: boolean): boolean {
    return a !== b;
  },

  /**
   * Determine whether every value is `true`.
   *
   * @param values - Source array of booleans (not mutated).
   * @returns `true` when all values are `true` (vacuously `true` when empty).
   *
   * @example
   * booleans.allTrue([true, true]); // true
   */
  allTrue(values: readonly boolean[]): boolean {
    return values.every((value) => value);
  },

  /**
   * Determine whether at least one value is `true`.
   *
   * @param values - Source array of booleans (not mutated).
   * @returns `true` when any value is `true` (`false` when empty).
   *
   * @example
   * booleans.anyTrue([false, true]); // true
   */
  anyTrue(values: readonly boolean[]): boolean {
    return values.some((value) => value);
  },

  /**
   * Determine whether no value is `true`.
   *
   * @param values - Source array of booleans (not mutated).
   * @returns `true` when every value is `false` (vacuously `true` when empty).
   *
   * @example
   * booleans.noneTrue([false, false]); // true
   */
  noneTrue(values: readonly boolean[]): boolean {
    return !values.some((value) => value);
  },

  /**
   * Return the logical negation of a boolean.
   *
   * @param value - The value to toggle.
   * @returns The inverted boolean.
   *
   * @example
   * booleans.toggle(true); // false
   */
  toggle(value: boolean): boolean {
    return !value;
  },
};
