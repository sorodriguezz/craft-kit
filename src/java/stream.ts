import { type Comparator, naturalOrder } from "../common/comparator";
import { Optional } from "./optional";
import type { Gatherer } from "./gatherers";

/**
 * Lazy, chainable sequence pipeline inspired by java.util.stream.Stream.
 * Intermediate operations are lazy; terminal operations consume the stream.
 * @typeParam T element type
 */
export class Stream<T> implements Iterable<T> {
  private constructor(private readonly source: Iterable<T>) {}

  static of<T>(...items: T[]): Stream<T> {
    return new Stream<T>(items);
  }

  static from<T>(iterable: Iterable<T>): Stream<T> {
    return new Stream<T>(iterable);
  }

  static empty<T>(): Stream<T> {
    return new Stream<T>([]);
  }

  /** Stream of numbers from start (inclusive) to end (exclusive). */
  static range(startInclusive: number, endExclusive: number, step = 1): Stream<number> {
    if (step === 0) throw new Error("Stream.range: step must not be 0.");
    const iterable: Iterable<number> = {
      *[Symbol.iterator]() {
        if (step > 0) for (let i = startInclusive; i < endExclusive; i += step) yield i;
        else for (let i = startInclusive; i > endExclusive; i += step) yield i;
      },
    };
    return new Stream<number>(iterable);
  }

  /** Infinite stream generated from a seed; combine with limit(). */
  static iterate<T>(seed: T, next: (value: T) => T): Stream<T> {
    const iterable: Iterable<T> = {
      *[Symbol.iterator]() {
        let current = seed;
        for (;;) {
          yield current;
          current = next(current);
        }
      },
    };
    return new Stream<T>(iterable);
  }

  [Symbol.iterator](): Iterator<T> {
    return this.source[Symbol.iterator]();
  }

  // ---- intermediate (lazy) ----

  map<U>(mapper: (value: T, index: number) => U): Stream<U> {
    const src = this.source;
    return new Stream<U>({
      *[Symbol.iterator]() {
        let i = 0;
        for (const v of src) yield mapper(v, i++);
      },
    });
  }

  filter(predicate: (value: T, index: number) => boolean): Stream<T> {
    const src = this.source;
    return new Stream<T>({
      *[Symbol.iterator]() {
        let i = 0;
        for (const v of src) if (predicate(v, i++)) yield v;
      },
    });
  }

  flatMap<U>(mapper: (value: T) => Iterable<U>): Stream<U> {
    const src = this.source;
    return new Stream<U>({
      *[Symbol.iterator]() {
        for (const v of src) yield* mapper(v);
      },
    });
  }

  distinct(): Stream<T> {
    const src = this.source;
    return new Stream<T>({
      *[Symbol.iterator]() {
        const seen = new Set<T>();
        for (const v of src) {
          if (!seen.has(v)) {
            seen.add(v);
            yield v;
          }
        }
      },
    });
  }

  sorted(comparator: Comparator<T> = naturalOrder): Stream<T> {
    const src = this.source;
    return new Stream<T>({
      *[Symbol.iterator]() {
        yield* [...src].sort(comparator);
      },
    });
  }

  peek(action: (value: T) => void): Stream<T> {
    const src = this.source;
    return new Stream<T>({
      *[Symbol.iterator]() {
        for (const v of src) {
          action(v);
          yield v;
        }
      },
    });
  }

  limit(maxSize: number): Stream<T> {
    const src = this.source;
    return new Stream<T>({
      *[Symbol.iterator]() {
        if (maxSize <= 0) return;
        let count = 0;
        for (const v of src) {
          yield v;
          if (++count >= maxSize) break;
        }
      },
    });
  }

  skip(n: number): Stream<T> {
    const src = this.source;
    return new Stream<T>({
      *[Symbol.iterator]() {
        let i = 0;
        for (const v of src) {
          if (i++ < n) continue;
          yield v;
        }
      },
    });
  }

