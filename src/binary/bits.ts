const WORD_BITS = 32;

/**
 * Bit-level helpers operating on 32-bit unsigned integers.
 *
 * Every input is coerced with `>>> 0`, so numbers are treated as unsigned
 * 32-bit values and all results are likewise unsigned (in the range
 * `0 .. 2**32 - 1`). Functions are pure and never mutate their arguments.
 */
export const bits = {
  /**
   * Counts the set bits (Hamming weight / population count) of `n`.
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @returns The number of 1 bits, between 0 and 32.
   *
   * @example
   * bits.popcount(0b10110); // 3
   */
  popcount(n: number): number {
    let v = n >>> 0;
    v = v - ((v >>> 1) & 0x55555555);
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
    v = (v + (v >>> 4)) & 0x0f0f0f0f;
    return (v * 0x01010101) >>> 24;
  },

  /**
   * Counts the leading zero bits of `n` (from the most significant bit).
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @returns The number of leading zeros, 0 to 32 (32 when `n` is 0).
   *
   * @example
   * bits.leadingZeros(1); // 31
   */
  leadingZeros(n: number): number {
    return Math.clz32(n >>> 0);
  },

  /**
   * Counts the trailing zero bits of `n` (from the least significant bit).
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @returns The number of trailing zeros, 0 to 32 (32 when `n` is 0).
   *
   * @example
   * bits.trailingZeros(0b11000); // 3
   */
  trailingZeros(n: number): number {
    const v = n >>> 0;
    if (v === 0) {
      return WORD_BITS;
    }
    return 31 - Math.clz32(v & -v);
  },

  /**
   * Returns `n` with the bit at position `i` set to 1.
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @param i - Bit position, 0 (least significant) to 31.
   * @returns The updated unsigned value.
   *
   * @example
   * bits.setBit(0, 3); // 8
   */
  setBit(n: number, i: number): number {
    return (n | (1 << i)) >>> 0;
  },

  /**
   * Returns `n` with the bit at position `i` cleared to 0.
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @param i - Bit position, 0 to 31.
   * @returns The updated unsigned value.
   *
   * @example
   * bits.clearBit(0b1111, 1); // 13
   */
  clearBit(n: number, i: number): number {
    return (n & ~(1 << i)) >>> 0;
  },

  /**
   * Returns `n` with the bit at position `i` flipped.
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @param i - Bit position, 0 to 31.
   * @returns The updated unsigned value.
   *
   * @example
   * bits.toggleBit(0b1010, 0); // 11
   */
  toggleBit(n: number, i: number): number {
    return (n ^ (1 << i)) >>> 0;
  },

  /**
   * Tests whether the bit at position `i` of `n` is set.
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @param i - Bit position, 0 to 31.
   * @returns `true` when the bit is 1.
   *
   * @example
   * bits.testBit(0b100, 2); // true
   */
  testBit(n: number, i: number): boolean {
    return ((n >>> i) & 1) === 1;
  },

  /**
   * Rotates the 32 bits of `n` left by `count` positions, wrapping bits that
   * fall off the most significant end back to the least significant end.
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @param count - Rotation amount; reduced modulo 32 (may be negative).
   * @returns The rotated unsigned value.
   *
   * @example
   * bits.rotateLeft(0x80000000, 1); // 1
   */
  rotateLeft(n: number, count: number): number {
    const value = n >>> 0;
    const shift = ((count % WORD_BITS) + WORD_BITS) % WORD_BITS;
    if (shift === 0) {
      return value;
    }
    return ((value << shift) | (value >>> (WORD_BITS - shift))) >>> 0;
  },

  /**
   * Rotates the 32 bits of `n` right by `count` positions, wrapping bits that
   * fall off the least significant end back to the most significant end.
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @param count - Rotation amount; reduced modulo 32 (may be negative).
   * @returns The rotated unsigned value.
   *
   * @example
   * bits.rotateRight(1, 1); // 0x80000000
   */
  rotateRight(n: number, count: number): number {
    const value = n >>> 0;
    const shift = ((count % WORD_BITS) + WORD_BITS) % WORD_BITS;
    if (shift === 0) {
      return value;
    }
    return ((value >>> shift) | (value << (WORD_BITS - shift))) >>> 0;
  },

  /**
   * Formats `n` as a binary string, optionally zero-padded to `width` digits.
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @param width - Optional minimum length; the result is left-padded with `0`.
   * @returns The binary representation without a prefix.
   *
   * @example
   * bits.toBinaryString(5, 8); // "00000101"
   */
  toBinaryString(n: number, width?: number): string {
    const text = (n >>> 0).toString(2);
    if (width !== undefined && text.length < width) {
      return text.padStart(width, "0");
    }
    return text;
  },

  /**
   * Parses a binary string into an unsigned 32-bit integer. Accepts an optional
   * leading `0b`/`0B` prefix.
   *
   * @param text - String of `0`/`1` characters (after any prefix).
   * @returns The parsed unsigned value.
   * @throws RangeError when the string is empty or contains a non-binary digit.
   *
   * @example
   * bits.parseBinary("101"); // 5
   */
  parseBinary(text: string): number {
    let body = text;
    if (body.length >= 2 && body[0] === "0" && (body[1] === "b" || body[1] === "B")) {
      body = body.slice(2);
    }
    if (body.length === 0 || !/^[01]+$/.test(body)) {
      throw new RangeError("invalid binary string");
    }
    return parseInt(body, 2) >>> 0;
  },

  /**
   * Tests whether `n` is a power of two (exactly one bit set).
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @returns `true` for 1, 2, 4, 8, ...; `false` for 0 and non-powers.
   *
   * @example
   * bits.isPowerOfTwo(16); // true
   */
  isPowerOfTwo(n: number): boolean {
    const v = n >>> 0;
    return v !== 0 && (v & (v - 1)) === 0;
  },

  /**
   * Returns the smallest power of two greater than or equal to `n`.
   *
   * @param n - Value interpreted as an unsigned 32-bit integer.
   * @returns The next power of two; `1` for inputs of 0 or 1. The result is an
   * unsigned 32-bit value, so inputs above `2**31` saturate to 0 on overflow.
   *
   * @example
   * bits.nextPowerOfTwo(17); // 32
   */
  nextPowerOfTwo(n: number): number {
    let v = (n >>> 0) - 1;
    if (v <= 0) {
      return 1;
    }
    v |= v >>> 1;
    v |= v >>> 2;
    v |= v >>> 4;
    v |= v >>> 8;
    v |= v >>> 16;
    return (v + 1) >>> 0;
  },
};
