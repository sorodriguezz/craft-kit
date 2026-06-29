/**
 * A lazily evaluated value. The initializer runs at most once, on the first
 * call to {@link Lazy.get}, and the produced value is memoized thereafter.
 * @typeParam T type of the deferred value
 */
export class Lazy<T> {
  private evaluated = false;
  private value: T | undefined;

  constructor(private readonly initializer: () => T) {}

  /** Returns the value, computing and caching it on first access. */
  get(): T {
    if (!this.evaluated) {
      this.value = this.initializer();
      this.evaluated = true;
    }
    return this.value as T;
  }

  /** Returns `true` once the value has been computed. */
  isEvaluated(): boolean {
    return this.evaluated;
  }

  /** Returns a new `Lazy` that maps this value through `fn` when evaluated. */
  map<U>(fn: (value: T) => U): Lazy<U> {
    return new Lazy<U>(() => fn(this.get()));
  }
}
