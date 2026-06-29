/**
 * Date helpers for formatting, arithmetic, comparison and boundary
 * calculations. Every method that accepts a `Date` treats it as immutable and
 * returns a new `Date` (or scalar) rather than mutating the argument.
 */
export const dates = {
  /**
   * Format a date using a token pattern. Supported tokens: `YYYY` (4-digit
   * year), `MM` (month), `DD` (day), `HH` (24-hour), `mm` (minutes), `ss`
   * (seconds). All numeric tokens are zero-padded. Values are read from the
   * local time zone.
   *
   * @param date - The date to format (not mutated).
   * @param pattern - The token pattern.
   * @returns The formatted string.
   *
   * @example
   * dates.format(new Date(2024, 0, 5, 9, 7, 3), "YYYY-MM-DD HH:mm:ss");
   * // "2024-01-05 09:07:03"
   */
  format(date: Date, pattern: string): string {
    const pad = (value: number): string => String(value).padStart(2, "0");
    const replacements: Record<string, string> = {
      YYYY: String(date.getFullYear()).padStart(4, "0"),
      MM: pad(date.getMonth() + 1),
      DD: pad(date.getDate()),
      HH: pad(date.getHours()),
      mm: pad(date.getMinutes()),
      ss: pad(date.getSeconds()),
    };
    return pattern.replace(
      /YYYY|MM|DD|HH|mm|ss/g,
      (token) => replacements[token] ?? token,
    );
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
