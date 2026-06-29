/**
 * Human-friendly formatters for sizes, durations, relative time and numbers.
 * Number/currency/percent and relative time use the built-in `Intl` APIs.
 */
export const format = {
  /** Formats a byte count as a human-readable size, e.g. 1024 -> "1 KB". */
  bytes(bytes: number, decimals = 2): string {
    if (!Number.isFinite(bytes)) return "0 B";
    const sign = bytes < 0 ? "-" : "";
    let n = Math.abs(bytes);
    const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let i = 0;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    const value = i === 0 ? n : Number(n.toFixed(decimals));
    return `${sign}${value} ${units[i]}`;
  },

  /** Formats a millisecond duration, e.g. 90000 -> "1m 30s". */
  duration(ms: number): string {
    if (!Number.isFinite(ms)) return "0ms";
    const sign = ms < 0 ? "-" : "";
    let n = Math.floor(Math.abs(ms));
    const units: Array<[string, number]> = [
      ["d", 86400000],
      ["h", 3600000],
      ["m", 60000],
      ["s", 1000],
      ["ms", 1],
    ];
    const parts: string[] = [];
    for (const [label, size] of units) {
      if (n >= size) {
        const q = Math.floor(n / size);
        n -= q * size;
        parts.push(`${q}${label}`);
      }
    }
    return sign + (parts.length > 0 ? parts.join(" ") : "0ms");
  },

  /** Locale-aware relative time, e.g. "hace 5 minutos". Defaults to Spanish. */
  relativeTime(
    date: Date | number,
    options: { base?: Date | number; locale?: string } = {}
  ): string {
    const { base = Date.now(), locale = "es" } = options;
    const target = typeof date === "number" ? date : date.getTime();
    const from = typeof base === "number" ? base : base.getTime();
    const diff = target - from;
    const abs = Math.abs(diff);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const sec = 1000, min = 60 * sec, hour = 60 * min, day = 24 * hour, week = 7 * day, month = 30 * day, year = 365 * day;
    if (abs < min) return rtf.format(Math.round(diff / sec), "second");
    if (abs < hour) return rtf.format(Math.round(diff / min), "minute");
    if (abs < day) return rtf.format(Math.round(diff / hour), "hour");
    if (abs < week) return rtf.format(Math.round(diff / day), "day");
    if (abs < month) return rtf.format(Math.round(diff / week), "week");
    if (abs < year) return rtf.format(Math.round(diff / month), "month");
    return rtf.format(Math.round(diff / year), "year");
  },

  /** Formats a number with Intl.NumberFormat. */
  number(value: number, options: Intl.NumberFormatOptions & { locale?: string } = {}): string {
    const { locale, ...rest } = options;
    return new Intl.NumberFormat(locale, rest).format(value);
  },

  /** Formats a number as currency, e.g. 1234.5 -> "$1,234.50". */
  currency(value: number, currency = "USD", locale = "en-US"): string {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  },

  /** Formats a 0..1 ratio as a percentage, e.g. 0.25 -> "25%". */
  percent(value: number, decimals = 0, locale = "en-US"): string {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },
} as const;
