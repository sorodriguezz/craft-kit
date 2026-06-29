const DEFAULT_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Hash a string seed into a 32-bit unsigned integer using the xmur3 algorithm.
 *
 * @param seed - The string to hash.
 * @returns A 32-bit unsigned seed value.
 */
function xmur3(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Seeded, deterministic pseudo-random number generator.
 *
 * Uses the `mulberry32` algorithm with an `xmur3`-hashed seed, so the same seed
 * always produces the same sequence of values. None of the array helpers mutate
 * their input — they operate on copies.
 *
 * @example
 * const rng = new Random("seed");
 * rng.int(1, 6); // deterministic for this seed
 */
export class Random {
  private _state: number;

  /**
   * Create a seeded generator.
   *
   * @param seed - A numeric or string seed. Strings are hashed with xmur3.
   * When omitted, a non-deterministic seed is derived from `Math.random` and
   * the current time.
   */
  constructor(seed?: number | string) {
    let initial: number;
    if (typeof seed === "string") {
      initial = xmur3(seed);
    } else if (typeof seed === "number" && Number.isFinite(seed)) {
      initial = Math.floor(Math.abs(seed));
    } else {
      initial = Math.floor(Math.random() * 0x100000000) ^ Date.now();
    }
    this._state = initial >>> 0;
  }

  /**
   * Produce the next pseudo-random float in the half-open range `[0, 1)`.
   *
   * @returns A float in `[0, 1)`.
   */
  next(): number {
    this._state = (this._state + 0x6d2b79f5) >>> 0;
    let t = this._state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Produce a pseudo-random integer in the inclusive range `[min, max]`.
   *
   * @param min - Lower bound (inclusive).
   * @param max - Upper bound (inclusive).
   * @returns An integer in `[min, max]`.
   *
   * @example
   * new Random(1).int(1, 6); // e.g. 4
   */
  int(min: number, max: number): number {
    const low = Math.ceil(Math.min(min, max));
    const high = Math.floor(Math.max(min, max));
    return low + Math.floor(this.next() * (high - low + 1));
  }

  /**
   * Produce a pseudo-random float in the half-open range `[min, max)`.
   *
   * @param min - Lower bound (inclusive).
   * @param max - Upper bound (exclusive).
   * @returns A float in `[min, max)`.
   */
  float(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Produce a pseudo-random boolean.
   *
   * @param probability - Probability of `true`, in `[0, 1]`. Defaults to `0.5`.
   * @returns `true` with the given probability.
   */
  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Pick a single random element from a non-empty array.
   *
   * @param array - Source array (not mutated).
   * @returns A randomly selected element.
   * @throws {Error} When the array is empty.
   */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error("cannot pick from an empty array");
    }
    return array[this.int(0, array.length - 1)];
  }

  /**
   * Sample `count` distinct elements without replacement.
   *
   * @param array - Source array (not mutated).
   * @param count - Number of elements to draw.
   * @returns A new array of `count` randomly selected elements.
   * @throws {RangeError} When `count` is negative or exceeds the array length.
   */
  sample<T>(array: readonly T[], count: number): T[] {
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError("count must be a non-negative integer");
    }
    if (count > array.length) {
      throw new RangeError("count cannot exceed the array length");
    }
    const copy = array.slice();
    for (let i = 0; i < count; i++) {
      const j = this.int(i, copy.length - 1);
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy.slice(0, count);
  }

  /**
   * Return a shuffled copy of the array using the Fisher-Yates algorithm.
   *
   * @param array - Source array (not mutated).
   * @returns A new array with the elements in random order.
   */
  shuffle<T>(array: readonly T[]): T[] {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  /**
   * Build a random string of the given length from an alphabet.
   *
   * @param length - Number of characters to generate.
   * @param alphabet - Characters to draw from. Defaults to `A-Za-z0-9`.
   * @returns A random string of length `length`.
   * @throws {RangeError} When `length` is negative.
   * @throws {Error} When `alphabet` is empty.
   *
   * @example
   * new Random("seed").string(8); // deterministic 8-char string
   */
  string(length: number, alphabet: string = DEFAULT_ALPHABET): string {
    if (!Number.isInteger(length) || length < 0) {
      throw new RangeError("length must be a non-negative integer");
    }
    if (alphabet.length === 0) {
      throw new Error("alphabet must contain at least one character");
    }
    let result = "";
    for (let i = 0; i < length; i++) {
      result += alphabet.charAt(this.int(0, alphabet.length - 1));
    }
    return result;
  }
}
