/**
 * A counting semaphore that limits how many callers may hold a permit at once.
 * Waiters are queued and granted permits in FIFO order as they are released.
 *
 * @example
 * const sem = new Semaphore(2);
 * await sem.acquire();
 * try {
 *   // at most two callers reach this point concurrently
 * } finally {
 *   sem.release();
 * }
 */
export class Semaphore {
  private permits: number;
  private readonly waiters: Array<() => void> = [];

  /**
   * @param permits - Initial number of available permits. Must be a
   * non-negative integer.
   */
  constructor(permits: number) {
    if (!Number.isInteger(permits) || permits < 0) {
      throw new Error("Semaphore: permits must be a non-negative integer.");
    }
    this.permits = permits;
  }

  /** Number of permits currently available. */
  get availablePermits(): number {
    return this.permits;
  }

  /**
   * Acquire a permit, waiting if none are currently available.
   *
   * @returns A promise that resolves once a permit has been granted.
   */
  acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.waiters.push(resolve);
    });
  }

  /**
   * Release a permit. If callers are waiting, the longest-waiting one is
   * granted the permit directly; otherwise the permit count is incremented.
   */
  release(): void {
    if (this.waiters.length > 0) {
      // shift() is typed `(() => void) | undefined`; the length guard ensures a
      // waiter exists, so the non-null assertion is safe.
      const next = this.waiters.shift()!;
      next();
    } else {
      this.permits++;
    }
  }

  /**
   * Acquire a permit, run `fn`, then release the permit even if `fn` throws.
   *
   * @typeParam T - The resolved value type of `fn`.
   * @param fn - Work to run while holding a permit.
   * @returns A promise resolving with the result of `fn`.
   */
  async runExclusive<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}
