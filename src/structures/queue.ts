interface QueueNode<T> {
  value: T;
  next: QueueNode<T> | null;
}

/**
 * FIFO queue backed by a singly linked list (O(1) enqueue/dequeue).
 * @typeParam T element type
 */
export class Queue<T> implements Iterable<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private count = 0;

  /** Adds an element to the back of the queue. */
  enqueue(item: T): this {
    const node: QueueNode<T> = { value: item, next: null };
    if (this.tail) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.count++;
    return this;
  }

  /** Removes and returns the front element, or undefined if empty. */
  dequeue(): T | undefined {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.count--;
    return value;
  }

  /** Returns the front element without removing it. */
  peek(): T | undefined {
    return this.head ? this.head.value : undefined;
  }

  get size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.count = 0;
  }

  toArray(): T[] {
    return [...this];
  }

  *[Symbol.iterator](): IterableIterator<T> {
    let node = this.head;
    while (node) {
      yield node.value;
      node = node.next;
    }
  }
}
