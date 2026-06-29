/** Options configuring a {@link RateLimiter}. */
export interface RateLimiterOptions {
  /** Number of tokens added each interval. Must be a positive number. */
  tokensPerInterval: number;
  /** Length of the refill interval in milliseconds. Must be positive. */
  intervalMs: number;
  /** Bucket capacity; defaults to `tokensPerInterval`. Must be positive. */
  maxTokens?: number;
}

interface PendingWaiter {
  count: number;
  resolve: () => void;
}

/**
 * Token-bucket rate limiter. The bucket holds up to `maxTokens` tokens and is
 * refilled continuously at a rate of `tokensPerInterval` per `intervalMs`,
 * computed lazily from the elapsed time on each access (no timers run while the
 * bucket is idle). Callers spend tokens either without blocking via
 * {@link tryRemove} or by awaiting {@link removeTokens}.
 *
 * @example
 * const limiter = new RateLimiter({ tokensPerInterval: 5, intervalMs: 1000 });
 * if (limiter.tryRemove()) {
 *   // allowed immediately
 * }
 * await limiter.removeTokens(3); // resolves once 3 tokens are available
 */
export class RateLimiter {
  private readonly tokensPerInterval: number;
  private readonly intervalMs: number;
  private readonly maxTokens: number;
  private tokens: number;
  private lastRefill: number;
  private readonly waiters: PendingWaiter[] = [];

  /**
   * @param options refill rate, interval and optional capacity
   * @throws RangeError if any rate parameter is not a positive number
   */
  constructor(options: RateLimiterOptions) {
    const { tokensPerInterval, intervalMs, maxTokens } = options;
    if (!Number.isFinite(tokensPerInterval) || tokensPerInterval <= 0) {
      throw new RangeError("tokensPerInterval must be a positive number");
    }
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
      throw new RangeError("intervalMs must be a positive number");
    }
    if (maxTokens !== undefined && (!Number.isFinite(maxTokens) || maxTokens <= 0)) {
      throw new RangeError("maxTokens must be a positive number");
    }
    this.tokensPerInterval = tokensPerInterval;
    this.intervalMs = intervalMs;
    this.maxTokens = maxTokens ?? tokensPerInterval;
    // Start full so the first burst is allowed up to capacity.
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  /** Adds tokens accrued since the last refill, capped at `maxTokens`. */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed <= 0) return;
    const added = (elapsed / this.intervalMs) * this.tokensPerInterval;
    if (added <= 0) return;
    this.tokens = Math.min(this.maxTokens, this.tokens + added);
    this.lastRefill = now;
  }

  /** Number of whole tokens currently available (after a lazy refill). */
  get availableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /**
   * Attempts to remove `count` tokens without waiting.
   * @param count tokens to remove (default 1); must be a positive integer
   * @returns true if the tokens were available and removed, false otherwise
   * @throws RangeError if `count` is not a positive integer or exceeds capacity
   */
  tryRemove(count = 1): boolean {
    this.validateCount(count);
    this.refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  /**
   * Removes `count` tokens, waiting until enough have accrued. Pending requests
   * are served in FIFO order.
   * @param count tokens to remove (default 1); must be a positive integer
   * @returns a promise that resolves once the tokens have been removed
   * @throws RangeError if `count` is not a positive integer or exceeds capacity
   */
  removeTokens(count = 1): Promise<void> {
    this.validateCount(count);
    this.refill();
    // Fast path: no one is queued and the tokens are already available.
    if (this.waiters.length === 0 && this.tokens >= count) {
      this.tokens -= count;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.waiters.push({ count, resolve });
      this.scheduleDrain();
    });
  }

  private validateCount(count: number): void {
    if (!Number.isInteger(count) || count <= 0) {
      throw new RangeError("count must be a positive integer");
    }
    if (count > this.maxTokens) {
      throw new RangeError(
        `count ${count} exceeds bucket capacity ${this.maxTokens}`
      );
    }
  }

  /** Serves as many queued waiters as the current token balance allows. */
  private drain(): void {
    this.refill();
    while (this.waiters.length > 0) {
      const next = this.waiters[0];
      if (this.tokens < next.count) break;
      this.tokens -= next.count;
      this.waiters.shift();
      next.resolve();
    }
    if (this.waiters.length > 0) {
      this.scheduleDrain();
    }
  }

  /** Schedules a future drain for the moment the head waiter can be served. */
  private scheduleDrain(): void {
    const head = this.waiters[0];
    if (head === undefined) return;
    const deficit = head.count - this.tokens;
    if (deficit <= 0) {
      // Tokens are already sufficient; drain on the next microtask.
      Promise.resolve().then(() => this.drain());
      return;
    }
    const waitMs = (deficit / this.tokensPerInterval) * this.intervalMs;
    const timer = setTimeout(() => this.drain(), Math.ceil(waitMs));
    // Avoid keeping the Node.js event loop alive solely for this timer.
    if (typeof timer.unref === "function") {
      timer.unref();
    }
  }
}
