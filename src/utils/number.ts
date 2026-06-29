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

  /**
   * Convert an integer to its Roman numeral representation.
   *
   * @param n - An integer in the inclusive range `[1, 3999]`.
   * @returns The Roman numeral string.
   * @throws {RangeError} When `n` is not an integer in `[1, 3999]`.
   *
   * @example
   * numbers.toRoman(1990); // "MCMXC"
   * numbers.toRoman(4); // "IV"
   */
  toRoman(n: number): string {
    if (!Number.isInteger(n) || n < 1 || n > 3999) {
      throw new RangeError("toRoman expects an integer in [1, 3999]");
    }
    const table: Array<[number, string]> = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let remaining = n;
    let result = "";
    for (const [value, symbol] of table) {
      while (remaining >= value) {
        result += symbol;
        remaining -= value;
      }
    }
    return result;
  },

  /**
   * Parse a Roman numeral string into its integer value.
   *
   * Parsing is case-insensitive and tolerant of surrounding whitespace.
   *
   * @param roman - The Roman numeral string (e.g. `"MCMXC"`).
   * @returns The integer value.
   * @throws {Error} When the string contains characters that are not Roman
   * numeral symbols.
   *
   * @example
   * numbers.fromRoman("MCMXC"); // 1990
   * numbers.fromRoman("IV"); // 4
   */
  fromRoman(roman: string): number {
    const values: Record<string, number> = {
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000,
    };
    const normalized = roman.trim().toUpperCase();
    let total = 0;
    for (let i = 0; i < normalized.length; i++) {
      const current = values[normalized[i]];
      if (current === undefined) {
        throw new Error(`Invalid Roman numeral: ${roman}`);
      }
      const next = i + 1 < normalized.length ? values[normalized[i + 1]] : undefined;
      if (next !== undefined && current < next) {
        total -= current;
      } else {
        total += current;
      }
    }
    return total;
  },

  /**
   * Format an integer as an English ordinal string.
   *
   * @param n - The integer to format.
   * @returns The ordinal string (e.g. `"1st"`, `"22nd"`, `"-3rd"`).
   *
   * @example
   * numbers.toOrdinal(1); // "1st"
   * numbers.toOrdinal(21); // "21st"
   * numbers.toOrdinal(13); // "13th"
   */
  toOrdinal(n: number): string {
    const absolute = Math.abs(n);
    const lastTwo = absolute % 100;
    const lastOne = absolute % 10;
    let suffix = "th";
    if (lastTwo < 11 || lastTwo > 13) {
      if (lastOne === 1) {
        suffix = "st";
      } else if (lastOne === 2) {
        suffix = "nd";
      } else if (lastOne === 3) {
        suffix = "rd";
      }
    }
    return `${n}${suffix}`;
  },

  /**
   * Spell out an integer in English words.
   *
   * Supports negative values and magnitudes up to the short-scale billions.
   * Any fractional part of the input is truncated toward zero.
   *
   * @param n - The integer to convert.
   * @returns The English-language representation.
   *
   * @example
   * numbers.toWords(0); // "zero"
   * numbers.toWords(-42); // "negative forty-two"
   * numbers.toWords(1234); // "one thousand two hundred thirty-four"
   */
  toWords(n: number): string {
    if (!Number.isFinite(n)) {
      return String(n);
    }
    const value = Math.trunc(n);
    if (value === 0) {
      return "zero";
    }

    const ones = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    const scales = ["", "thousand", "million", "billion", "trillion"];

    const threeDigits = (group: number): string => {
      const parts: string[] = [];
      const hundreds = Math.floor(group / 100);
      const rest = group % 100;
      if (hundreds > 0) {
        parts.push(`${ones[hundreds]} hundred`);
      }
      if (rest > 0) {
        if (rest < 20) {
          parts.push(ones[rest]);
        } else {
          const tensDigit = Math.floor(rest / 10);
          const onesDigit = rest % 10;
          parts.push(
            onesDigit > 0
              ? `${tens[tensDigit]}-${ones[onesDigit]}`
              : tens[tensDigit],
          );
        }
      }
      return parts.join(" ");
    };

    const negative = value < 0;
    let remaining = Math.abs(value);
    const groups: number[] = [];
    while (remaining > 0) {
      groups.push(remaining % 1000);
      remaining = Math.floor(remaining / 1000);
    }

    const words: string[] = [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const group = groups[i];
      if (group === 0) {
        continue;
      }
      const chunk = threeDigits(group);
      const scale = scales[i];
      words.push(scale.length > 0 ? `${chunk} ${scale}` : chunk);
    }

    const result = words.join(" ");
    return negative ? `negative ${result}` : result;
  },

  /**
   * Linearly interpolate between two values.
   *
   * @param a - The start value (returned when `t` is `0`).
   * @param b - The end value (returned when `t` is `1`).
   * @param t - The interpolation factor. Values outside `[0, 1]` extrapolate.
   * @returns The interpolated value `a + (b - a) * t`.
   *
   * @example
   * numbers.lerp(0, 10, 0.5); // 5
   */
  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  },

  /**
   * Re-map a value from one numeric range to another.
   *
   * @param value - The value to re-map.
   * @param inMin - Lower bound of the input range.
   * @param inMax - Upper bound of the input range.
   * @param outMin - Lower bound of the output range.
   * @param outMax - Upper bound of the output range.
   * @returns The value scaled into the output range. Returns `outMin` when the
   * input range has zero width.
   *
   * @example
   * numbers.mapRange(5, 0, 10, 0, 100); // 50
   */
  mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
  ): number {
    if (inMax === inMin) {
      return outMin;
    }
    return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
  },

  /**
   * Normalize a value within `[min, max]` to the unit range `[0, 1]`.
   *
   * @param value - The value to normalize.
   * @param min - Lower bound of the range.
   * @param max - Upper bound of the range.
   * @returns The normalized value in `[0, 1]`. Returns `0` when the range has
   * zero width.
   *
   * @example
   * numbers.normalize(5, 0, 10); // 0.5
   */
  normalize(value: number, min: number, max: number): number {
    if (max === min) {
      return 0;
    }
    return (value - min) / (max - min);
  },

  /**
   * Round a value to a fixed number of decimal places.
   *
   * @param value - The value to round.
   * @param decimals - Number of decimal places.
   * @returns The rounded value.
   *
   * @example
   * numbers.roundTo(3.14159, 2); // 3.14
   */
  roundTo(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  },
};
