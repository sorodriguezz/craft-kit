/**
 * Error thrown when a {@link Bulkhead} rejects a call because its queue
 * has reached the configured maximum size.
 */
export class BulkheadFullError extends Error {
  constructor(message = "Bulkhead queue is full") {
    super(message);
    this.name = "BulkheadFullError";
  }
}

/** Configuration options for a {@link Bulkhead}. */
export interface BulkheadOptions {
  /** Maximum number of operations allowed to run concurrently. */
  maxConcurrent: number;
  /** Maximum number of operations allowed to wait in the queue. Defaults to Infinity. */
  maxQueue?: number;
}

interface QueueEntry<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

/**
 * Implements the Bulkhead pattern to isolate resource usage by capping the
 * number of concurrent operations.
 *
 * When capacity is available the operation runs immediately; otherwise it is
 * queued in FIFO order. If queuing would exceed
 * {@link BulkheadOptions.maxQueue} the call is rejected with
 * {@link BulkheadFullError}.
 */
export class Bulkhead {
  private readonly maxConcurrent: number;
  private readonly maxQueue: number;

  private activeCount = 0;
  private readonly queue: Array<QueueEntry<unknown>> = [];

  /**
   * Creates a new bulkhead.
   * @param options - Concurrency and queue limits.
   */
  constructor(options: BulkheadOptions) {
    this.maxConcurrent = options.maxConcurrent;
    this.maxQueue = options.maxQueue ?? Infinity;
  }

  /** The number of operations currently running. */
  get active(): number {
    return this.activeCount;
  }

  /** The number of operations currently waiting in the queue. */
  get queued(): number {
    return this.queue.length;
  }

  /**
   * Executes the supplied function within the bulkhead's concurrency limits.
   * @typeParam T - The resolved value type of the wrapped function.
   * @param fn - The asynchronous operation to run.
   * @returns The resolved value of `fn`.
   * @throws {BulkheadFullError} When the queue is full.
   */
  execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeCount < this.maxConcurrent) {
      return this.run(fn);
    }

    if (this.queue.length >= this.maxQueue) {
      return Promise.reject(new BulkheadFullError());
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        fn: fn as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
    });
  }

  private run<T>(fn: () => Promise<T>): Promise<T> {
    this.activeCount++;
    return (async () => {
      try {
        return await fn();
      } finally {
        this.activeCount--;
        this.dequeue();
      }
    })();
  }

  private dequeue(): void {
    if (this.activeCount >= this.maxConcurrent) {
      return;
    }
    const entry = this.queue.shift();
    if (entry === undefined) {
      return;
    }
    this.run(entry.fn).then(entry.resolve, entry.reject);
  }
}
