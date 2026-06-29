import { randomBytes } from "node:crypto";

const NANOID_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

/**
 * Builds a generator that produces random IDs from `alphabet`. The returned
 * function rejects bias by discarding random bytes that fall outside the usable
 * range, so the distribution over characters is uniform.
 *
 * @param alphabet characters to draw from (must be non-empty)
 * @param defaultSize default ID length when the generator is called with no
 *   argument
 * @returns a function `(size?) => string`
 */
export function customAlphabet(
  alphabet: string,
  defaultSize: number
): (size?: number) => string {
  if (alphabet.length === 0) {
    throw new Error("alphabet must contain at least one character");
  }
  if (!Number.isInteger(defaultSize) || defaultSize < 0) {
    throw new RangeError("defaultSize must be a non-negative integer");
  }

  const alphabetSize = alphabet.length;
  // Smallest power-of-two mask that covers the alphabet indices.
  const mask = (2 << Math.floor(Math.log2(alphabetSize - 1 || 1))) - 1;
  // Over-allocate randomness to reduce the number of refills.
  const step = Math.ceil((1.6 * mask * Math.max(defaultSize, 1)) / alphabetSize);

  return (size: number = defaultSize): string => {
    if (!Number.isInteger(size) || size < 0) {
      throw new RangeError("size must be a non-negative integer");
    }
    if (size === 0) return "";

    let id = "";
    while (true) {
      const bytes = randomBytes(step);
      for (let i = 0; i < step; i++) {
        const index = bytes[i] & mask;
        if (index < alphabetSize) {
          id += alphabet.charAt(index);
          if (id.length === size) {
            return id;
          }
        }
      }
    }
  };
}

/**
 * Generates a URL-safe, cryptographically random identifier from the alphabet
 * `A-Za-z0-9_-` (the standard nanoid alphabet).
 *
 * @param size number of characters in the ID. Defaults to 21.
 * @returns a random URL-safe string of length `size`
 */
export function nanoid(size = 21): string {
  if (!Number.isInteger(size) || size < 0) {
    throw new RangeError("size must be a non-negative integer");
  }
  if (size === 0) return "";

  // The alphabet has 64 characters, so each byte maps cleanly via a 6-bit mask.
  const mask = 63;
  const bytes = randomBytes(size);
  let id = "";
  for (let i = 0; i < size; i++) {
    id += NANOID_ALPHABET.charAt(bytes[i] & mask);
  }
  return id;
}

/**
 * Generates a UUID version 7 (RFC 9562): a 128-bit, time-ordered identifier
 * built from a 48-bit Unix timestamp in milliseconds, the version and variant
 * bits, and 74 bits of randomness. Returned in canonical
 * `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` form.
 *
 * Because the leading bits encode the creation time, generated values sort
 * chronologically as strings.
 *
 * @param timestamp Unix epoch in milliseconds. Defaults to `Date.now()`.
 * @returns a canonical UUIDv7 string
 */
export function uuidv7(timestamp: number = Date.now()): string {
  const bytes = randomBytes(16);
  const ms = Math.floor(timestamp);

  // Bytes 0-5: 48-bit big-endian timestamp in milliseconds.
  bytes[0] = Math.floor(ms / 2 ** 40) & 0xff;
  bytes[1] = Math.floor(ms / 2 ** 32) & 0xff;
  bytes[2] = Math.floor(ms / 2 ** 24) & 0xff;
  bytes[3] = Math.floor(ms / 2 ** 16) & 0xff;
  bytes[4] = Math.floor(ms / 2 ** 8) & 0xff;
  bytes[5] = ms & 0xff;

  // Byte 6: high nibble is the version (0b0111 = 7), low nibble stays random.
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Byte 8: top two bits are the variant (0b10), remaining bits stay random.
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Generates a ULID: a 26-character, lexicographically sortable, URL-safe
 * identifier (48-bit timestamp + 80 bits of randomness, Crockford base32).
 */
export function ulid(timestamp: number = Date.now()): string {
  const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let time = timestamp;
  let timeChars = "";
  for (let i = 0; i < 10; i++) {
    timeChars = CROCKFORD[time % 32] + timeChars;
    time = Math.floor(time / 32);
  }
  const bytes = randomBytes(16);
  let randomChars = "";
  for (let i = 0; i < 16; i++) {
    randomChars += CROCKFORD[bytes[i] % 32];
  }
  return timeChars + randomChars;
}
