/**
 * A promise whose `resolve` and `reject` callbacks are exposed as instance
 * methods, allowing the promise to be settled from outside the executor.
 * Useful for bridging callback-based APIs or coordinating across scopes.
 *
 * @typeParam T - The resolved value type.
 *
 * @example
 * const d = new Deferred<number>();
 * setTimeout(() => d.resolve(42), 100);
 * const value = await d.promise; // 42
 */
export class Deferred<T> {
  /** The underlying promise controlled by this deferred. */
  readonly promise: Promise<T>;

  /** Settle {@link promise} with the given value. */
  resolve!: (value: T | PromiseLike<T>) => void;

  /** Reject {@link promise} with the given reason. */
  reject!: (reason?: unknown) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
