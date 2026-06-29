interface QueuedTask<T, R> {
  task: T;
  resolve: (value: R) => void;
  reject: (reason: unknown) => void;
}

/**
 * Concurrency limiter for asynchronous tasks. Despite the name it does not use
 * `worker_threads`; instead it caps how many invocations of a single async
 * `worker` function run at the same time. Tasks submitted beyond the limit are
 * queued and started in FIFO order as running tasks settle.
 *
 * @typeParam T task input type
 * @typeParam R task result type
 *
 * @example
 * const pool = new WorkerPool(async (n: number) => n * 2, 2);
 * const results = await pool.runAll([1, 2, 3]); // [2, 4, 6]
 *
 * @example
 * pool.run(10).then(handle);
 * await pool.onIdle(); // resolves when all work has drained
 */
export class WorkerPool<T, R> {
  private readonly worker: (task: T) => Promise<R>;
  private readonly concurrency: number;
  private readonly queue: Array<QueuedTask<T, R>> = [];
  private running = 0;
  private readonly idleWaiters: Array<() => void> = [];

  /**
   * @param worker async function applied to each task
   * @param concurrency maximum number of tasks running at once; positive integer
   * @throws RangeError if `concurrency` is not a positive integer
   */
  constructor(worker: (task: T) => Promise<R>, concurrency: number) {
    if (!Number.isInteger(concurrency) || concurrency <= 0) {
      throw new RangeError("concurrency must be a positive integer");
    }
    this.worker = worker;
    this.concurrency = concurrency;
  }

  /**
   * Submits a task, resolving with its result once it has been processed.
   * @param task input passed to the worker
   * @returns a promise for the worker's result (or rejection)
   */
  run(task: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.dispatch();
    });
  }

  /**
   * Submits every task in `tasks`, resolving with their results in the same
   * order. Rejects if any task rejects.
   * @param tasks inputs to process
   * @returns a promise for the ordered list of results
   */
  runAll(tasks: readonly T[]): Promise<R[]> {
    return Promise.all(tasks.map((task) => this.run(task)));
  }

  /** Number of tasks waiting to start. */
  get pending(): number {
    return this.queue.length;
  }

  /** Number of tasks currently running. */
  get active(): number {
    return this.running;
  }

  /**
   * Resolves when there are no running or queued tasks. Resolves immediately if
   * the pool is already idle.
   */
  onIdle(): Promise<void> {
    if (this.running === 0 && this.queue.length === 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.idleWaiters.push(resolve);
    });
  }

  /** Starts queued tasks while there is spare concurrency. */
  private dispatch(): void {
    while (this.running < this.concurrency && this.queue.length > 0) {
      // shift() is `QueuedTask<T, R> | undefined`; the length guard guarantees
      // an entry is present, so the non-null assertion is safe.
      const item = this.queue.shift()!;
      this.running++;
      // Run the worker; settle the caller's promise, then free the slot.
      Promise.resolve()
        .then(() => this.worker(item.task))
        .then(
          (result) => item.resolve(result),
          (error) => item.reject(error)
        )
        .finally(() => {
          this.running--;
          this.dispatch();
          this.notifyIfIdle();
        });
    }
  }

  /** Resolves any onIdle waiters once the pool has fully drained. */
  private notifyIfIdle(): void {
    if (this.running === 0 && this.queue.length === 0) {
      const waiters = this.idleWaiters.splice(0, this.idleWaiters.length);
      for (const resolve of waiters) {
        resolve();
      }
    }
  }
}
