/**
 * An immutable, iterable numeric range with an exclusive upper bound.
 * Supports positive and negative steps.
 */
export class Range implements Iterable<number> {
  readonly start: number;
  readonly end: number;
  readonly step: number;

  /**
   * @param start inclusive lower bound
   * @param end exclusive upper bound
   * @param step increment between values, defaults to `1`; must not be `0`
   * @throws if `step` is `0`
   */
  constructor(start: number, end: number, step = 1) {
    if (step === 0) {
      throw new Error("Range: step must not be 0.");
    }
    this.start = start;
    this.end = end;
    this.step = step;
  }

  /** Convenience factory mirroring the constructor. */
  static of(start: number, end: number, step = 1): Range {
    return new Range(start, end, step);
  }

  /** Returns `true` when `n` is one of the values produced by this range. */
  contains(n: number): boolean {
    if (this.step > 0) {
      if (n < this.start || n >= this.end) return false;
    } else {
      if (n > this.start || n <= this.end) return false;
    }
    return (n - this.start) % this.step === 0;
  }

  /** Materializes the range into an array. */
  toArray(): number[] {
    const result: number[] = [];
    for (const n of this) {
      result.push(n);
    }
    return result;
  }

  /** Number of values the range produces. */
  get length(): number {
    const span = this.end - this.start;
    if (span === 0 || Math.sign(span) !== Math.sign(this.step)) {
      return 0;
    }
    return Math.ceil(span / this.step);
  }

  /** Invokes `fn` for each value, providing the value and its index. */
  forEach(fn: (n: number, i: number) => void): void {
    let i = 0;
    for (const n of this) {
      fn(n, i++);
    }
  }

  /** Maps each value through `fn`, returning an array of results. */
  map<U>(fn: (n: number, i: number) => U): U[] {
    const result: U[] = [];
    let i = 0;
    for (const n of this) {
      result.push(fn(n, i++));
    }
    return result;
  }

  [Symbol.iterator](): IterableIterator<number> {
    const { start, end, step } = this;
    function* generator(): IterableIterator<number> {
      if (step > 0) {
        for (let i = start; i < end; i += step) yield i;
      } else {
        for (let i = start; i > end; i += step) yield i;
      }
    }
    return generator();
  }
}
