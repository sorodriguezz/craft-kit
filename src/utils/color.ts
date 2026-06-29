/**
 * Color helpers for converting between hex, RGB and HSL color models, plus
 * common manipulations (lighten, darken, mix) and WCAG contrast utilities.
 * None of these mutate their inputs.
 */
export const colors = {
  /**
   * Parse a hex color string into its red, green and blue channels.
   *
   * Accepts shorthand `#rgb` and full `#rrggbb` forms, with or without the
   * leading `"#"`. Returns `null` when the input is not a valid hex color.
   *
   * @param hex - The hex color string (e.g. `"#fff"`, `"00ff00"`).
   * @returns An `{ r, g, b }` object with channels in `[0, 255]`, or `null`.
   *
   * @example
   * colors.hexToRgb("#ff8800"); // { r: 255, g: 136, b: 0 }
   * colors.hexToRgb("#abc"); // { r: 170, g: 187, b: 204 }
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const normalized = hex.trim().replace(/^#/, "");
    const match = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(normalized);
    if (match === null) {
      return null;
    }
    const value = match[1];
    if (value.length === 3) {
      const r = parseInt(value[0] + value[0], 16);
      const g = parseInt(value[1] + value[1], 16);
      const b = parseInt(value[2] + value[2], 16);
      return { r, g, b };
    }
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return { r, g, b };
  },

  /**
   * Build a `#rrggbb` hex color string from red, green and blue channels.
   * Each channel is rounded and clamped to `[0, 255]`.
   *
   * @param r - Red channel.
   * @param g - Green channel.
   * @param b - Blue channel.
   * @returns A lowercase `#rrggbb` string.
   *
   * @example
   * colors.rgbToHex(255, 136, 0); // "#ff8800"
   */
  rgbToHex(r: number, g: number, b: number): string {
    const toHex = (channel: number): string => {
      const clamped = Math.max(0, Math.min(255, Math.round(channel)));
      return clamped.toString(16).padStart(2, "0");
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },

  /**
   * Convert RGB channels into the HSL color model.
   *
   * @param r - Red channel in `[0, 255]`.
   * @param g - Green channel in `[0, 255]`.
   * @param b - Blue channel in `[0, 255]`.
   * @returns An `{ h, s, l }` object where `h` is `[0, 360]` and `s`/`l` are
   * percentages in `[0, 100]`.
   *
   * @example
   * colors.rgbToHsl(255, 0, 0); // { h: 0, s: 100, l: 50 }
   */
  rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
      if (max === rn) {
        h = ((gn - bn) / delta) % 6;
      } else if (max === gn) {
        h = (bn - rn) / delta + 2;
      } else {
        h = (rn - gn) / delta + 4;
      }
      h *= 60;
      if (h < 0) {
        h += 360;
      }
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  },

  /**
   * Convert HSL values into RGB channels.
   *
   * @param h - Hue in `[0, 360]` (values outside are wrapped).
   * @param s - Saturation percentage in `[0, 100]`.
   * @param l - Lightness percentage in `[0, 100]`.
   * @returns An `{ r, g, b }` object with channels in `[0, 255]`.
   *
   * @example
   * colors.hslToRgb(0, 100, 50); // { r: 255, g: 0, b: 0 }
   */
  hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    const hue = ((h % 360) + 360) % 360;
    const sn = Math.max(0, Math.min(100, s)) / 100;
    const ln = Math.max(0, Math.min(100, l)) / 100;
    const c = (1 - Math.abs(2 * ln - 1)) * sn;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = ln - c / 2;
    let rp = 0;
    let gp = 0;
    let bp = 0;
    if (hue < 60) {
      rp = c;
      gp = x;
    } else if (hue < 120) {
      rp = x;
      gp = c;
    } else if (hue < 180) {
      gp = c;
      bp = x;
    } else if (hue < 240) {
      gp = x;
      bp = c;
    } else if (hue < 300) {
      rp = x;
      bp = c;
    } else {
      rp = c;
      bp = x;
    }
    return {
      r: Math.round((rp + m) * 255),
      g: Math.round((gp + m) * 255),
      b: Math.round((bp + m) * 255),
    };
  },

  /**
   * Convert a hex color string directly into HSL.
   *
   * @param hex - The hex color string (`#rgb` or `#rrggbb`, with or without `#`).
   * @returns An `{ h, s, l }` object, or `null` when the hex is invalid.
   *
   * @example
   * colors.hexToHsl("#ff0000"); // { h: 0, s: 100, l: 50 }
   */
  hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const rgb = colors.hexToRgb(hex);
    if (rgb === null) {
      return null;
    }
    return colors.rgbToHsl(rgb.r, rgb.g, rgb.b);
  },

  /**
   * Convert HSL values directly into a `#rrggbb` hex color string.
   *
   * @param h - Hue in `[0, 360]`.
   * @param s - Saturation percentage in `[0, 100]`.
   * @param l - Lightness percentage in `[0, 100]`.
   * @returns A lowercase `#rrggbb` string.
   *
   * @example
   * colors.hslToHex(0, 100, 50); // "#ff0000"
   */
  hslToHex(h: number, s: number, l: number): string {
    const rgb = colors.hslToRgb(h, s, l);
    return colors.rgbToHex(rgb.r, rgb.g, rgb.b);
  },

  /**
   * Lighten a hex color by increasing its HSL lightness.
   *
   * @param hex - The source hex color (`#rgb` or `#rrggbb`).
   * @param amount - Fraction in `[0, 1]` to add to the lightness (`0.1` = +10%).
   * @returns A lighter `#rrggbb` color, or the normalized input when invalid.
   *
   * @example
   * colors.lighten("#336699", 0.2);
   */
  lighten(hex: string, amount: number): string {
    const hsl = colors.hexToHsl(hex);
    if (hsl === null) {
      return hex;
    }
    const l = Math.max(0, Math.min(100, hsl.l + amount * 100));
    return colors.hslToHex(hsl.h, hsl.s, l);
  },

  /**
   * Darken a hex color by decreasing its HSL lightness.
   *
   * @param hex - The source hex color (`#rgb` or `#rrggbb`).
   * @param amount - Fraction in `[0, 1]` to subtract from the lightness.
   * @returns A darker `#rrggbb` color, or the input when invalid.
   *
   * @example
   * colors.darken("#336699", 0.2);
   */
  darken(hex: string, amount: number): string {
    return colors.lighten(hex, -amount);
  },

  /**
   * Blend two hex colors in RGB space.
   *
   * @param hex1 - The first hex color.
   * @param hex2 - The second hex color.
   * @param weight - Weight of `hex2` in `[0, 1]`. `0` returns `hex1`, `1`
   * returns `hex2`. Defaults to `0.5`.
   * @returns The mixed `#rrggbb` color. Falls back to whichever input parses
   * when the other is invalid.
   *
   * @example
   * colors.mix("#000000", "#ffffff"); // "#808080"
   */
  mix(hex1: string, hex2: string, weight = 0.5): string {
    const a = colors.hexToRgb(hex1);
    const b = colors.hexToRgb(hex2);
    if (a === null || b === null) {
      return a !== null ? colors.rgbToHex(a.r, a.g, a.b) : hex2;
    }
    const w = Math.max(0, Math.min(1, weight));
    return colors.rgbToHex(
      a.r + (b.r - a.r) * w,
      a.g + (b.g - a.g) * w,
      a.b + (b.b - a.b) * w,
    );
  },

  /**
   * Compute the WCAG relative luminance of a hex color.
   *
   * @param hex - The source hex color (`#rgb` or `#rrggbb`).
   * @returns The relative luminance in `[0, 1]`, or `0` when the hex is invalid.
   *
   * @example
   * colors.luminance("#ffffff"); // 1
   */
  luminance(hex: string): number {
    const rgb = colors.hexToRgb(hex);
    if (rgb === null) {
      return 0;
    }
    const channel = (value: number): number => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return (
      0.2126 * channel(rgb.r) +
      0.7152 * channel(rgb.g) +
      0.0722 * channel(rgb.b)
    );
  },

  /**
   * Compute the WCAG contrast ratio between two hex colors.
   *
   * @param hex1 - The first hex color.
   * @param hex2 - The second hex color.
   * @returns The contrast ratio in `[1, 21]`.
   *
   * @example
   * colors.contrastRatio("#000000", "#ffffff"); // 21
   */
  contrastRatio(hex1: string, hex2: string): number {
    const l1 = colors.luminance(hex1);
    const l2 = colors.luminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Report whether a value is a valid `#rgb` or `#rrggbb` hex color.
   * The leading `"#"` is optional.
   *
   * @param value - The string to test.
   * @returns `true` when the string is a valid hex color.
   *
   * @example
   * colors.isValidHex("#abc"); // true
   * colors.isValidHex("#1234"); // false
   */
  isValidHex(value: string): boolean {
    return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
  },

  /**
   * Generate a random `#rrggbb` hex color.
   *
   * @returns A random lowercase `#rrggbb` string.
   *
   * @example
   * colors.randomHex(); // e.g. "#3f9a1c"
   */
  randomHex(): string {
    const value = Math.floor(Math.random() * 0x1000000);
    return `#${value.toString(16).padStart(6, "0")}`;
  },
} as const;