  takeWhile(predicate: (value: T) => boolean): Stream<T> {
    const src = this.source;
    return new Stream<T>({
      *[Symbol.iterator]() {
        for (const v of src) {
          if (!predicate(v)) break;
          yield v;
        }
      },
    });
  }

  dropWhile(predicate: (value: T) => boolean): Stream<T> {
    const src = this.source;
    return new Stream<T>({
      *[Symbol.iterator]() {
        let dropping = true;
        for (const v of src) {
          if (dropping && predicate(v)) continue;
          dropping = false;
          yield v;
        }
      },
    });
  }

  // ---- terminal ----

  forEach(action: (value: T, index: number) => void): void {
    let i = 0;
    for (const v of this.source) action(v, i++);
  }

  toArray(): T[] {
    return [...this.source];
  }

  reduce<U>(identity: U, accumulator: (acc: U, value: T) => U): U {
    let result = identity;
    for (const v of this.source) result = accumulator(result, v);
    return result;
  }

  count(): number {
    let c = 0;
    for (const _ of this.source) c++;
    return c;
  }

  anyMatch(predicate: (value: T) => boolean): boolean {
    for (const v of this.source) if (predicate(v)) return true;
    return false;
  }

  allMatch(predicate: (value: T) => boolean): boolean {
    for (const v of this.source) if (!predicate(v)) return false;
    return true;
  }

  noneMatch(predicate: (value: T) => boolean): boolean {
    return !this.anyMatch(predicate);
  }

  findFirst(): Optional<T> {
    for (const v of this.source) return Optional.ofNullable(v);
    return Optional.empty<T>();
  }

  min(comparator: Comparator<T> = naturalOrder): Optional<T> {
    let best: T | undefined;
    let has = false;
    for (const v of this.source) {
      if (!has || comparator(v, best as T) < 0) {
        best = v;
        has = true;
      }
    }
    return has ? Optional.ofNullable(best) : Optional.empty<T>();
  }

  max(comparator: Comparator<T> = naturalOrder): Optional<T> {
    let best: T | undefined;
    let has = false;
    for (const v of this.source) {
      if (!has || comparator(v, best as T) > 0) {
        best = v;
        has = true;
      }
    }
    return has ? Optional.ofNullable(best) : Optional.empty<T>();
  }

  /** Collects into any shape via a finisher over the materialized array. */
  collect<R>(collector: (items: T[]) => R): R {
    return collector(this.toArray());
  }

  /** Joins string representations with an optional separator. */
  join(separator = ""): string {
    return this.toArray().map((v) => String(v)).join(separator);
  }

  /** Terminal: collects into an immutable (frozen) array (Java 16 toList). */
  toList(): readonly T[] {
    return Object.freeze([...this.source]);
  }

  /** One-to-many transform via an explicit push consumer (Java 16 mapMulti). */
  mapMulti<U>(mapper: (element: T, push: (value: U) => void) => void): Stream<U> {
    const src = this.source;
    return new Stream<U>({
      *[Symbol.iterator]() {
        for (const element of src) {
          const buffer: U[] = [];
          mapper(element, (value) => buffer.push(value));
          yield* buffer;
        }
      },
    });
  }

  /** Applies a custom intermediate operation (Java Stream Gatherers). */
  gather<S, R>(gatherer: Gatherer<T, S, R>): Stream<R> {
    const src = this.source;
    return new Stream<R>({
      *[Symbol.iterator]() {
        const state = (gatherer.initializer ? gatherer.initializer() : undefined) as S;
        const buffer: R[] = [];
        const push = (value: R): void => {
          buffer.push(value);
        };
        let stopped = false;
        for (const element of src) {
          const result = gatherer.integrator(state, element, push);
          if (buffer.length > 0) {
            yield* buffer;
            buffer.length = 0;
          }
          if (result === false) {
            stopped = true;
            break;
          }
        }
        if (!stopped && gatherer.finisher) {
          gatherer.finisher(state, push);
          if (buffer.length > 0) yield* buffer;
        }
      },
    });
  }
}
