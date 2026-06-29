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
}
