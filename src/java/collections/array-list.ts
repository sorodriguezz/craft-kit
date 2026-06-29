/**
 * Resizable, array-backed list mirroring java.util.ArrayList.
 * @typeParam T element type
 */
export class ArrayList<T> implements Iterable<T> {
  private items: T[] = [];

  constructor(initial?: Iterable<T>) {
    if (initial) for (const v of initial) this.items.push(v);
  }

  /** Appends a value. */
  add(value: T): this {
    this.items.push(value);
    return this;
  }

  /** Inserts a value at the given index. */
  addAt(index: number, value: T): void {
    this.items.splice(index, 0, value);
  }

  addAll(values: Iterable<T>): this {
    for (const v of values) this.items.push(v);
    return this;
  }

  get(index: number): T | undefined {
    return this.items[index];
  }

  /** Replaces the value at index, returning the previous value. */
  set(index: number, value: T): T | undefined {
    if (index < 0 || index >= this.items.length) return undefined;
    const old = this.items[index];
    this.items[index] = value;
    return old;
  }

  /** Removes the value at index, returning it. */
  remove(index: number): T | undefined {
    if (index < 0 || index >= this.items.length) return undefined;
    return this.items.splice(index, 1)[0];
  }

  /** Removes the first occurrence of a value. */
  removeValue(value: T): boolean {
    const i = this.items.indexOf(value);
    if (i === -1) return false;
    this.items.splice(i, 1);
    return true;
  }

  indexOf(value: T): number {
    return this.items.indexOf(value);
  }

  contains(value: T): boolean {
    return this.items.includes(value);
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }

  toArray(): T[] {
    return [...this.items];
  }

  forEach(action: (value: T, index: number) => void): void {
    this.items.forEach(action);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.items[Symbol.iterator]();
  }
}
