/**
 * Helpers built on top of the WHATWG Web Streams API (`ReadableStream`,
 * `WritableStream`, `TransformStream`). These globals are available in modern
 * browsers and in Node.js 18 or newer (the same baseline as this project's
 * `fetch`-based HTTP client). On older runtimes you must provide a polyfill.
 *
 * Every helper treats its arguments as read-only: the input streams and
 * functions are never mutated. Reading is performed through an explicit
 * reader obtained with `stream.getReader()`, and the lock is always released
 * once consumption finishes (or fails).
 */
export const streams = {
  /**
   * Create a `ReadableStream` that emits every element produced by a
   * synchronous or asynchronous iterable.
   *
   * @typeParam T - Element type.
   * @param iterable - Source iterable (not mutated). May be an `Iterable<T>`
   * or an `AsyncIterable<T>`.
   * @returns A new `ReadableStream<T>` yielding the iterable's values in order.
   * If the consumer cancels the stream, the underlying iterator's `return`
   * method (when present) is invoked so resources can be released.
   *
   * @example
   * const stream = streams.fromIterable([1, 2, 3]);
   * await streams.toArray(stream); // [1, 2, 3]
   */
  fromIterable<T>(iterable: Iterable<T> | AsyncIterable<T>): ReadableStream<T> {
    let iterator: Iterator<T> | AsyncIterator<T>;
    if (typeof (iterable as AsyncIterable<T>)[Symbol.asyncIterator] === "function") {
      iterator = (iterable as AsyncIterable<T>)[Symbol.asyncIterator]();
    } else {
      iterator = (iterable as Iterable<T>)[Symbol.iterator]();
    }

    return new ReadableStream<T>({
      async pull(controller) {
        try {
          const result = await iterator.next();
          if (result.done) {
            controller.close();
          } else {
            controller.enqueue(result.value);
          }
        } catch (error) {
          controller.error(error);
        }
      },
      async cancel() {
        if (typeof iterator.return === "function") {
          await iterator.return();
        }
      },
    });
  },

  /**
   * Consume a stream completely and collect every chunk into an array.
   *
   * @typeParam T - Chunk type.
   * @param stream - Source stream (not mutated). It is fully read and its
   * reader lock is released when done.
   * @returns A promise resolving to an array with all emitted chunks, in order.
   *
   * @example
   * await streams.toArray(streams.fromIterable(["a", "b"])); // ["a", "b"]
   */
  async toArray<T>(stream: ReadableStream<T>): Promise<T[]> {
    const result: T[] = [];
    const reader = stream.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        result.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    return result;
  },

  /**
   * Adapt a stream into an async iterator so it can be consumed with
   * `for await ... of`. Implemented manually rather than relying on
   * `ReadableStream[Symbol.asyncIterator]`, which is not available on every
   * runtime.
   *
   * @typeParam T - Chunk type.
   * @param stream - Source stream (not mutated). Its reader lock is released
   * when iteration completes, throws, or is stopped early (via `return`).
   * @returns An async iterable iterator over the stream's chunks.
   *
   * @example
   * for await (const value of streams.toAsyncIterable(stream)) {
   *   console.log(value);
   * }
   */
  toAsyncIterable<T>(stream: ReadableStream<T>): AsyncIterableIterator<T> {
    const reader = stream.getReader();
    const iterator: AsyncIterableIterator<T> = {
      async next(): Promise<IteratorResult<T>> {
        try {
          const { done, value } = await reader.read();
          if (done) {
            reader.releaseLock();
            return { done: true, value: undefined };
          }
          return { done: false, value };
        } catch (error) {
          reader.releaseLock();
          throw error;
        }
      },
      async return(value?: unknown): Promise<IteratorResult<T>> {
        await reader.cancel();
        reader.releaseLock();
        return { done: true, value: value as undefined };
      },
      [Symbol.asyncIterator](): AsyncIterableIterator<T> {
        return this;
      },
    };
    return iterator;
  },

  /**
   * Project every chunk of a stream through a mapping function, producing a
   * new stream. Wiring is done with `pipeThrough(new TransformStream(...))`.
   *
   * @typeParam T - Input chunk type.
   * @typeParam U - Output chunk type.
   * @param stream - Source stream (not mutated).
   * @param fn - Receives each value and its zero-based index; may return a
   * value or a promise of a value.
   * @returns A new `ReadableStream<U>` of mapped chunks.
   *
   * @example
   * const doubled = streams.map(streams.fromIterable([1, 2]), (n) => n * 2);
   * await streams.toArray(doubled); // [2, 4]
   */
  map<T, U>(
    stream: ReadableStream<T>,
    fn: (value: T, index: number) => U | Promise<U>,
  ): ReadableStream<U> {
    return stream.pipeThrough(this.mapTransform(fn));
  },

  /**
   * Keep only the chunks for which `predicate` returns a truthy value,
   * producing a new stream.
   *
   * @typeParam T - Chunk type.
   * @param stream - Source stream (not mutated).
   * @param predicate - Receives each value and its zero-based index; may
   * return a boolean or a promise of a boolean.
   * @returns A new `ReadableStream<T>` containing only the chunks that pass.
   *
   * @example
   * const evens = streams.filter(streams.fromIterable([1, 2, 3, 4]), (n) => n % 2 === 0);
   * await streams.toArray(evens); // [2, 4]
   */
  filter<T>(
    stream: ReadableStream<T>,
    predicate: (value: T, index: number) => boolean | Promise<boolean>,
  ): ReadableStream<T> {
    let index = 0;
    const transform = new TransformStream<T, T>({
      async transform(chunk, controller) {
        const keep = await predicate(chunk, index++);
        if (keep) {
          controller.enqueue(chunk);
        }
      },
    });
    return stream.pipeThrough(transform);
  },

  /**
   * Produce a stream limited to the first `n` chunks of the source. Once the
   * limit is reached the source is cancelled so it can stop producing.
   *
   * @typeParam T - Chunk type.
   * @param stream - Source stream (not mutated). It is cancelled once `n`
   * chunks have been forwarded.
   * @param n - Maximum number of chunks to emit. Values of `0` or below yield
   * an empty stream (and cancel the source immediately).
   * @returns A new `ReadableStream<T>` with at most `n` chunks.
   *
   * @example
   * const head = streams.take(streams.fromIterable([1, 2, 3, 4]), 2);
   * await streams.toArray(head); // [1, 2]
   */
  take<T>(stream: ReadableStream<T>, n: number): ReadableStream<T> {
    const limit = Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
    return new ReadableStream<T>({
      async start(controller) {
        if (limit === 0) {
          controller.close();
          await stream.cancel();
          return;
        }
        const reader = stream.getReader();
        try {
          let emitted = 0;
          while (emitted < limit) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            controller.enqueue(value);
            emitted++;
          }
          controller.close();
          reader.releaseLock();
          if (emitted >= limit) {
            await stream.cancel();
          }
        } catch (error) {
          reader.releaseLock();
          controller.error(error);
        }
      },
    });
  },

  /**
   * Invoke a callback for every chunk of a stream, consuming it fully. Useful
   * for side effects when no result value is needed.
   *
   * @typeParam T - Chunk type.
   * @param stream - Source stream (not mutated). It is fully read and its
   * reader lock is released when done.
   * @param fn - Receives each value and its zero-based index; may return
   * `void` or a promise.
   * @returns A promise that resolves once the whole stream has been processed.
   *
   * @example
   * await streams.forEach(streams.fromIterable([1, 2]), (n) => console.log(n));
   */
  async forEach<T>(
    stream: ReadableStream<T>,
    fn: (value: T, index: number) => void | Promise<void>,
  ): Promise<void> {
    const reader = stream.getReader();
    try {
      let index = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        await fn(value, index++);
      }
    } finally {
      reader.releaseLock();
    }
  },

  /**
   * Fold a stream into a single accumulated value, consuming it fully.
   *
   * @typeParam T - Chunk type.
   * @typeParam U - Accumulator type.
   * @param stream - Source stream (not mutated). It is fully read and its
   * reader lock is released when done.
   * @param reducer - Combines the running accumulator with the next chunk.
   * @param initial - Seed value used before the first chunk.
   * @returns A promise resolving to the final accumulated value.
   *
   * @example
   * await streams.reduce(streams.fromIterable([1, 2, 3]), (a, b) => a + b, 0); // 6
   */
  async reduce<T, U>(
    stream: ReadableStream<T>,
    reducer: (acc: U, value: T) => U,
    initial: U,
  ): Promise<U> {
    let acc = initial;
    const reader = stream.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        acc = reducer(acc, value);
      }
    } finally {
      reader.releaseLock();
    }
    return acc;
  },

  /**
   * Concatenate a stream of text chunks into a single string. `string` chunks
   * are appended as-is; `Uint8Array` chunks are decoded as UTF-8.
   *
   * @param stream - Source stream of `string` or `Uint8Array` chunks (not
   * mutated). It is fully read and its reader lock is released when done.
   * @returns A promise resolving to the concatenated string.
   *
   * @example
   * await streams.text(streams.fromString("hello", 2)); // "hello"
   */
  async text(stream: ReadableStream<string | Uint8Array>): Promise<string> {
    const decoder = new TextDecoder();
    let result = "";
    const reader = stream.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        if (typeof value === "string") {
          result += value;
        } else {
          result += decoder.decode(value, { stream: true });
        }
      }
      result += decoder.decode();
    } finally {
      reader.releaseLock();
    }
    return result;
  },

  /**
   * Create a stream that emits a string as UTF-8 encoded `Uint8Array` chunks
   * of at most `chunkSize` bytes each.
   *
   * @param text - Source string (not mutated).
   * @param chunkSize - Maximum number of bytes per emitted chunk. Defaults to
   * `16384`. Non-positive or non-finite values fall back to a single chunk
   * containing the whole encoded payload.
   * @returns A new `ReadableStream<Uint8Array>` of UTF-8 byte chunks.
   *
   * @example
   * const stream = streams.fromString("hello world", 4);
   * await streams.text(stream); // "hello world"
   */
  fromString(text: string, chunkSize: number = 16384): ReadableStream<Uint8Array> {
    const bytes = new TextEncoder().encode(text);
    const size =
      Number.isFinite(chunkSize) && chunkSize > 0
        ? Math.trunc(chunkSize)
        : bytes.length;
    let offset = 0;

    return new ReadableStream<Uint8Array>({
      pull(controller) {
        if (offset >= bytes.length) {
          controller.close();
          return;
        }
        const end = size > 0 ? Math.min(offset + size, bytes.length) : bytes.length;
        controller.enqueue(bytes.subarray(offset, end));
        offset = end;
      },
    });
  },

  /**
   * Build a standalone `TransformStream` that maps each chunk, suitable for
   * use with `readable.pipeThrough(...)`. Unlike {@link streams.map}, this
   * helper does not take a source stream, so the same transform definition can
   * be reused or composed independently.
   *
   * @typeParam T - Input chunk type.
   * @typeParam U - Output chunk type.
   * @param fn - Receives each value and its zero-based index; may return a
   * value or a promise of a value.
   * @returns A new `TransformStream<T, U>`.
   *
   * @example
   * const out = stream.pipeThrough(streams.mapTransform((n: number) => n + 1));
   */
  mapTransform<T, U>(
    fn: (value: T, index: number) => U | Promise<U>,
  ): TransformStream<T, U> {
    let index = 0;
    return new TransformStream<T, U>({
      async transform(chunk, controller) {
        controller.enqueue(await fn(chunk, index++));
      },
    });
  },
};
