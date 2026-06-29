/**
 * Date helpers for formatting, arithmetic, comparison and boundary
 * calculations. Every method that accepts a `Date` treats it as immutable and
 * returns a new `Date` (or scalar) rather than mutating the argument.
 */
export const dates = {
  /**
   * Format a date using a token pattern (inverse of {@link parse}). Tokens:
   * `YYYY`/`YY` year, `MMMM`/`MMM`/`MM`/`M` month (names use `locale`),
   * `DD`/`D` day, `dddd`/`ddd` weekday, `HH`/`H` 24h, `hh`/`h` 12h, `mm`/`m`
   * minutes, `ss`/`s` seconds, `SSS` millis, `A`/`a` AM/PM. Local time zone.
   *
   * @example
   * dates.format(new Date(2024, 0, 5, 9, 7, 3), "YYYY-MM-DD HH:mm:ss"); // "2024-01-05 09:07:03"
   * dates.format(new Date(2024, 0, 5), "DD MMM YYYY", "es");            // "05 ene 2024"
   */
  format(date: Date, pattern: string, locale = "en"): string {
    const pad = (value: number, length = 2): string => String(value).padStart(length, "0");
    const hour12 = date.getHours() % 12 || 12;
    const name = (options: Intl.DateTimeFormatOptions): string =>
      new Intl.DateTimeFormat(locale, options).format(date);
    const map: Record<string, string> = {
      YYYY: pad(date.getFullYear(), 4),
      YY: pad(date.getFullYear() % 100),
      MMMM: name({ month: "long" }),
      MMM: name({ month: "short" }),
      MM: pad(date.getMonth() + 1),
      M: String(date.getMonth() + 1),
      DD: pad(date.getDate()),
      D: String(date.getDate()),
      dddd: name({ weekday: "long" }),
      ddd: name({ weekday: "short" }),
      HH: pad(date.getHours()),
      H: String(date.getHours()),
      hh: pad(hour12),
      h: String(hour12),
      mm: pad(date.getMinutes()),
      m: String(date.getMinutes()),
      ss: pad(date.getSeconds()),
      s: String(date.getSeconds()),
      SSS: pad(date.getMilliseconds(), 3),
      A: date.getHours() < 12 ? "AM" : "PM",
      a: date.getHours() < 12 ? "am" : "pm",
    };
    return pattern.replace(
      /YYYY|MMMM|dddd|SSS|MMM|ddd|YY|MM|DD|HH|hh|mm|ss|M|D|H|h|m|s|A|a/g,
      (token) => (token in map ? map[token] : token),
    );
  },

  /**
   * Parse a string into a `Date` using a token pattern (inverse of
   * {@link format}). Numeric tokens: `YYYY`, `YY`, `MM`, `M`, `DD`, `D`,
   * `HH`, `H`, `mm`, `m`, `ss`, `s`, `SSS`. Returns `null` if the input does
   * not match. Interpreted in the local time zone.
   *
   * @example
   * dates.parse("05/01/2024 09:07", "DD/MM/YYYY HH:mm"); // 2024-01-05 09:07
   */
  parse(input: string, pattern: string): Date | null {
    const tokens = ["YYYY", "SSS", "YY", "MM", "DD", "HH", "mm", "ss", "M", "D", "H", "m", "s"];
    const groups: Record<string, string> = {
      YYYY: "(\\d{4})", YY: "(\\d{2})", SSS: "(\\d{3})",
      MM: "(\\d{2})", M: "(\\d{1,2})", DD: "(\\d{2})", D: "(\\d{1,2})",
      HH: "(\\d{2})", H: "(\\d{1,2})", mm: "(\\d{2})", m: "(\\d{1,2})",
      ss: "(\\d{2})", s: "(\\d{1,2})",
    };
    const fields: string[] = [];
    let regex = "";
    let i = 0;
    while (i < pattern.length) {
      const token = tokens.find((t) => pattern.startsWith(t, i));
      if (token) {
        regex += groups[token];
        fields.push(token);
        i += token.length;
      } else {
        regex += pattern[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        i++;
      }
    }
    const match = new RegExp("^" + regex + "$").exec(input);
    if (!match) return null;
    const parts = { year: 1970, month: 0, day: 1, hour: 0, minute: 0, second: 0, ms: 0 };
    fields.forEach((token, index) => {
      const value = parseInt(match[index + 1], 10);
      if (token === "YYYY") parts.year = value;
      else if (token === "YY") parts.year = value < 70 ? 2000 + value : 1900 + value;
      else if (token === "MM" || token === "M") parts.month = value - 1;
      else if (token === "DD" || token === "D") parts.day = value;
      else if (token === "HH" || token === "H") parts.hour = value;
      else if (token === "mm" || token === "m") parts.minute = value;
      else if (token === "ss" || token === "s") parts.second = value;
      else if (token === "SSS") parts.ms = value;
    });
    const result = new Date(parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second, parts.ms);
    return Number.isNaN(result.getTime()) ? null : result;
  },

  /** Convert Unix epoch seconds to a `Date`. */
  fromUnix(seconds: number): Date {
    return new Date(seconds * 1000);
  },

  /** Convert a `Date` to Unix epoch seconds. */
  toUnix(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  },

  /** Convert epoch milliseconds to a `Date`. */
  fromTimestamp(milliseconds: number): Date {
    return new Date(milliseconds);
  },

  /** Convert a `Date` to epoch milliseconds. */
  toTimestamp(date: Date): number {
    return date.getTime();
  },

  /**
   * Return a new date offset by a number of days.
   *
   * @param date - The base date (not mutated).
   * @param days - Days to add (may be negative).
   * @returns A new `Date`.
   *
   * @example
   * dates.addDays(new Date(2024, 0, 1), 5); // 2024-01-06
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * Return a new date offset by a number of months.
   *
   * @param date - The base date (not mutated).
   * @param months - Months to add (may be negative).
   * @returns A new `Date`.
   *
   * @example
   * dates.addMonths(new Date(2024, 0, 31), 1); // 2024-02-29 or 03-02 per JS rules
   */
  addMonths(date: Date, months: number): Date {
    const result = new Date(date.getTime());
    result.setMonth(result.getMonth() + months);
    return result;
  },

  /**
   * Return a new date offset by a number of hours.
   *
   * @param date - The base date (not mutated).
   * @param hours - Hours to add (may be negative).
   * @returns A new `Date`.
   *
   * @example
   * dates.addHours(new Date(2024, 0, 1, 10), 5); // 15:00 same day
   */
  addHours(date: Date, hours: number): Date {
    const result = new Date(date.getTime());
    result.setHours(result.getHours() + hours);
    return result;
  },

  /**
   * Return a new date offset by a number of minutes.
   *
   * @param date - The base date (not mutated).
   * @param minutes - Minutes to add (may be negative).
   * @returns A new `Date`.
   *
   * @example
   * dates.addMinutes(new Date(2024, 0, 1, 10, 0), 90); // 11:30
   */
  addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date.getTime());
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  },

  /**
   * Compute the whole-day difference `a - b`, based on each date's local
   * start of day.
   *
   * @param a - The later date (not mutated).
   * @param b - The earlier date (not mutated).
   * @returns The signed number of full days between the two dates.
   *
   * @example
   * dates.diffInDays(new Date(2024, 0, 10), new Date(2024, 0, 1)); // 9
   */
  diffInDays(a: Date, b: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const startA = dates.startOfDay(a).getTime();
    const startB = dates.startOfDay(b).getTime();
    return Math.round((startA - startB) / millisecondsPerDay);
  },

  /**
   * Compute the whole-hour difference `a - b`.
   *
   * @param a - The later date (not mutated).
   * @param b - The earlier date (not mutated).
   * @returns The signed number of full hours between the two dates.
   *
   * @example
   * dates.diffInHours(new Date(2024, 0, 1, 15), new Date(2024, 0, 1, 10)); // 5
   */
  diffInHours(a: Date, b: Date): number {
    const millisecondsPerHour = 60 * 60 * 1000;
    return Math.trunc((a.getTime() - b.getTime()) / millisecondsPerHour);
  },

  /**
   * Return a new date set to the start (00:00:00.000) of the given day.
   *
   * @param date - The base date (not mutated).
   * @returns A new `Date` at local midnight.
   *
   * @example
   * dates.startOfDay(new Date(2024, 0, 1, 13, 30)); // 2024-01-01 00:00:00
   */
  startOfDay(date: Date): Date {
    const result = new Date(date.getTime());
    result.setHours(0, 0, 0, 0);
    return result;
  },

  /**
   * Return a new date set to the end (23:59:59.999) of the given day.
   *
   * @param date - The base date (not mutated).
   * @returns A new `Date` at the final millisecond of the day.
   *
   * @example
   * dates.endOfDay(new Date(2024, 0, 1, 8)); // 2024-01-01 23:59:59.999
   */
  endOfDay(date: Date): Date {
    const result = new Date(date.getTime());
    result.setHours(23, 59, 59, 999);
    return result;
  },

  /**
   * Report whether a date falls on a Saturday or Sunday (local time).
   *
   * @param date - The date to test (not mutated).
   * @returns `true` for weekend days.
   *
   * @example
   * dates.isWeekend(new Date(2024, 0, 6)); // true (Saturday)
   */
  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  },

  /**
   * Report whether a year is a leap year (proleptic Gregorian rules).
   *
   * @param year - The full year.
   * @returns `true` when the year has 366 days.
   *
   * @example
   * dates.isLeapYear(2024); // true
   */
  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  },

  /**
   * Report whether two dates fall on the same calendar day (local time).
   *
   * @param a - First date (not mutated).
   * @param b - Second date (not mutated).
   * @returns `true` when both share the same year, month and day.
   *
   * @example
   * dates.isSameDay(new Date(2024, 0, 1, 8), new Date(2024, 0, 1, 20)); // true
   */
  isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  },

  /**
   * Return the number of days in a given month.
   *
   * @param year - The full year (used for February in leap years).
   * @param month - The month, 1-12.
   * @returns The day count for that month.
   *
   * @example
   * dates.daysInMonth(2024, 2); // 29
   */
  daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  },

  /**
   * Parse an ISO 8601 date string into a `Date`.
   *
   * @param iso - The ISO date/time string.
   * @returns The parsed `Date` (may be an `Invalid Date` if `iso` is malformed).
   *
   * @example
   * dates.parseISO("2024-01-05T09:07:03Z");
   */
  parseISO(iso: string): Date {
    return new Date(iso);
  },

  /**
   * Format a date as a `YYYY-MM-DD` string using its local calendar date.
   *
   * @param date - The date to format (not mutated).
   * @returns The `YYYY-MM-DD` representation.
   *
   * @example
   * dates.toISODate(new Date(2024, 0, 5)); // "2024-01-05"
   */
  toISODate(date: Date): string {
    return dates.format(date, "YYYY-MM-DD");
  },
};
