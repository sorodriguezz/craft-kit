/** Boolean holder with Java AtomicBoolean-style operations. */
export class AtomicBoolean {
  constructor(private value = false) {}

  get(): boolean {
    return this.value;
  }

  set(newValue: boolean): void {
    this.value = newValue;
  }

  getAndSet(newValue: boolean): boolean {
    const old = this.value;
    this.value = newValue;
    return old;
  }

  compareAndSet(expected: boolean, update: boolean): boolean {
    if (this.value === expected) {
      this.value = update;
      return true;
    }
    return false;
  }

  toString(): string {
    return String(this.value);
  }
}
