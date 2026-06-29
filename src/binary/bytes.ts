const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const HEX_ALPHABET = "0123456789abcdef";

/** Builds a lookup table mapping a hex character code to its nibble value. */
function buildHexLookup(): Int8Array {
  const table = new Int8Array(128).fill(-1);
  for (let i = 0; i < 10; i++) {
    table[48 + i] = i; // '0'..'9'
  }
  for (let i = 0; i < 6; i++) {
    table[97 + i] = 10 + i; // 'a'..'f'
    table[65 + i] = 10 + i; // 'A'..'F'
  }
  return table;
}

const HEX_LOOKUP = buildHexLookup();

/** Encodes `data` to a standard Base64 string. */
function encodeBase64(data: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(data).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

/** Decodes a Base64 string to bytes. */
function decodeBase64(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    const buffer = Buffer.from(b64, "base64");
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength).slice();
  }
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

/**
 * Pure helpers for inspecting and converting byte arrays.
 *
 * Every function treats its `Uint8Array` arguments as read-only and returns
 * fresh values without mutating the inputs. Base64 routines use Node's
 * {@link Buffer} when available and fall back to `btoa`/`atob` otherwise.
 */
export const bytes = {
  /**
   * Parses a hexadecimal string into bytes. Accepts upper- or lower-case
   * digits and an optional leading `0x`/`0X` prefix.
   *
   * @param hex - Hex string; its length (after any prefix) must be even.
   * @returns A new byte array.
   * @throws RangeError when the length is odd or a non-hex character is found.
   *
   * @example
   * bytes.fromHex("deadbeef"); // Uint8Array [222, 173, 190, 239]
   */
  fromHex(hex: string): Uint8Array {
    let start = 0;
    if (hex.length >= 2 && hex[0] === "0" && (hex[1] === "x" || hex[1] === "X")) {
      start = 2;
    }
    const span = hex.length - start;
    if (span % 2 !== 0) {
      throw new RangeError("hex string must have an even number of digits");
    }
    const out = new Uint8Array(span / 2);
    for (let i = 0; i < out.length; i++) {
      const hiChar = hex.charCodeAt(start + i * 2);
      const loChar = hex.charCodeAt(start + i * 2 + 1);
      const hi = hiChar < 128 ? HEX_LOOKUP[hiChar] : -1;
      const lo = loChar < 128 ? HEX_LOOKUP[loChar] : -1;
      if (hi < 0 || lo < 0) {
        throw new RangeError("invalid hex character");
      }
      out[i] = (hi << 4) | lo;
    }
    return out;
  },

  /**
   * Encodes bytes as a lower-case hexadecimal string.
   *
   * @param data - Source bytes (not mutated).
   * @returns The hex representation, two characters per byte.
   *
   * @example
   * bytes.toHex(new Uint8Array([255, 0, 16])); // "ff0010"
   */
  toHex(data: Uint8Array): string {
    let out = "";
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      out += HEX_ALPHABET[byte >> 4] + HEX_ALPHABET[byte & 0x0f];
    }
    return out;
  },

  /**
   * Decodes a Base64 string into bytes.
   *
   * @param b64 - Standard Base64 string.
   * @returns A new byte array.
   *
   * @example
   * bytes.fromBase64("aGk="); // Uint8Array [104, 105]
   */
  fromBase64(b64: string): Uint8Array {
    return decodeBase64(b64);
  },

  /**
   * Encodes bytes as a standard Base64 string.
   *
   * @param data - Source bytes (not mutated).
   * @returns The Base64 representation.
   *
   * @example
   * bytes.toBase64(new Uint8Array([104, 105])); // "aGk="
   */
  toBase64(data: Uint8Array): string {
    return encodeBase64(data);
  },

  /**
   * Encodes a string to its UTF-8 bytes.
   *
   * @param text - Source string.
   * @returns A new byte array.
   *
   * @example
   * bytes.fromUtf8("hi"); // Uint8Array [104, 105]
   */
  fromUtf8(text: string): Uint8Array {
    return textEncoder.encode(text);
  },

  /**
   * Decodes UTF-8 bytes back into a string.
   *
   * @param data - UTF-8 encoded bytes (not mutated).
   * @returns The decoded string.
   *
   * @example
   * bytes.toUtf8(new Uint8Array([104, 105])); // "hi"
   */
  toUtf8(data: Uint8Array): string {
    return textDecoder.decode(data);
  },

  /**
   * Concatenates several byte arrays into one.
   *
   * @param arrays - Source arrays (none mutated).
   * @returns A new byte array containing every input in order.
   *
   * @example
   * bytes.concat(new Uint8Array([1]), new Uint8Array([2, 3])); // [1, 2, 3]
   */
  concat(...arrays: Uint8Array[]): Uint8Array {
    let total = 0;
    for (let i = 0; i < arrays.length; i++) {
      total += arrays[i].byteLength;
    }
    const out = new Uint8Array(total);
    let offset = 0;
    for (let i = 0; i < arrays.length; i++) {
      out.set(arrays[i], offset);
      offset += arrays[i].byteLength;
    }
    return out;
  },

  /**
   * Tests two byte arrays for equality (same length and identical bytes).
   *
   * @param a - First array (not mutated).
   * @param b - Second array (not mutated).
   * @returns `true` when both arrays hold the same bytes.
   *
   * @example
   * bytes.equals(new Uint8Array([1, 2]), new Uint8Array([1, 2])); // true
   */
  equals(a: Uint8Array, b: Uint8Array): boolean {
    if (a === b) {
      return true;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  },

  /**
   * Lexicographically compares two byte arrays.
   *
   * @param a - First array (not mutated).
   * @param b - Second array (not mutated).
   * @returns A negative number when `a` sorts before `b`, a positive number
   * when after, and `0` when equal. Shorter arrays sort before longer ones when
   * they share a common prefix.
   *
   * @example
   * bytes.compare(new Uint8Array([1, 2]), new Uint8Array([1, 3])); // -1
   */
  compare(a: Uint8Array, b: Uint8Array): number {
    const min = Math.min(a.length, b.length);
    for (let i = 0; i < min; i++) {
      if (a[i] !== b[i]) {
        return a[i] < b[i] ? -1 : 1;
      }
    }
    if (a.length === b.length) {
      return 0;
    }
    return a.length < b.length ? -1 : 1;
  },

  /**
   * Computes the byte-wise XOR of two arrays.
   *
   * @param a - First array (not mutated).
   * @param b - Second array (not mutated).
   * @returns A new byte array whose length equals the shorter input.
   *
   * @example
   * bytes.xor(new Uint8Array([0x0f, 0xff]), new Uint8Array([0xf0])); // [0xff]
   */
  xor(a: Uint8Array, b: Uint8Array): Uint8Array {
    const length = Math.min(a.length, b.length);
    const out = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      out[i] = a[i] ^ b[i];
    }
    return out;
  },
};
