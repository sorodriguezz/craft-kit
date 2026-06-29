/**
 * A mutual-exclusion lock that serializes access to a critical section. It is
 * a single-permit semaphore where acquiring yields a release function instead
 * of requiring a paired `release()` call. Waiters are served in FIFO order.
 *
 * @example
 * const mutex = new Mutex();
 * const release = await mutex.acquire();
 * try {
 *   // exclusive section
 * } finally {
 *   release();
 * }
 */
export class Mutex {
  private locked = false;
  private readonly waiters: Array<() => void> = [];

  /** Whether the lock is currently held. */
  isLocked(): boolean {
    return this.locked;
  }

  /**
   * Acquire the lock, waiting if it is already held.
   *
   * @returns A promise resolving with an idempotent release function. Calling
   * the returned function more than once has no additional effect.
   */
  acquire(): Promise<() => void> {
    if (!this.locked) {
      this.locked = true;
      return Promise.resolve(this.createRelease());
    }
    return new Promise<() => void>((resolve) => {
      this.waiters.push(() => resolve(this.createRelease()));
    });
  }

  /**
   * Acquire the lock, run `fn`, then release the lock even if `fn` throws.
   *
   * @typeParam T - The resolved value type of `fn`.
   * @param fn - Work to run while holding the lock.
   * @returns A promise resolving with the result of `fn`.
   */
  async runExclusive<T>(fn: () => Promise<T> | T): Promise<T> {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  private createRelease(): () => void {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      if (this.waiters.length > 0) {
        // Lock stays held; ownership passes directly to the next waiter.
        // shift() is typed `(() => void) | undefined`; the length guard ensures
        // a waiter exists, so the non-null assertion is safe.
        const next = this.waiters.shift()!;
        next();
      } else {
        this.locked = false;
      }
    };
  }
}
