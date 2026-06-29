interface ListNode<T> {
  value: T;
  next: ListNode<T> | null;
}

/**
 * Singly linked list with head/tail pointers.
 * @typeParam T element type
 */
export class SinglyLinkedList<T> implements Iterable<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private count = 0;

  /** Inserts at the head. */
  addFirst(value: T): this {
    this.head = { value, next: this.head };
    if (!this.tail) this.tail = this.head;
    this.count++;
    return this;
  }

  /** Appends at the tail. */
  addLast(value: T): this {
    const node: ListNode<T> = { value, next: null };
    if (this.tail) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.count++;
    return this;
  }

  /** Alias of addLast. */
  add(value: T): this {
    return this.addLast(value);
  }

  /** Removes and returns the first element. */
  removeFirst(): T | undefined {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.count--;
    return value;
  }

  /** Returns the element at index, or undefined if out of range. */
  get(index: number): T | undefined {
    if (index < 0 || index >= this.count) return undefined;
    let node = this.head;
    for (let i = 0; i < index && node; i++) node = node.next;
    return node?.value;
  }

  /** Returns the first index of value, or -1. */
  indexOf(value: T): number {
    let node = this.head;
    let i = 0;
    while (node) {
      if (node.value === value) return i;
      node = node.next;
      i++;
    }
    return -1;
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1;
  }

  /** Removes the first node equal to value. Returns true if removed. */
  remove(value: T): boolean {
    let prev: ListNode<T> | null = null;
    let node = this.head;
    while (node) {
      if (node.value === value) {
        if (prev) prev.next = node.next;
        else this.head = node.next;
        if (node === this.tail) this.tail = prev;
        this.count--;
        return true;
      }
      prev = node;
      node = node.next;
    }
    return false;
  }

  /** Reverses the list in place. */
  reverse(): this {
    let prev: ListNode<T> | null = null;
    let node = this.head;
    this.tail = this.head;
    while (node) {
      const next = node.next;
      node.next = prev;
      prev = node;
      node = next;
    }
    this.head = prev;
    return this;
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
