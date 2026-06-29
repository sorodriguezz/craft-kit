/**
 * Lazy iterator helpers built on generators (`yield`). They never allocate
 * intermediate arrays, so chaining them streams elements one at a time, which
 * is both memory-light and fast for large or infinite sequences.
 *
 * @example
 * import { iter } from "craft-kit";
 * const evens = iter.filter(iter.range(0, 1_000_000), n => n % 2 === 0);
 * iter.toArray(iter.take(evens, 5)); // [0, 2, 4, 6, 8]
 */
export const iter = {
  /** Numbers from start (inclusive) to end (exclusive). */
  *range(start: number, end: number, step = 1): Generator<number> {
    if (step === 0) throw new Error("iter.range: step must not be 0.");
    if (step > 0) for (let i = start; i < end; i += step) yield i;
    else for (let i = start; i > end; i += step) yield i;
  },

  *map<T, U>(source: Iterable<T>, fn: (value: T, index: number) => U): Generator<U> {
    let i = 0;
    for (const v of source) yield fn(v, i++);
  },

  *filter<T>(
    source: Iterable<T>,
    predicate: (value: T, index: number) => boolean
  ): Generator<T> {
    let i = 0;
    for (const v of source) if (predicate(v, i++)) yield v;
  },

  *take<T>(source: Iterable<T>, n: number): Generator<T> {
    if (n <= 0) return;
    let count = 0;
    for (const v of source) {
      yield v;
      if (++count >= n) return;
    }
  },

  *drop<T>(source: Iterable<T>, n: number): Generator<T> {
    let i = 0;
    for (const v of source) {
      if (i++ < n) continue;
      yield v;
    }
  },

  *takeWhile<T>(source: Iterable<T>, predicate: (value: T) => boolean): Generator<T> {
    for (const v of source) {
      if (!predicate(v)) return;
      yield v;
    }
  },

  *dropWhile<T>(source: Iterable<T>, predicate: (value: T) => boolean): Generator<T> {
    let dropping = true;
    for (const v of source) {
      if (dropping && predicate(v)) continue;
      dropping = false;
      yield v;
    }
  },

  *distinct<T>(source: Iterable<T>): Generator<T> {
    const seen = new Set<T>();
    for (const v of source) {
      if (!seen.has(v)) {
        seen.add(v);
        yield v;
      }
    }
  },

  *enumerate<T>(source: Iterable<T>): Generator<[number, T]> {
    let i = 0;
    for (const v of source) yield [i++, v];
  },

  *zip<A, B>(a: Iterable<A>, b: Iterable<B>): Generator<[A, B]> {
    const ia = a[Symbol.iterator]();
    const ib = b[Symbol.iterator]();
    for (;;) {
      const ra = ia.next();
      const rb = ib.next();
      if (ra.done || rb.done) return;
      yield [ra.value, rb.value];
    }
  },

  *chunk<T>(source: Iterable<T>, size: number): Generator<T[]> {
    if (size <= 0) throw new Error("iter.chunk: size must be > 0.");
    let buffer: T[] = [];
    for (const v of source) {
      buffer.push(v);
      if (buffer.length === size) {
        yield buffer;
        buffer = [];
      }
    }
    if (buffer.length) yield buffer;
  },

  /** Sliding windows of fixed size. */
  *windows<T>(source: Iterable<T>, size: number): Generator<T[]> {
    if (size <= 0) throw new Error("iter.windows: size must be > 0.");
    const buffer: T[] = [];
    for (const v of source) {
      buffer.push(v);
      if (buffer.length === size) {
        yield [...buffer];
        buffer.shift();
      }
    }
  },

  *flatten<T>(source: Iterable<Iterable<T>>): Generator<T> {
    for (const inner of source) yield* inner;
  },

  *concat<T>(...sources: Array<Iterable<T>>): Generator<T> {
    for (const s of sources) yield* s;
  },

  *repeat<T>(value: T, times = Infinity): Generator<T> {
    for (let i = 0; i < times; i++) yield value;
  },

  *tap<T>(source: Iterable<T>, action: (value: T) => void): Generator<T> {
    for (const v of source) {
      action(v);
      yield v;
    }
  },

  // ---- terminal operations ----

  toArray<T>(source: Iterable<T>): T[] {
    return [...source];
  },

  reduce<T, U>(source: Iterable<T>, identity: U, accumulator: (acc: U, value: T) => U): U {
    let result = identity;
    for (const v of source) result = accumulator(result, v);
    return result;
  },

  count(source: Iterable<unknown>): number {
    let c = 0;
    for (const _ of source) c++;
    return c;
  },

  forEach<T>(source: Iterable<T>, action: (value: T, index: number) => void): void {
    let i = 0;
    for (const v of source) action(v, i++);
  },

  find<T>(source: Iterable<T>, predicate: (value: T, index: number) => boolean): T | undefined {
    let i = 0;
    for (const v of source) if (predicate(v, i++)) return v;
    return undefined;
  },
} as const;
