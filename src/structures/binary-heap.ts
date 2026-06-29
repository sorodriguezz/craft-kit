import { type Comparator, naturalOrder, reversed } from "../common/comparator";

/**
 * Binary heap. With the natural-order comparator it behaves as a min-heap.
 * @typeParam T element type
 */
export class BinaryHeap<T> implements Iterable<T> {
  protected readonly heap: T[] = [];

  constructor(
    protected readonly comparator: Comparator<T> = naturalOrder,
    initial?: Iterable<T>
  ) {
    if (initial) {
      for (const value of initial) this.push(value);
    }
  }

  /** Inserts a value, keeping the heap invariant. */
  push(value: T): this {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
    return this;
  }

  /** Removes and returns the root (min for a min-heap). */
  pop(): T | undefined {
    const n = this.heap.length;
    if (n === 0) return undefined;
    const top = this.heap[0]!;
    const last = this.heap.pop()!;
    if (n > 1) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  private bubbleUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.comparator(this.heap[i]!, this.heap[parent]!) >= 0) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  private bubbleDown(index: number): void {
    const n = this.heap.length;
    let i = index;
    for (;;) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.comparator(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left;
      }
      if (right < n && this.comparator(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right;
      }
      if (smallest === i) break;
      this.swap(i, smallest);
      i = smallest;
    }
  }

  private swap(i: number, j: number): void {
    const tmp = this.heap[i]!;
    this.heap[i] = this.heap[j]!;
    this.heap[j] = tmp;
  }

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  clear(): void {
    this.heap.length = 0;
  }

  /** Returns the backing array (heap order, not sorted). */
  toArray(): T[] {
    return [...this.heap];
  }

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.heap;
  }
}

/** Min-heap: smallest element (per comparator) is at the top. */
export class MinHeap<T> extends BinaryHeap<T> {
  constructor(comparator: Comparator<T> = naturalOrder, initial?: Iterable<T>) {
    super(comparator, initial);
  }
}

/** Max-heap: largest element (per comparator) is at the top. */
export class MaxHeap<T> extends BinaryHeap<T> {
  constructor(comparator: Comparator<T> = naturalOrder, initial?: Iterable<T>) {
    super(reversed(comparator), initial);
  }
}
