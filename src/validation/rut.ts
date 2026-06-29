/**
 * Helpers for the Chilean RUT (Rol Único Tributario), covering normalization,
 * verification-digit computation, validation, formatting and random
 * generation. None of these mutate their inputs.
 */
export const rut = {
  /**
   * Normalize a RUT string by removing dots, hyphens and whitespace and
   * uppercasing the verification digit.
   *
   * @param value - The raw RUT string.
   * @returns The cleaned RUT (digits plus an optional trailing `K`).
   *
   * @example
   * rut.clean("12.345.678-5"); // "123456785"
   */
  clean(value: string): string {
    return value.replace(/[.\-\s]/g, "").toUpperCase();
  },

  /**
   * Compute the verification digit for a RUT body using the modulo-11
   * algorithm, cycling the multipliers 2..7 from right to left.
   *
   * @param body - The RUT body (digits only, without the verification digit).
   * @returns The verification digit as `"0"`-`"9"` or `"K"`.
   *
   * @example
   * rut.computeDv("12345678"); // "5"
   */
  computeDv(body: string): string {
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const remainder = 11 - (sum % 11);
    if (remainder === 11) {
      return "0";
    }
    if (remainder === 10) {
      return "K";
    }
    return String(remainder);
  },

  /**
   * Validate a RUT by cleaning it, splitting body and verification digit,
   * checking the format, and comparing the digit against the computed value.
   * The verification digit is compared case-insensitively.
   *
   * @param value - The raw RUT string.
   * @returns `true` when the RUT is well-formed and the digit matches.
   *
   * @example
   * rut.validate("12.345.678-5"); // true
   */
  validate(value: string): boolean {
    const cleaned = rut.clean(value);
    if (cleaned.length < 2) {
      return false;
    }
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    if (!/^\d+$/.test(body) || !/^[0-9K]$/.test(dv)) {
      return false;
    }
    return rut.computeDv(body) === dv;
  },

  /**
   * Format a RUT with thousands dots and a hyphen before the verification
   * digit. When the cleaned value is too short to contain both a body and a
   * digit, the cleaned (unformatted) value is returned instead.
   *
   * @param value - The raw RUT string.
   * @returns The formatted RUT, e.g. `"12.345.678-5"`.
   *
   * @example
   * rut.format("123456785"); // "12.345.678-5"
   */
  format(value: string): string {
    const cleaned = rut.clean(value);
    if (cleaned.length < 2) {
      return cleaned;
    }
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    const groupedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${groupedBody}-${dv}`;
  },

  /**
   * Generate a random, valid RUT with a 7- or 8-digit body and its computed
   * verification digit, returned in formatted form.
   *
   * @returns A randomly generated valid RUT, e.g. `"12.345.678-5"`.
   *
   * @example
   * rut.random(); // e.g. "7.654.321-6"
   */
  random(): string {
    const min = 1_000_000;
    const max = 99_999_999;
    const bodyNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    const body = String(bodyNumber);
    const dv = rut.computeDv(body);
    return rut.format(`${body}${dv}`);
  },
};

/**
 * Validate a Chilean RUT. Thin wrapper that delegates to {@link rut.validate}.
 *
 * @param value - The raw RUT string.
 * @returns `true` when the RUT is valid.
 *
 * @example
 * isValidRut("12.345.678-5"); // true
 */
export function isValidRut(value: string): boolean {
  return rut.validate(value);
}
