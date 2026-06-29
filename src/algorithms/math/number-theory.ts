/**
 * Greatest common divisor of two integers (Euclid's algorithm). Operates on the
 * absolute values, so the result is always non-negative. gcd(0, 0) is 0.
 */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

/**
 * Least common multiple of two integers. Returns 0 if either input is 0. The
 * result is non-negative.
 */
export function lcm(a: number, b: number): number {
  const x = Math.trunc(a);
  const y = Math.trunc(b);
  if (x === 0 || y === 0) return 0;
  return Math.abs(x / gcd(x, y) * y);
}

/**
 * Primality test by trial division up to sqrt(n). Returns false for n < 2 and
 * for non-integers.
 */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n < 4) return true; // 2 and 3
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * Returns all primes in the range [2, n] using the Sieve of Eratosthenes.
 * Returns an empty array for n < 2.
 */
export function primesUpTo(n: number): number[] {
  const limit = Math.trunc(n);
  if (limit < 2) return [];

  const sieve = new Uint8Array(limit + 1); // 0 = prime, 1 = composite
  for (let i = 2; i * i <= limit; i++) {
    if (sieve[i] === 0) {
      for (let j = i * i; j <= limit; j += i) {
        sieve[j] = 1;
      }
    }
  }

  const primes: number[] = [];
  for (let i = 2; i <= limit; i++) {
    if (sieve[i] === 0) primes.push(i);
  }
  return primes;
}

/**
 * Factorial of a non-negative integer, returned as a bigint to avoid overflow.
 * @throws {RangeError} if n is negative or not an integer
 */
export function factorial(n: number): bigint {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError("factorial requires a non-negative integer");
  }
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) {
    result *= i;
  }
  return result;
}

/**
 * Number of ways to choose `k` items from `n` without order ("n choose k"),
 * computed iteratively as a bigint. Returns 0n when k < 0 or k > n.
 * @throws {RangeError} if n is negative or either argument is not an integer
 */
export function combinations(n: number, k: number): bigint {
  if (!Number.isInteger(n) || !Number.isInteger(k)) {
    throw new RangeError("combinations requires integer arguments");
  }
  if (n < 0) {
    throw new RangeError("combinations requires a non-negative n");
  }
  if (k < 0 || k > n) return 0n;

  // Use the smaller of k and n - k for fewer iterations and smaller factors.
  const kk = Math.min(k, n - k);
  let result = 1n;
  const nBig = BigInt(n);
  for (let i = 0n; i < BigInt(kk); i++) {
    result = (result * (nBig - i)) / (i + 1n);
  }
  return result;
}

/**
 * Number of ordered arrangements of `k` items from `n` ("n permute k"),
 * computed as a bigint. Returns 0n when k < 0 or k > n.
 * @throws {RangeError} if n is negative or either argument is not an integer
 */
export function permutations(n: number, k: number): bigint {
  if (!Number.isInteger(n) || !Number.isInteger(k)) {
    throw new RangeError("permutations requires integer arguments");
  }
  if (n < 0) {
    throw new RangeError("permutations requires a non-negative n");
  }
  if (k < 0 || k > n) return 0n;

  let result = 1n;
  const nBig = BigInt(n);
  for (let i = 0n; i < BigInt(k); i++) {
    result *= nBig - i;
  }
  return result;
}

/**
 * Modular exponentiation: computes (base ^ exponent) mod modulus using
 * fast (square-and-multiply) exponentiation on bigints.
 *
 * @param base the base value
 * @param exponent a non-negative exponent
 * @param modulus a modulus greater than 0
 * @throws {RangeError} if exponent is negative or modulus is not positive
 */
export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus <= 0n) {
    throw new RangeError("modulus must be a positive bigint");
  }
  if (exponent < 0n) {
    throw new RangeError("exponent must be a non-negative bigint");
  }
  if (modulus === 1n) return 0n;

  let result = 1n;
  // Normalize the base into [0, modulus) for negative inputs.
  let b = ((base % modulus) + modulus) % modulus;
  let e = exponent;

  while (e > 0n) {
    if (e & 1n) {
      result = (result * b) % modulus;
    }
    e >>= 1n;
    b = (b * b) % modulus;
  }
  return result;
}
