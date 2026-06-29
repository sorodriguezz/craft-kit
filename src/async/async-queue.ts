/**
 * An unbounded FIFO queue for the producer/consumer pattern. Producers call
 * {@link enqueue} and consumers `await` {@link dequeue}. When an item is
 * enqueued while consumers are waiting, it is handed to the longest-waiting
 * consumer directly; otherwise it is buffered until one asks for it.
 *
 * The queue is also an async iterable, yielding items indefinitely as they
 * arrive.
 *
 * @typeParam T - The element type held by the queue.
 *
 * @example
 * const queue = new AsyncQueue<number>();
 * queue.enqueue(1);
 * const value = await queue.dequeue(); // 1
 *
 * @example
 * // Consume as an async stream:
 * for await (const item of queue) {
 *   handle(item);
 * }
 */
export class AsyncQueue<T> {
  private readonly items: T[] = [];
  private readonly waiters: Array<(value: T) => void> = [];

  /** Number of buffered items not yet consumed. */
  get size(): number {
    return this.items.length;
  }

  /** Number of consumers currently awaiting an item. */
  get waiting(): number {
    return this.waiters.length;
  }

  /**
   * Add an item to the queue. If a consumer is waiting, the item is delivered
   * to it immediately; otherwise it is buffered.
   *
   * @param item - The value to enqueue.
   */
  enqueue(item: T): void {
    if (this.waiters.length > 0) {
      // shift() returns `T | undefined`; the length guard above guarantees a
      // value is present, so the non-null assertion is safe.
      const waiter = this.waiters.shift()!;
      waiter(item);
    } else {
      this.items.push(item);
    }
  }

  /**
   * Remove and return the next item, waiting if the queue is empty.
   *
   * @returns A promise that resolves with the next available item.
   */
  dequeue(): Promise<T> {
    if (this.items.length > 0) {
      // shift() returns `T | undefined`; the length guard above guarantees a
      // value is present, so the non-null assertion is safe. Using a length
      // check (rather than comparing against `undefined`) keeps the queue
      // correct even when `T` itself includes `undefined`.
      const item = this.items.shift()!;
      return Promise.resolve(item);
    }
    return new Promise<T>((resolve) => {
      this.waiters.push(resolve);
    });
  }

  /**
   * Iterate the queue as an infinite async stream. Each iteration awaits the
   * next enqueued item, so the loop only ends if the consumer breaks out of it.
   */
  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    for (;;) {
      yield await this.dequeue();
    }
  }
}
