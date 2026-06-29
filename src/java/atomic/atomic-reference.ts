/**
 * Reference holder with Java AtomicReference-style operations.
 * @typeParam T referenced type
 */
export class AtomicReference<T> {
  constructor(private value: T) {}

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    this.value = newValue;
  }

  getAndSet(newValue: T): T {
    const old = this.value;
    this.value = newValue;
    return old;
  }

  compareAndSet(expected: T, update: T): boolean {
    if (this.value === expected) {
      this.value = update;
      return true;
    }
    return false;
  }

  updateAndGet(updater: (value: T) => T): T {
    this.value = updater(this.value);
    return this.value;
  }

  getAndUpdate(updater: (value: T) => T): T {
    const old = this.value;
    this.value = updater(old);
    return old;
  }

  toString(): string {
    return String(this.value);
  }

  /** Atomically sets to `update` if current equals `expected`; returns the witnessed value. */
  compareAndExchange(expected: T, update: T): T {
    const witness = this.value;
    if (witness === expected) this.value = update;
    return witness;
  }

  /** Applies `fn(current, given)`, stores and returns the new value. */
  accumulateAndGet(given: T, fn: (current: T, given: T) => T): T {
    this.value = fn(this.value, given);
    return this.value;
  }
}
