import { type Comparator, naturalOrder } from "../common/comparator";
import { BinaryHeap } from "./binary-heap";

/**
 * Priority queue backed by a binary heap. Highest priority (lowest value per
 * the comparator) is dequeued first.
 * @typeParam T element type
 */
export class PriorityQueue<T> implements Iterable<T> {
  private readonly heap: BinaryHeap<T>;

  constructor(comparator: Comparator<T> = naturalOrder, initial?: Iterable<T>) {
    this.heap = new BinaryHeap<T>(comparator, initial);
  }

  enqueue(value: T): this {
    this.heap.push(value);
    return this;
  }

  /** Alias of enqueue (Java naming). */
  offer(value: T): this {
    return this.enqueue(value);
  }

  dequeue(): T | undefined {
    return this.heap.pop();
  }

  /** Alias of dequeue (Java naming). */
  poll(): T | undefined {
    return this.heap.pop();
  }

  peek(): T | undefined {
    return this.heap.peek();
  }

  get size(): number {
    return this.heap.size;
  }

  isEmpty(): boolean {
    return this.heap.isEmpty();
  }

  clear(): void {
    this.heap.clear();
  }

  toArray(): T[] {
    return this.heap.toArray();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.heap[Symbol.iterator]();
  }
}
