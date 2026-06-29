import { isEmail } from "./email";

const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NUMERIC_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)$/;
const ALPHA_PATTERN = /^[A-Za-z]+$/;
const ALPHANUMERIC_PATTERN = /^[A-Za-z0-9]+$/;
const INTEGER_PATTERN = /^[+-]?\d+$/;
const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const IPV4_OCTET = "(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)";
const IPV4_PATTERN = new RegExp(`^(?:${IPV4_OCTET}\\.){3}${IPV4_OCTET}$`);

/**
 * General-purpose string validators. None of these mutate their inputs.
 */
export const validators = {
  /**
   * Validate an email address.
   *
   * @param value - The candidate email address.
   * @returns `true` when the value looks like a valid email address.
   *
   * @example
   * validators.isEmail("user@example.com"); // true
   */
  isEmail(value: string): boolean {
    return isEmail(value);
  },

  /**
   * Validate an HTTP or HTTPS URL.
   *
   * @param value - The candidate URL.
   * @returns `true` when the value is a well-formed http(s) URL.
   *
   * @example
   * validators.isUrl("https://example.com/path"); // true
   */
  isUrl(value: string): boolean {
    return URL_PATTERN.test(value);
  },

  /**
   * Validate a version-4 UUID.
   *
   * @param value - The candidate UUID.
   * @returns `true` when the value is a valid v4 UUID (case-insensitive).
   *
   * @example
   * validators.isUuid("9b2e4f6a-1c3d-4e5f-8a9b-0c1d2e3f4a5b"); // true
   */
  isUuid(value: string): boolean {
    return UUID_V4_PATTERN.test(value);
  },

  /**
   * Report whether a string represents a numeric value (integer or decimal,
   * optionally signed).
   *
   * @param value - The candidate string.
   * @returns `true` when the value is numeric.
   *
   * @example
   * validators.isNumeric("-12.5"); // true
   */
  isNumeric(value: string): boolean {
    return NUMERIC_PATTERN.test(value);
  },

  /**
   * Report whether a string contains only ASCII letters.
   *
   * @param value - The candidate string.
   * @returns `true` when the value is non-empty and all-alphabetic.
   *
   * @example
   * validators.isAlpha("Hello"); // true
   */
  isAlpha(value: string): boolean {
    return ALPHA_PATTERN.test(value);
  },

  /**
   * Report whether a string contains only ASCII letters and digits.
   *
   * @param value - The candidate string.
   * @returns `true` when the value is non-empty and alphanumeric.
   *
   * @example
   * validators.isAlphanumeric("abc123"); // true
   */
  isAlphanumeric(value: string): boolean {
    return ALPHANUMERIC_PATTERN.test(value);
  },

  /**
   * Report whether a string represents an integer (optionally signed).
   *
   * @param value - The candidate string.
   * @returns `true` when the value is an integer literal.
   *
   * @example
   * validators.isInteger("-42"); // true
   */
  isInteger(value: string): boolean {
    return INTEGER_PATTERN.test(value);
  },

  /**
   * Validate a CSS hex color (`#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`).
   *
   * @param value - The candidate color string.
   * @returns `true` when the value is a valid hex color.
   *
   * @example
   * validators.isHexColor("#1a2b3c"); // true
   */
  isHexColor(value: string): boolean {
    return HEX_COLOR_PATTERN.test(value);
  },

  /**
   * Validate an IPv4 address in dotted-decimal notation.
   *
   * @param value - The candidate address.
   * @returns `true` when the value is a valid IPv4 address.
   *
   * @example
   * validators.isIpv4("192.168.0.1"); // true
   */
  isIpv4(value: string): boolean {
    return IPV4_PATTERN.test(value);
  },

  /**
   * Report whether a string is parseable as JSON.
   *
   * @param value - The candidate JSON string.
   * @returns `true` when `JSON.parse` succeeds.
   *
   * @example
   * validators.isJson('{"ok":true}'); // true
   */
  isJson(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Report whether a value is empty: `null`, `undefined`, an empty string, or
   * a string of only whitespace.
   *
   * @param value - The candidate value.
   * @returns `true` when the value is considered empty.
   *
   * @example
   * validators.isEmpty("   "); // true
   * validators.isEmpty(null); // true
   */
  isEmpty(value: string | null | undefined): boolean {
    return value === null || value === undefined || value.trim().length === 0;
  },
};
