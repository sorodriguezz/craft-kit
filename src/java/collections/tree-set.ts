import { type Comparator, naturalOrder } from "../../common/comparator";

/**
 * Sorted set mirroring java.util.TreeSet. Elements are ordered by the
 * comparator; membership uses binary search (O(log n)).
 * @typeParam T element type
 */
export class TreeSet<T> implements Iterable<T> {
  private elements: T[] = [];

  constructor(
    private readonly comparator: Comparator<T> = naturalOrder,
    initial?: Iterable<T>
  ) {
    if (initial) for (const v of initial) this.add(v);
  }

  private locate(value: T): { found: boolean; index: number } {
    let lo = 0;
    let hi = this.elements.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const cmp = this.comparator(value, this.elements[mid]);
      if (cmp === 0) return { found: true, index: mid };
      if (cmp < 0) hi = mid - 1;
      else lo = mid + 1;
    }
    return { found: false, index: lo };
  }

  /** Adds a value. Returns false if an equal value was already present. */
  add(value: T): boolean {
    const { found, index } = this.locate(value);
    if (found) return false;
    this.elements.splice(index, 0, value);
    return true;
  }

  remove(value: T): boolean {
    const { found, index } = this.locate(value);
    if (!found) return false;
    this.elements.splice(index, 1);
    return true;
  }

  contains(value: T): boolean {
    return this.locate(value).found;
  }

  first(): T | undefined {
    return this.elements[0];
  }

  last(): T | undefined {
    return this.elements[this.elements.length - 1];
  }

  /** Greatest element <= value. */
  floor(value: T): T | undefined {
    const { found, index } = this.locate(value);
    if (found) return this.elements[index];
    return index - 1 >= 0 ? this.elements[index - 1] : undefined;
  }

  /** Least element >= value. */
  ceiling(value: T): T | undefined {
    const { found, index } = this.locate(value);
    if (found) return this.elements[index];
    return index < this.elements.length ? this.elements[index] : undefined;
  }

  /** Greatest element strictly < value. */
  lower(value: T): T | undefined {
    const { found, index } = this.locate(value);
    const i = found ? index - 1 : index - 1;
    return i >= 0 ? this.elements[i] : undefined;
  }

  /** Least element strictly > value. */
  higher(value: T): T | undefined {
    const { found, index } = this.locate(value);
    const i = found ? index + 1 : index;
    return i < this.elements.length ? this.elements[i] : undefined;
  }

  get size(): number {
    return this.elements.length;
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }

  clear(): void {
    this.elements = [];
  }

  toArray(): T[] {
    return [...this.elements];
  }

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.elements;
  }
}
