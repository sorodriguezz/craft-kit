/**
 * Fixed-capacity ring buffer (FIFO). When full, pushing overwrites the oldest
 * element and returns it. Iteration order is oldest -> newest.
 *
 * @typeParam T element type
 */
export class CircularBuffer<T> implements Iterable<T> {
  private readonly buffer: Array<T | undefined>;
  private readonly cap: number;
  private head = 0; // index of the oldest element
  private count = 0;

  /**
   * Creates a buffer holding at most `capacity` elements.
   * @param capacity maximum number of elements; must be a positive integer
   */
  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError("capacity must be a positive integer");
    }
    this.cap = capacity;
    this.buffer = new Array<T | undefined>(capacity);
  }

  /**
   * Appends `item`. If the buffer is full, overwrites and returns the oldest
   * element; otherwise returns undefined.
   */
  push(item: T): T | undefined {
    if (this.count < this.cap) {
      const tail = (this.head + this.count) % this.cap;
      this.buffer[tail] = item;
      this.count++;
      return undefined;
    }
    // Full: head points to the oldest element, which we overwrite.
    const evicted = this.buffer[this.head] as T;
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.cap;
    return evicted;
  }

  /** Removes and returns the oldest element, or undefined if empty. */
  shift(): T | undefined {
    if (this.count === 0) return undefined;
    const value = this.buffer[this.head] as T;
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.cap;
    this.count--;
    return value;
  }

  /** Returns the oldest element without removing it, or undefined if empty. */
  peek(): T | undefined {
    if (this.count === 0) return undefined;
    return this.buffer[this.head] as T;
  }

  /** Number of elements currently stored. */
  get size(): number {
    return this.count;
  }

  /** Maximum number of elements the buffer can hold. */
  get capacity(): number {
    return this.cap;
  }

  isFull(): boolean {
    return this.count === this.cap;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  /** Removes every element. */
  clear(): void {
    this.buffer.fill(undefined);
    this.head = 0;
    this.count = 0;
  }

  /** Returns a copy of the elements ordered oldest -> newest. */
  toArray(): T[] {
    const out = new Array<T>(this.count);
    for (let i = 0; i < this.count; i++) {
      out[i] = this.buffer[(this.head + i) % this.cap] as T;
    }
    return out;
  }

  /** Iterates elements ordered oldest -> newest. */
  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = 0; i < this.count; i++) {
      yield this.buffer[(this.head + i) % this.cap] as T;
    }
  }
}
