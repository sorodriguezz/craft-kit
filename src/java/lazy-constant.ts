/**
 * A value computed at most once and then cached, inspired by Java 25's
 * LazyConstant (JEP 526). In JavaScript's single-threaded model the
 * "at most once" guarantee is inherent.
 * @typeParam T the held value type
 */
export class LazyConstant<T> {
  private computed = false;
  private value: T | undefined;

  private constructor(private readonly supplier?: () => T) {}

  /** Creates a LazyConstant bound to a supplier evaluated on first get(). */
  static of<T>(supplier: () => T): LazyConstant<T> {
    return new LazyConstant<T>(supplier);
  }

  /** Creates an unbound, settable LazyConstant. */
  static empty<T>(): LazyConstant<T> {
    return new LazyConstant<T>();
  }

  /** Returns the value, computing it once from the bound supplier. */
  get(): T {
    if (!this.computed) {
      if (!this.supplier) {
        throw new Error("LazyConstant.get: no supplier and no value set.");
      }
      this.value = this.supplier();
      this.computed = true;
    }
    return this.value as T;
  }

  /** Sets the value only if not already initialized; returns the current value. */
  setIfUnset(value: T): T {
    if (!this.computed) {
      this.value = value;
      this.computed = true;
    }
    return this.value as T;
  }

  /** Computes and caches via `supplier` only if not already initialized. */
  computeIfUnset(supplier: () => T): T {
    if (!this.computed) {
      this.value = supplier();
      this.computed = true;
    }
    return this.value as T;
  }

  /** Whether the value has been initialized. */
  isInitialized(): boolean {
    return this.computed;
  }
}
