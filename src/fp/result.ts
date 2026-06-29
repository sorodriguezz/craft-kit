/**
 * A container representing either a successful value (`Ok`) or an error
 * (`Err`), inspired by Rust's `Result` and the functional `Either` type.
 * Instances are immutable: every transformation returns a new `Result`.
 * @typeParam T success value type
 * @typeParam E error type, defaults to {@link Error}
 */
export class Result<T, E = Error> {
  private constructor(
    private readonly ok_: boolean,
    private readonly value: T | undefined,
    private readonly error: E | undefined,
  ) {}

  /** Creates a successful `Result` holding the given value. */
  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  /** Creates a failed `Result` holding the given error. */
  static err<T = never, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  /** Wraps a promise: resolves to Ok on success, Err on rejection. */
  static async fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>> {
    try {
      return Result.ok<T, Error>(await promise);
    } catch (error) {
      return Result.err<T, Error>(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /** Returns `true` when this is a successful `Result`. */
  isOk(): boolean {
    return this.ok_;
  }

  /** Returns `true` when this is a failed `Result`. */
  isErr(): boolean {
    return !this.ok_;
  }

  /** Returns the success value. @throws if this is a failed `Result`. */
  unwrap(): T {
    if (!this.ok_) {
      throw new Error("Result.unwrap: called on an Err value.");
    }
    return this.value as T;
  }

  /** Returns the error. @throws if this is a successful `Result`. */
  unwrapErr(): E {
    if (this.ok_) {
      throw new Error("Result.unwrapErr: called on an Ok value.");
    }
    return this.error as E;
  }

  /** Returns the success value, or `fallback` when this is an `Err`. */
  unwrapOr(fallback: T): T {
    return this.ok_ ? (this.value as T) : fallback;
  }

  /** Returns the success value, or computes one from the error when `Err`. */
  unwrapOrElse(fn: (error: E) => T): T {
    return this.ok_ ? (this.value as T) : fn(this.error as E);
  }

  /** Maps a successful value through `fn`, leaving an `Err` untouched. */
  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.ok_
      ? Result.ok<U, E>(fn(this.value as T))
      : Result.err<U, E>(this.error as E);
  }

  /** Maps an error through `fn`, leaving a successful value untouched. */
  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return this.ok_
      ? Result.ok<T, F>(this.value as T)
      : Result.err<T, F>(fn(this.error as E));
  }

  /** Chains another `Result`-returning computation on a successful value. */
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.ok_
      ? fn(this.value as T)
      : Result.err<U, E>(this.error as E);
  }

  /** Pattern-matches over both branches and returns the handler's result. */
  match<R>(handlers: { ok: (value: T) => R; err: (error: E) => R }): R {
    return this.ok_
      ? handlers.ok(this.value as T)
      : handlers.err(this.error as E);
  }

  /** Returns the success value, or `undefined` when this is an `Err`. */
  getOk(): T | undefined {
    return this.ok_ ? (this.value as T) : undefined;
  }

  /** Returns the error, or `undefined` when this is an `Ok`. */
  getErr(): E | undefined {
    return this.ok_ ? undefined : (this.error as E);
  }

  toString(): string {
    return this.ok_
      ? `Ok(${String(this.value)})`
      : `Err(${String(this.error)})`;
  }
}
