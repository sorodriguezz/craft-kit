const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate an email address with a practical (non-RFC-exhaustive) pattern:
 * a local part, an `@`, a domain, and a dotted top-level segment, with no
 * whitespace anywhere.
 *
 * @param value - The candidate email address.
 * @returns `true` when the value looks like a valid email address.
 *
 * @example
 * isEmail("user@example.com"); // true
 * isEmail("user @example.com"); // false
 */
export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}
