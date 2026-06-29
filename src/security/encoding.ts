import { timingSafeEqual } from "node:crypto";

/** Encodes a UTF-8 string to standard Base64. */
export function base64Encode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64");
}

/** Decodes a standard Base64 string back to a UTF-8 string. */
export function base64Decode(input: string): string {
  return Buffer.from(input, "base64").toString("utf8");
}

/** Encodes a UTF-8 string to URL-safe Base64 (no padding). */
export function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

/** Decodes a URL-safe Base64 string back to a UTF-8 string. */
export function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

/** Encodes a UTF-8 string to lowercase hexadecimal. */
export function hexEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("hex");
}

/** Decodes a hexadecimal string back to a UTF-8 string. */
export function hexDecode(input: string): string {
  return Buffer.from(input, "hex").toString("utf8");
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Encodes bytes (or a UTF-8 string) to Base32 per RFC 4648, using the A-Z2-7
 * alphabet and '=' padding.
 */
export function base32Encode(input: string | Buffer): string {
  const buffer = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  if (buffer.length === 0) return "";

  let output = "";
  let bits = 0;
  let value = 0;

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  // Pad to a multiple of 8 characters per RFC 4648.
  while (output.length % 8 !== 0) {
    output += "=";
  }

  return output;
}

/**
 * Decodes a Base32 string (RFC 4648, A-Z2-7 alphabet) into a Buffer. Padding
 * and casing are tolerated; whitespace is ignored.
 * @throws {Error} if a non-alphabet character is encountered
 */
export function base32Decode(input: string): Buffer {
  const cleaned = input.replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  if (cleaned.length === 0) return Buffer.alloc(0);

  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned.charAt(i);
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Compares two strings in constant time relative to their content, mitigating
 * timing attacks. Returns false for unequal lengths without leaking which
 * position differed.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    // Still perform a comparison of equal-length buffers to avoid a length
    // oracle short-circuit, then return false.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Encodes a string or Buffer to Base58 (Bitcoin alphabet). */
export function base58Encode(input: string | Buffer): string {
  const bytes = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  const digits: number[] = [];
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] * 256;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let result = "1".repeat(zeros);
  for (let i = digits.length - 1; i >= 0; i--) result += BASE58_ALPHABET[digits[i]];
  return result;
}

/** Decodes a Base58 string into a Buffer. */
export function base58Decode(input: string): Buffer {
  let zeros = 0;
  while (zeros < input.length && input[zeros] === "1") zeros++;
  const bytes: number[] = [];
  for (let i = zeros; i < input.length; i++) {
    let carry = BASE58_ALPHABET.indexOf(input[i]);
    if (carry < 0) throw new Error("base58Decode: invalid character.");
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry % 256;
      carry = Math.floor(carry / 256);
    }
    while (carry > 0) {
      bytes.push(carry % 256);
      carry = Math.floor(carry / 256);
    }
  }
  const leading = new Array<number>(zeros).fill(0);
  return Buffer.from([...leading, ...bytes.reverse()]);
}
