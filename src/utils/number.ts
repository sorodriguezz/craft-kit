/**
 * Numeric helpers for clamping, rounding, ranges, parity checks, randomness,
 * aggregation and formatting. None of these mutate their inputs.
 */
export const numbers = {
  /**
   * Constrain a value to the inclusive `[minimum, maximum]` range.
   *
   * @param value - The value to clamp.
   * @param minimum - Lower bound (inclusive).
   * @param maximum - Upper bound (inclusive).
   * @returns `value` bounded to the range.
   *
   * @example
   * numbers.clamp(15, 0, 10); // 10
   */
  clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
  },

  /**
   * Round a value to a fixed number of decimal places.
   *
   * @param value - The value to round.
   * @param decimals - Number of decimal places. Defaults to `0`.
   * @returns The rounded value.
   *
   * @example
   * numbers.round(3.14159, 2); // 3.14
   */
  round(value: number, decimals = 0): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  },

  /**
   * Check whether a value falls within `[minInclusive, maxExclusive)`.
   *
   * @param value - The value to test.
   * @param minInclusive - Lower bound (inclusive).
   * @param maxExclusive - Upper bound (exclusive).
   * @returns `true` when `minInclusive <= value < maxExclusive`.
   *
   * @example
   * numbers.inRange(5, 0, 10); // true
   * numbers.inRange(10, 0, 10); // false
   */
  inRange(value: number, minInclusive: number, maxExclusive: number): boolean {
    return value >= minInclusive && value < maxExclusive;
  },

  /**
   * Determine whether an integer is even.
   *
   * @param n - The number to test.
   * @returns `true` when `n` is divisible by two.
   *
   * @example
   * numbers.isEven(4); // true
   */
  isEven(n: number): boolean {
    return n % 2 === 0;
  },

  /**
   * Determine whether an integer is odd.
   *
   * @param n - The number to test.
   * @returns `true` when `n` is not divisible by two.
   *
   * @example
   * numbers.isOdd(3); // true
   */
  isOdd(n: number): boolean {
    return Math.abs(n % 2) === 1;
  },

  /**
   * Determine whether a value is an integer.
   *
   * @param n - The number to test.
   * @returns `true` when `n` has no fractional component.
   *
   * @example
   * numbers.isInteger(42); // true
   */
  isInteger(n: number): boolean {
    return Number.isInteger(n);
  },

  /**
   * Generate a random integer within an inclusive range.
   *
   * @param minInclusive - Lower bound (inclusive).
   * @param maxInclusive - Upper bound (inclusive).
   * @returns A pseudo-random integer in `[minInclusive, maxInclusive]`.
   *
   * @example
   * numbers.randomInt(1, 6); // e.g. 4
   */
  randomInt(minInclusive: number, maxInclusive: number): number {
    const low = Math.ceil(minInclusive);
    const high = Math.floor(maxInclusive);
    return Math.floor(Math.random() * (high - low + 1)) + low;
  },

  /**
   * Sum all values in the array.
   *
   * @param values - Source array of numbers (not mutated).
   * @returns The sum, or `0` for an empty array.
   *
   * @example
   * numbers.sum([1, 2, 3]); // 6
   */
  sum(values: readonly number[]): number {
    let total = 0;
    for (const value of values) {
      total += value;
    }
    return total;
  },

  /**
   * Compute the arithmetic mean of the array.
   *
   * @param values - Source array of numbers (not mutated).
   * @returns The average, or `NaN` for an empty array.
   *
   * @example
   * numbers.average([2, 4, 6]); // 4
   */
  average(values: readonly number[]): number {
    if (values.length === 0) {
      return NaN;
    }
    return numbers.sum(values) / values.length;
  },

  /**
   * Compute what percentage `part` is of `total`.
   *
   * @param part - The portion value.
   * @param total - The whole value.
   * @returns The percentage, or `0` when `total` is `0`.
   *
   * @example
   * numbers.percentage(25, 200); // 12.5
   */
  percentage(part: number, total: number): number {
    if (total === 0) {
      return 0;
    }
    return (part / total) * 100;
  },

  /**
   * Format an integer with grouped thousands.
   *
   * @param value - The number to format. The integer part is grouped; any
   * fractional part is preserved using a dot as the decimal mark.
   * @param separator - Thousands separator. Defaults to `"."`.
   * @returns The formatted string.
   *
   * @example
   * numbers.formatThousands(1234567); // "1.234.567"
   * numbers.formatThousands(1234567, ","); // "1,234,567"
   */
  formatThousands(value: number, separator = "."): string {
    const sign = value < 0 ? "-" : "";
    const absolute = Math.abs(value);
    const [integerPart, fractionPart] = String(absolute).split(".");
    const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return fractionPart !== undefined
      ? `${sign}${grouped}.${fractionPart}`
      : `${sign}${grouped}`;
  },
};
