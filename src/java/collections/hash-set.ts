/**
 * Set mirroring java.util.HashSet, backed by a native Set.
 * @typeParam T element type
 */
export class HashSet<T> implements Iterable<T> {
  protected readonly set: Set<T>;

  constructor(initial?: Iterable<T>) {
    this.set = new Set<T>(initial);
  }

  /** Adds a value. Returns false if it was already present. */
  add(value: T): boolean {
    if (this.set.has(value)) return false;
    this.set.add(value);
    return true;
  }

  addAll(values: Iterable<T>): this {
    for (const v of values) this.set.add(v);
    return this;
  }

  remove(value: T): boolean {
    return this.set.delete(value);
  }

  contains(value: T): boolean {
    return this.set.has(value);
  }

  get size(): number {
    return this.set.size;
  }

  isEmpty(): boolean {
    return this.set.size === 0;
  }

  clear(): void {
    this.set.clear();
  }

  toArray(): T[] {
    return [...this.set];
  }

  forEach(action: (value: T) => void): void {
    this.set.forEach((value) => action(value));
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.set[Symbol.iterator]();
  }
}
