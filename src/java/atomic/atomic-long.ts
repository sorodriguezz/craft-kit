/**
 * BigInt holder with Java AtomicLong-style operations (64-bit safe via BigInt).
 */
export class AtomicLong {
  constructor(private value: bigint = 0n) {}

  get(): bigint {
    return this.value;
  }

  set(newValue: bigint): void {
    this.value = newValue;
  }

  getAndSet(newValue: bigint): bigint {
    const old = this.value;
    this.value = newValue;
    return old;
  }

  incrementAndGet(): bigint {
    return ++this.value;
  }

  decrementAndGet(): bigint {
    return --this.value;
  }

  getAndIncrement(): bigint {
    return this.value++;
  }

  getAndDecrement(): bigint {
    return this.value--;
  }

  addAndGet(delta: bigint): bigint {
    this.value += delta;
    return this.value;
  }

  getAndAdd(delta: bigint): bigint {
    const old = this.value;
    this.value += delta;
    return old;
  }

  compareAndSet(expected: bigint, update: bigint): boolean {
    if (this.value === expected) {
      this.value = update;
      return true;
    }
    return false;
  }

  updateAndGet(updater: (value: bigint) => bigint): bigint {
    this.value = updater(this.value);
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }
}
