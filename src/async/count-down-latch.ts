/**
 * A synchronization aid that allows one or more callers to wait until a set
 * of operations being performed in other tasks completes.
 *
 * The latch is initialized with a count. Each call to {@link countDown}
 * decrements the count, and {@link wait} resolves once the count reaches zero.
 * The latch is single-use: once it reaches zero it stays there.
 */
export class CountDownLatch {
  private count: number;
  private readonly waiters: Array<() => void> = [];

  /**
   * Creates a new latch.
   * @param count - The initial count; must be a non-negative integer.
   */
  constructor(count: number) {
    this.count = Math.max(0, Math.trunc(count));
  }

  /**
   * Decrements the count by one. When the count reaches zero all pending
   * {@link wait} promises are resolved. Calls after the count is already zero
   * have no effect.
   */
  countDown(): void {
    if (this.count === 0) {
      return;
    }
    this.count--;
    if (this.count === 0) {
      this.release();
    }
  }

  /**
   * Returns a promise that resolves once the count reaches zero. If the count
   * is already zero the returned promise is already resolved.
   * @returns A promise fulfilled when the latch opens.
   */
  wait(): Promise<void> {
    if (this.count === 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.waiters.push(resolve);
    });
  }

  /** The current count remaining before the latch opens. */
  getCount(): number {
    return this.count;
  }

  private release(): void {
    while (this.waiters.length > 0) {
      const resolve = this.waiters.shift();
      if (resolve !== undefined) {
        resolve();
      }
    }
  }
}
