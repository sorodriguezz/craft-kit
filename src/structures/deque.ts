import { DoublyLinkedList } from "./doubly-linked-list";

/**
 * Double-ended queue (add/remove at both ends in O(1)).
 * Implemented by delegation to a doubly linked list.
 * @typeParam T element type
 */
export class Deque<T> implements Iterable<T> {
  private readonly list = new DoublyLinkedList<T>();

  addFirst(value: T): this {
    this.list.addFirst(value);
    return this;
  }

  addLast(value: T): this {
    this.list.addLast(value);
    return this;
  }

  removeFirst(): T | undefined {
    return this.list.removeFirst();
  }

  removeLast(): T | undefined {
    return this.list.removeLast();
  }

  peekFirst(): T | undefined {
    return this.list.peekFirst();
  }

  peekLast(): T | undefined {
    return this.list.peekLast();
  }

  get size(): number {
    return this.list.size;
  }

  isEmpty(): boolean {
    return this.list.isEmpty();
  }

  clear(): void {
    this.list.clear();
  }

  toArray(): T[] {
    return this.list.toArray();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.list[Symbol.iterator]();
  }
}
