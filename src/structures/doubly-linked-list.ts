interface DLLNode<T> {
  value: T;
  prev: DLLNode<T> | null;
  next: DLLNode<T> | null;
}

/**
 * Doubly linked list supporting both list and deque operations.
 * Also serves as the Java-style `LinkedList`.
 * @typeParam T element type
 */
export class DoublyLinkedList<T> implements Iterable<T> {
  private head: DLLNode<T> | null = null;
  private tail: DLLNode<T> | null = null;
  private count = 0;

  addFirst(value: T): this {
    const node: DLLNode<T> = { value, prev: null, next: this.head };
    if (this.head) this.head.prev = node;
    else this.tail = node;
    this.head = node;
    this.count++;
    return this;
  }

  addLast(value: T): this {
    const node: DLLNode<T> = { value, prev: this.tail, next: null };
    if (this.tail) this.tail.next = node;
    else this.head = node;
    this.tail = node;
    this.count++;
    return this;
  }

  /** Alias of addLast. */
  add(value: T): this {
    return this.addLast(value);
  }

  removeFirst(): T | undefined {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    this.count--;
    return value;
  }

  removeLast(): T | undefined {
    if (!this.tail) return undefined;
    const value = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) this.tail.next = null;
    else this.head = null;
    this.count--;
    return value;
  }

  peekFirst(): T | undefined {
    return this.head?.value;
  }

  peekLast(): T | undefined {
    return this.tail?.value;
  }

  private nodeAt(index: number): DLLNode<T> | null {
    if (index < 0 || index >= this.count) return null;
    // Walk from the nearer end.
    if (index < this.count / 2) {
      let node = this.head;
      for (let i = 0; i < index && node; i++) node = node.next;
      return node;
    }
    let node = this.tail;
    for (let i = this.count - 1; i > index && node; i--) node = node.prev;
    return node;
  }

  get(index: number): T | undefined {
    return this.nodeAt(index)?.value;
  }

  set(index: number, value: T): boolean {
    const node = this.nodeAt(index);
    if (!node) return false;
    node.value = value;
    return true;
  }

  removeAt(index: number): T | undefined {
    const node = this.nodeAt(index);
    if (!node) return undefined;
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
    this.count--;
    return node.value;
  }

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

  /** Removes the first node equal to value. */
  remove(value: T): boolean {
    const index = this.indexOf(value);
    if (index === -1) return false;
    this.removeAt(index);
    return true;
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

  /** Iterates from tail to head. */
  *reverseIterator(): IterableIterator<T> {
    let node = this.tail;
    while (node) {
      yield node.value;
      node = node.prev;
    }
  }

  /** First element, or undefined if empty (SequencedCollection). */
  getFirst(): T | undefined {
    return this.peekFirst();
  }

  /** Last element, or undefined if empty (SequencedCollection). */
  getLast(): T | undefined {
    return this.peekLast();
  }

  /** Returns a new list with the elements in reverse order. */
  reversed(): DoublyLinkedList<T> {
    const list = new DoublyLinkedList<T>();
    for (const value of this.reverseIterator()) list.addLast(value);
    return list;
  }
}
