/**
 * LIFO stack. Iteration order is top -> bottom.
 * @typeParam T element type
 */
export class Stack<T> implements Iterable<T> {
  private items: T[] = [];

  /** Pushes an element onto the top of the stack. */
  push(item: T): this {
    this.items.push(item);
    return this;
  }

  /** Removes and returns the top element, or undefined if empty. */
  pop(): T | undefined {
    return this.items.pop();
  }

  /** Returns the top element without removing it. */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
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

  /** Returns a copy of the elements from bottom to top. */
  toArray(): T[] {
    return [...this.items];
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = this.items.length - 1; i >= 0; i--) {
      yield this.items[i]!;
    }
  }
}
