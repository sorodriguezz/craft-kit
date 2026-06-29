/**
 * Number holder with Java AtomicInteger-style operations. JavaScript is
 * single-threaded, so these provide API parity and convenient read-modify-write
 * helpers rather than hardware atomics.
 */
export class AtomicInteger {
  constructor(private value = 0) {}

  get(): number {
    return this.value;
  }

  set(newValue: number): void {
    this.value = newValue;
  }

  getAndSet(newValue: number): number {
    const old = this.value;
    this.value = newValue;
    return old;
  }

  incrementAndGet(): number {
    return ++this.value;
  }

  decrementAndGet(): number {
    return --this.value;
  }

  getAndIncrement(): number {
    return this.value++;
  }

  getAndDecrement(): number {
    return this.value--;
  }

  addAndGet(delta: number): number {
    this.value += delta;
    return this.value;
  }

  getAndAdd(delta: number): number {
    const old = this.value;
    this.value += delta;
    return old;
  }

  compareAndSet(expected: number, update: number): boolean {
    if (this.value === expected) {
      this.value = update;
      return true;
    }
    return false;
  }

  updateAndGet(updater: (value: number) => number): number {
    this.value = updater(this.value);
    return this.value;
  }

  getAndUpdate(updater: (value: number) => number): number {
    const old = this.value;
    this.value = updater(old);
    return old;
  }

  toString(): string {
    return String(this.value);
  }

  /** Atomically sets to `update` if current equals `expected`; returns the witnessed value. */
  compareAndExchange(expected: number, update: number): number {
    const witness = this.value;
    if (witness === expected) this.value = update;
    return witness;
  }

  /** Applies `fn(current, given)`, stores and returns the new value. */
  accumulateAndGet(given: number, fn: (current: number, given: number) => number): number {
    this.value = fn(this.value, given);
    return this.value;
  }

  /** Applies `fn(current, given)`, stores it and returns the previous value. */
  getAndAccumulate(given: number, fn: (current: number, given: number) => number): number {
    const previous = this.value;
    this.value = fn(previous, given);
    return previous;
  }
}
