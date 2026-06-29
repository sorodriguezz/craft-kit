import { type Comparator, naturalOrder } from "../common/comparator";
import type { MaybePromise } from "../common/types";
import { Optional } from "./optional";
import type { Gatherer } from "./gatherers";

/**
 * Lazy, chainable pipeline over async (or sync) data, built on async
 * generators. Every callback may return a value or a Promise. Intermediate
 * operations are lazy; terminal operations return a Promise.
 *
 * Use this when your transformations call async functions (HTTP, DB, fs, ...).
 * @typeParam T element type
 */
export class AsyncStream<T> implements AsyncIterable<T> {
  private constructor(private readonly source: AsyncIterable<T> | Iterable<T>) {}

  static of<T>(...items: T[]): AsyncStream<T> {
    return new AsyncStream<T>(items);
  }

  static from<T>(source: AsyncIterable<T> | Iterable<T>): AsyncStream<T> {
    return new AsyncStream<T>(source);
  }

  /** Builds a stream from promises, resolving each as it is consumed. */
  static fromPromises<T>(promises: Iterable<Promise<T>>): AsyncStream<T> {
    async function* gen(): AsyncGenerator<T> {
      for (const p of promises) yield await p;
    }
    return new AsyncStream<T>(gen());
  }

  static range(startInclusive: number, endExclusive: number, step = 1): AsyncStream<number> {
    if (step === 0) throw new Error("AsyncStream.range: step must not be 0.");
    async function* gen(): AsyncGenerator<number> {
      if (step > 0) for (let i = startInclusive; i < endExclusive; i += step) yield i;
      else for (let i = startInclusive; i > endExclusive; i += step) yield i;
    }
    return new AsyncStream<number>(gen());
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T> {
    for await (const v of this.source) yield v;
  }

  // ---- intermediate (lazy) ----

  map<U>(mapper: (value: T, index: number) => MaybePromise<U>): AsyncStream<U> {
    const src = this.source;
    async function* gen(): AsyncGenerator<U> {
      let i = 0;
      for await (const v of src) yield await mapper(v, i++);
    }
    return new AsyncStream<U>(gen());
  }

  /**
   * Maps with bounded concurrency, preserving input order. Up to `concurrency`
   * mappers run in flight at once — ideal for parallelising async I/O.
   */
  mapParallel<U>(
    mapper: (value: T, index: number) => MaybePromise<U>,
    concurrency = 8
  ): AsyncStream<U> {
    if (concurrency < 1) throw new Error("mapParallel: concurrency must be >= 1.");
    const src = this.source;
    async function* gen(): AsyncGenerator<U> {
      const queue: Array<Promise<U>> = [];
      let i = 0;
      for await (const v of src) {
        const index = i++;
        queue.push(Promise.resolve(mapper(v, index)));
        if (queue.length >= concurrency) yield await queue.shift()!;
      }
      while (queue.length) yield await queue.shift()!;
    }
    return new AsyncStream<U>(gen());
  }

  filter(predicate: (value: T, index: number) => MaybePromise<boolean>): AsyncStream<T> {
    const src = this.source;
    async function* gen(): AsyncGenerator<T> {
      let i = 0;
      for await (const v of src) if (await predicate(v, i++)) yield v;
    }
    return new AsyncStream<T>(gen());
  }

  flatMap<U>(
    mapper: (value: T) => MaybePromise<Iterable<U> | AsyncIterable<U>>
  ): AsyncStream<U> {
    const src = this.source;
    async function* gen(): AsyncGenerator<U> {
      for await (const v of src) {
        const inner = await mapper(v);
        for await (const u of inner) yield u;
      }
    }
    return new AsyncStream<U>(gen());
  }

  distinct(): AsyncStream<T> {
    const src = this.source;
    async function* gen(): AsyncGenerator<T> {
      const seen = new Set<T>();
      for await (const v of src) {
        if (!seen.has(v)) {
          seen.add(v);
          yield v;
        }
      }
    }
    return new AsyncStream<T>(gen());
  }

  peek(action: (value: T) => MaybePromise<void>): AsyncStream<T> {
    const src = this.source;
    async function* gen(): AsyncGenerator<T> {
      for await (const v of src) {
        await action(v);
        yield v;
      }
    }
    return new AsyncStream<T>(gen());
  }

  limit(maxSize: number): AsyncStream<T> {
    const src = this.source;
    async function* gen(): AsyncGenerator<T> {
      if (maxSize <= 0) return;
      let count = 0;
      for await (const v of src) {
        yield v;
        if (++count >= maxSize) return;
      }
    }
    return new AsyncStream<T>(gen());
  }

  skip(n: number): AsyncStream<T> {
    const src = this.source;
    async function* gen(): AsyncGenerator<T> {
      let i = 0;
      for await (const v of src) {
        if (i++ < n) continue;
        yield v;
      }
    }
    return new AsyncStream<T>(gen());
  }

  takeWhile(predicate: (value: T) => MaybePromise<boolean>): AsyncStream<T> {
    const src = this.source;
    async function* gen(): AsyncGenerator<T> {
      for await (const v of src) {
        if (!(await predicate(v))) return;
        yield v;
      }
    }
    return new AsyncStream<T>(gen());
  }

  dropWhile(predicate: (value: T) => MaybePromise<boolean>): AsyncStream<T> {
    const src = this.source;
    async function* gen(): AsyncGenerator<T> {
      let dropping = true;
      for await (const v of src) {
        if (dropping && (await predicate(v))) continue;
        dropping = false;
        yield v;
      }
    }
    return new AsyncStream<T>(gen());
  }

  // ---- terminal (return a Promise) ----

  async forEach(action: (value: T, index: number) => MaybePromise<void>): Promise<void> {
    let i = 0;
    for await (const v of this.source) await action(v, i++);
  }

  async toArray(): Promise<T[]> {
    const result: T[] = [];
    for await (const v of this.source) result.push(v);
    return result;
  }

  async reduce<U>(
    identity: U,
    accumulator: (acc: U, value: T) => MaybePromise<U>
  ): Promise<U> {
    let result = identity;
    for await (const v of this.source) result = await accumulator(result, v);
    return result;
  }

  async count(): Promise<number> {
    let c = 0;
    for await (const _ of this.source) c++;
    return c;
  }

  async anyMatch(predicate: (value: T) => MaybePromise<boolean>): Promise<boolean> {
    for await (const v of this.source) if (await predicate(v)) return true;
    return false;
  }

  async allMatch(predicate: (value: T) => MaybePromise<boolean>): Promise<boolean> {
    for await (const v of this.source) if (!(await predicate(v))) return false;
    return true;
  }

  async noneMatch(predicate: (value: T) => MaybePromise<boolean>): Promise<boolean> {
    return !(await this.anyMatch(predicate));
  }

  async findFirst(): Promise<Optional<T>> {
    for await (const v of this.source) return Optional.ofNullable(v);
    return Optional.empty<T>();
  }

  async min(comparator: Comparator<T> = naturalOrder): Promise<Optional<T>> {
    let best: T | undefined;
    let has = false;
    for await (const v of this.source) {
      if (!has || comparator(v, best as T) < 0) {
        best = v;
        has = true;
      }
    }
    return has ? Optional.ofNullable(best) : Optional.empty<T>();
  }

  async max(comparator: Comparator<T> = naturalOrder): Promise<Optional<T>> {
    let best: T | undefined;
    let has = false;
    for await (const v of this.source) {
      if (!has || comparator(v, best as T) > 0) {
        best = v;
        has = true;
      }
    }
    return has ? Optional.ofNullable(best) : Optional.empty<T>();
  }

  /** One-to-many transform via an explicit push consumer; the mapper may be async. */
  mapMulti<U>(
    mapper: (element: T, push: (value: U) => void) => MaybePromise<void>,
  ): AsyncStream<U> {
    const src = this.source;
    async function* gen(): AsyncGenerator<U> {
      for await (const element of src) {
        const buffer: U[] = [];
        await mapper(element, (value) => buffer.push(value));
        yield* buffer;
      }
    }
    return new AsyncStream<U>(gen());
  }

  /**
   * Applies a custom intermediate operation. Reuses the same {@link Gatherer}
   * abstraction as the synchronous Stream, so the built-in `Gatherers`
   * (windowFixed, scan, fold, distinctBy, limit, ...) work here too.
   */
  gather<S, R>(gatherer: Gatherer<T, S, R>): AsyncStream<R> {
    const src = this.source;
    async function* gen(): AsyncGenerator<R> {
      const state = (gatherer.initializer ? gatherer.initializer() : undefined) as S;
      const buffer: R[] = [];
      const push = (value: R): void => {
        buffer.push(value);
      };
      let stopped = false;
      for await (const element of src) {
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
    }
    return new AsyncStream<R>(gen());
  }
}
