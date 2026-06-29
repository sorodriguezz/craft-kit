/**
 * Pseudo-random utilities.
 *
 * These helpers use `Math.random` and are NOT cryptographically secure. Do not
 * use them for tokens, keys, passwords or any security-sensitive purpose. For
 * cryptographic randomness use `node:crypto` (see the security module).
 */

/**
 * Returns a uniformly random integer in the inclusive range
 * [minInclusive, maxInclusive].
 *
 * @throws {RangeError} if the bounds are not integers or min > max
 */
export function randomInt(minInclusive: number, maxInclusive: number): number {
  if (!Number.isInteger(minInclusive) || !Number.isInteger(maxInclusive)) {
    throw new RangeError("randomInt bounds must be integers");
  }
  if (minInclusive > maxInclusive) {
    throw new RangeError("minInclusive must not exceed maxInclusive");
  }
  const span = maxInclusive - minInclusive + 1;
  return minInclusive + Math.floor(Math.random() * span);
}

/**
 * Returns a new array with the elements of `array` randomly permuted using the
 * Fisher-Yates shuffle. The input is not mutated.
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Returns `count` elements sampled from `array` without replacement, in random
 * order. The input is not mutated.
 *
 * @param array source elements
 * @param count number of elements to draw; defaults to 1
 * @throws {RangeError} if count is negative or greater than the array length
 */
export function sample<T>(array: readonly T[], count = 1): T[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("count must be a non-negative integer");
  }
  if (count > array.length) {
    throw new RangeError("count must not exceed the array length");
  }
  return shuffle(array).slice(0, count);
}

/**
 * Returns a single element from `items` chosen with probability proportional to
 * its weight. The input is not mutated.
 *
 * @param items candidate elements
 * @param weights non-negative weights aligned with `items`
 * @throws {RangeError} if the arrays are empty, mismatched in length, contain a
 *   negative weight, or sum to zero
 */
export function weightedSample<T>(
  items: readonly T[],
  weights: readonly number[]
): T {
  if (items.length === 0) {
    throw new RangeError("items must not be empty");
  }
  if (items.length !== weights.length) {
    throw new RangeError("items and weights must have the same length");
  }

  let total = 0;
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i];
    if (!(w >= 0) || !Number.isFinite(w)) {
      throw new RangeError("weights must be finite and non-negative");
    }
    total += w;
  }
  if (total <= 0) {
    throw new RangeError("the sum of weights must be greater than zero");
  }

  let threshold = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    threshold -= weights[i];
    if (threshold < 0) {
      return items[i];
    }
  }
  // Fallback for floating-point edge cases: return the last element.
  return items[items.length - 1];
}
