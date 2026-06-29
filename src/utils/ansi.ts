const ESC = "\x1b[";

/**
 * Wrap text with an SGR opening code and a reset code.
 *
 * @param open - The numeric SGR code that opens the style.
 * @param close - The numeric SGR code that resets the style.
 * @returns A function wrapping its argument with the escape sequences.
 */
function wrap(open: number, close: number): (text: string) => string {
  const prefix = `${ESC}${open}m`;
  const suffix = `${ESC}${close}m`;
  return (text: string): string => `${prefix}${text}${suffix}`;
}

const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

/**
 * Chalk-style ANSI helpers for colorizing and styling terminal text. Each
 * function wraps its argument with the corresponding SGR escape sequence and
 * the matching reset code; none mutate their input.
 *
 * @example
 * ansi.red("error"); // "\x1b[31merror\x1b[39m"
 * ansi.bold(ansi.green("ok")); // bold green text
 */
export const ansi = {
  /** Wrap text in black foreground color. */
  black: wrap(30, 39),
  /** Wrap text in red foreground color. */
  red: wrap(31, 39),
  /** Wrap text in green foreground color. */
  green: wrap(32, 39),
  /** Wrap text in yellow foreground color. */
  yellow: wrap(33, 39),
  /** Wrap text in blue foreground color. */
  blue: wrap(34, 39),
  /** Wrap text in magenta foreground color. */
  magenta: wrap(35, 39),
  /** Wrap text in cyan foreground color. */
  cyan: wrap(36, 39),
  /** Wrap text in white foreground color. */
  white: wrap(37, 39),
  /** Wrap text in gray (bright black) foreground color. */
  gray: wrap(90, 39),

  /** Wrap text with a black background. */
  bgBlack: wrap(40, 49),
  /** Wrap text with a red background. */
  bgRed: wrap(41, 49),
  /** Wrap text with a green background. */
  bgGreen: wrap(42, 49),
  /** Wrap text with a yellow background. */
  bgYellow: wrap(43, 49),
  /** Wrap text with a blue background. */
  bgBlue: wrap(44, 49),
  /** Wrap text with a magenta background. */
  bgMagenta: wrap(45, 49),
  /** Wrap text with a cyan background. */
  bgCyan: wrap(46, 49),
  /** Wrap text with a white background. */
  bgWhite: wrap(47, 49),

  /** Render text in bold (increased intensity). */
  bold: wrap(1, 22),
  /** Render text dimmed (decreased intensity). */
  dim: wrap(2, 22),
  /** Render text in italics. */
  italic: wrap(3, 23),
  /** Underline text. */
  underline: wrap(4, 24),
  /** Swap foreground and background colors. */
  inverse: wrap(7, 27),
  /** Render text with a line through it. */
  strikethrough: wrap(9, 29),

  /**
   * Remove every ANSI SGR escape sequence from a string.
   *
   * @param text - The string possibly containing ANSI escape sequences.
   * @returns The plain string with all ANSI codes stripped.
   *
   * @example
   * ansi.strip(ansi.red("x")); // "x"
   */
  strip(text: string): string {
    return text.replace(ANSI_PATTERN, "");
  },
};
