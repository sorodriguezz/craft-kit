import { type Comparator, naturalOrder } from "../common/comparator";

class SkipListNode<T> {
  /** Forward pointers, one per level the node participates in. */
  readonly forward: Array<SkipListNode<T> | null>;
  constructor(
    public readonly value: T | undefined,
    level: number
  ) {
    this.forward = new Array<SkipListNode<T> | null>(level).fill(null);
  }
}

/**
 * Probabilistic ordered collection (skip list) offering expected O(log n)
 * insertion, removal and lookup without rotations. Nodes are linked in several
 * forward lists; higher levels skip over more elements, which lets searches
 * descend quickly. Duplicate values (as judged by the comparator) are ignored.
 *
 * @typeParam T element type
 *
 * @example
 * const list = new SkipList<number>();
 * list.insert(3).insert(1).insert(2);
 * list.toArray(); // [1, 2, 3]
 * list.contains(2); // true
 */
export class SkipList<T> implements Iterable<T> {
  private readonly head: SkipListNode<T>;
  private readonly maxLevel: number;
  private readonly p: number;
  private readonly comparator: Comparator<T>;
  private level = 1;
  private count = 0;

  /**
   * Creates an empty skip list.
   * @param comparator ordering for elements; defaults to natural order
   * @param maxLevel maximum number of levels; must be a positive integer (default 16)
   * @param p probability of a node rising to the next level, in (0, 1) (default 0.5)
   */
  constructor(
    comparator: Comparator<T> = naturalOrder,
    maxLevel = 16,
    p = 0.5
  ) {
    if (!Number.isInteger(maxLevel) || maxLevel <= 0) {
      throw new RangeError("maxLevel must be a positive integer");
    }
    if (!(p > 0 && p < 1)) {
      throw new RangeError("p must be a number in the open interval (0, 1)");
    }
    this.comparator = comparator;
    this.maxLevel = maxLevel;
    this.p = p;
    // The header node has no value and the maximum number of forward pointers.
    this.head = new SkipListNode<T>(undefined, maxLevel);
  }

  /** Randomly chooses a level (>= 1, <= maxLevel) for a new node. */
  private randomLevel(): number {
    let level = 1;
    while (Math.random() < this.p && level < this.maxLevel) {
      level++;
    }
    return level;
  }

  /**
   * Inserts `value` if not already present.
   * @returns this, for chaining
   */
  insert(value: T): this {
    const update = new Array<SkipListNode<T>>(this.maxLevel);
    let current = this.head;

    // Walk from the top level down, recording the last node before the
    // insertion point at each level.
    for (let i = this.level - 1; i >= 0; i--) {
      let next = current.forward[i];
      while (next !== null && this.comparator(next.value as T, value) < 0) {
        current = next;
        next = current.forward[i];
      }
      update[i] = current;
    }

    const candidate = current.forward[0];
    if (
      candidate !== null &&
      this.comparator(candidate.value as T, value) === 0
    ) {
      return this; // duplicate: ignore
    }

    const newLevel = this.randomLevel();
    if (newLevel > this.level) {
      for (let i = this.level; i < newLevel; i++) {
        update[i] = this.head;
      }
      this.level = newLevel;
    }

    const node = new SkipListNode<T>(value, newLevel);
    for (let i = 0; i < newLevel; i++) {
      const prev = update[i];
      node.forward[i] = prev.forward[i];
      prev.forward[i] = node;
    }
    this.count++;
    return this;
  }

  /**
   * Removes `value` if present.
   * @returns true if a value was removed, false if it was absent
   */
  remove(value: T): boolean {
    const update = new Array<SkipListNode<T>>(this.maxLevel);
    let current = this.head;

    for (let i = this.level - 1; i >= 0; i--) {
      let next = current.forward[i];
      while (next !== null && this.comparator(next.value as T, value) < 0) {
        current = next;
        next = current.forward[i];
      }
      update[i] = current;
    }

    const target = current.forward[0];
    if (target === null || this.comparator(target.value as T, value) !== 0) {
      return false;
    }

    // Unlink the target at every level it participates in.
    for (let i = 0; i < this.level; i++) {
      if (update[i].forward[i] !== target) break;
      update[i].forward[i] = target.forward[i];
    }

    // Lower the list level if the top levels are now empty.
    while (this.level > 1 && this.head.forward[this.level - 1] === null) {
      this.level--;
    }
    this.count--;
    return true;
  }

  /** Returns true if `value` is present. */
  contains(value: T): boolean {
    let current = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      let next = current.forward[i];
      while (next !== null && this.comparator(next.value as T, value) < 0) {
        current = next;
        next = current.forward[i];
      }
    }
    const candidate = current.forward[0];
    return (
      candidate !== null && this.comparator(candidate.value as T, value) === 0
    );
  }

  /** Number of elements currently stored. */
  get size(): number {
    return this.count;
  }

  /** Returns the elements in ascending order. */
  toArray(): T[] {
    const result: T[] = [];
    let node = this.head.forward[0];
    while (node !== null) {
      result.push(node.value as T);
      node = node.forward[0];
    }
    return result;
  }

  /** Ascending iteration over the elements. */
  *[Symbol.iterator](): IterableIterator<T> {
    let node = this.head.forward[0];
    while (node !== null) {
      yield node.value as T;
      node = node.forward[0];
    }
  }
}
