/** nth Fibonacci number via bottom-up DP. fib(0)=0, fib(1)=1. O(n). */
export function fibonacci(n: number): number {
  if (n < 0) throw new RangeError("fibonacci: n must be >= 0");
  if (n < 2) return n;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const next = a + b;
    a = b;
    b = next;
  }
  return b;
}

/** First `n` Fibonacci numbers: [0, 1, 1, 2, 3, ...]. */
export function fibonacciSequence(n: number): number[] {
  if (n < 0) throw new RangeError("fibonacciSequence: n must be >= 0");
  const seq: number[] = [];
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) {
    seq.push(a);
    const next = a + b;
    a = b;
    b = next;
  }
  return seq;
}

/** nth Fibonacci number using BigInt (no precision loss for large n). */
export function fibonacciBig(n: number): bigint {
  if (n < 0) throw new RangeError("fibonacciBig: n must be >= 0");
  if (n < 2) return BigInt(n);
  let a = 0n;
  let b = 1n;
  for (let i = 2; i <= n; i++) {
    const next = a + b;
    a = b;
    b = next;
  }
  return b;
}
