/**
 * Duration helpers for parsing, formatting and decomposing millisecond spans.
 * Supported units are days (`d`), hours (`h`), minutes (`m`), seconds (`s`) and
 * milliseconds (`ms`). None of these functions mutate their inputs.
 */

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const UNIT_TO_MS: Record<string, number> = {
  d: MS_PER_DAY,
  h: MS_PER_HOUR,
  m: MS_PER_MINUTE,
  s: MS_PER_SECOND,
  ms: 1,
};

export const duration = {
  /**
   * Parse a human-friendly duration string into milliseconds.
   *
   * Accepts one or more `<number><unit>` segments, optionally separated by
   * spaces, where the unit is one of `d`, `h`, `m`, `s` or `ms` (`m` is
   * minutes, `ms` is milliseconds). Segments are summed.
   *
   * @param input - The duration string (e.g. `"1h30m"`, `"2d"`, `"500ms"`).
   * @returns The total number of milliseconds. Returns `0` when no recognizable
   * segment is found.
   *
   * @example
   * duration.parse("1h30m"); // 5400000
   * duration.parse("1h 30m 15s"); // 5415000
   * duration.parse("90s"); // 90000
   */
  parse(input: string): number {
    let total = 0;
    const regex = /(-?\d+(?:\.\d+)?)\s*(ms|d|h|m|s)/g;
    let match: RegExpExecArray | null = regex.exec(input);
    while (match !== null) {
      const amount = Number(match[1]);
      const unit = match[2];
      const factor = UNIT_TO_MS[unit];
      if (factor !== undefined && Number.isFinite(amount)) {
        total += amount * factor;
      }
      match = regex.exec(input);
    }
    return total;
  },

  /**
   * Format a millisecond duration into a compact, space-separated string.
   *
   * Only non-zero units are emitted, ordered from days down to milliseconds.
   * A zero duration formats as `"0ms"`. Negative durations are prefixed with
   * `"-"`.
   *
   * @param ms - The duration in milliseconds.
   * @returns The formatted string (e.g. `"1h 30m"`).
   *
   * @example
   * duration.format(5400000); // "1h 30m"
   * duration.format(0); // "0ms"
   */
  format(ms: number): string {
    if (!Number.isFinite(ms)) {
      return "0ms";
    }
    const sign = ms < 0 ? "-" : "";
    let remaining = Math.floor(Math.abs(ms));
    const segments: Array<[string, number]> = [
      ["d", MS_PER_DAY],
      ["h", MS_PER_HOUR],
      ["m", MS_PER_MINUTE],
      ["s", MS_PER_SECOND],
      ["ms", 1],
    ];
    const parts: string[] = [];
    for (const [label, size] of segments) {
      if (remaining >= size) {
        const quantity = Math.floor(remaining / size);
        remaining -= quantity * size;
        parts.push(`${quantity}${label}`);
      }
    }
    return sign + (parts.length > 0 ? parts.join(" ") : "0ms");
  },

  /**
   * Decompose a millisecond duration into whole days, hours, minutes, seconds
   * and milliseconds.
   *
   * @param ms - The duration in milliseconds.
   * @returns An object with the `days`, `hours`, `minutes`, `seconds` and
   * `milliseconds` components. Components are always non-negative; use the sign
   * of the original `ms` separately if needed.
   *
   * @example
   * duration.toObject(5415000);
   * // { days: 0, hours: 1, minutes: 30, seconds: 15, milliseconds: 0 }
   */
  toObject(ms: number): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
  } {
    let remaining = Math.floor(Math.abs(ms));
    const days = Math.floor(remaining / MS_PER_DAY);
    remaining -= days * MS_PER_DAY;
    const hours = Math.floor(remaining / MS_PER_HOUR);
    remaining -= hours * MS_PER_HOUR;
    const minutes = Math.floor(remaining / MS_PER_MINUTE);
    remaining -= minutes * MS_PER_MINUTE;
    const seconds = Math.floor(remaining / MS_PER_SECOND);
    remaining -= seconds * MS_PER_SECOND;
    return { days, hours, minutes, seconds, milliseconds: remaining };
  },

  /**
   * Build a millisecond duration from its component parts. Missing components
   * default to `0`.
   *
   * @param parts - The duration components.
   * @returns The total number of milliseconds.
   *
   * @example
   * duration.fromObject({ hours: 1, minutes: 30 }); // 5400000
   */
  fromObject(parts: {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
  }): number {
    const {
      days = 0,
      hours = 0,
      minutes = 0,
      seconds = 0,
      milliseconds = 0,
    } = parts;
    return (
      days * MS_PER_DAY +
      hours * MS_PER_HOUR +
      minutes * MS_PER_MINUTE +
      seconds * MS_PER_SECOND +
      milliseconds
    );
  },
} as const;
