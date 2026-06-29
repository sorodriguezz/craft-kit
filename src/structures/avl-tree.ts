import { type Comparator, naturalOrder } from "../common/comparator";

class AVLNode<T> {
  left: AVLNode<T> | null = null;
  right: AVLNode<T> | null = null;
  height = 1;
  constructor(public value: T) {}
}

/**
 * Self-balancing binary search tree (AVL tree) ordered by a comparator.
 *
 * Every node keeps the heights of its left and right subtrees within one of
 * each other, guaranteeing O(log n) insertion, removal and lookup. Duplicate
 * values (as judged by the comparator) are ignored. In-order iteration yields
 * elements in ascending order.
 *
 * @typeParam T element type
 *
 * @example
 * const tree = new AVLTree<number>();
 * tree.insert(3).insert(1).insert(2);
 * [...tree]; // [1, 2, 3]
 * tree.height(); // 2 (balanced rather than 3)
 */
export class AVLTree<T> implements Iterable<T> {
  private root: AVLNode<T> | null = null;
  private count = 0;
  private readonly comparator: Comparator<T>;

  /**
   * Creates an empty AVL tree.
   * @param comparator ordering for elements; defaults to natural order
   */
  constructor(comparator: Comparator<T> = naturalOrder) {
    this.comparator = comparator;
  }

  /** Height of a node, treating an absent node as height 0. */
  private nodeHeight(node: AVLNode<T> | null): number {
    return node === null ? 0 : node.height;
  }

  /** Balance factor of a node: height(left) - height(right). */
  private balanceFactor(node: AVLNode<T>): number {
    return this.nodeHeight(node.left) - this.nodeHeight(node.right);
  }

  /** Recomputes a node's cached height from its children. */
  private updateHeight(node: AVLNode<T>): void {
    node.height =
      1 + Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right));
  }

  /** Right rotation around `node` (fixes a left-heavy subtree). */
  private rotateRight(node: AVLNode<T>): AVLNode<T> {
    const pivot = node.left as AVLNode<T>;
    node.left = pivot.right;
    pivot.right = node;
    this.updateHeight(node);
    this.updateHeight(pivot);
    return pivot;
  }

  /** Left rotation around `node` (fixes a right-heavy subtree). */
  private rotateLeft(node: AVLNode<T>): AVLNode<T> {
    const pivot = node.right as AVLNode<T>;
    node.right = pivot.left;
    pivot.left = node;
    this.updateHeight(node);
    this.updateHeight(pivot);
    return pivot;
  }

  /** Restores the AVL invariant at `node`, applying LL/RR/LR/RL rotations. */
  private rebalance(node: AVLNode<T>): AVLNode<T> {
    this.updateHeight(node);
    const balance = this.balanceFactor(node);

    // Left heavy.
    if (balance > 1) {
      const left = node.left as AVLNode<T>;
      // Left-Right case: rotate the left child left first.
      if (this.balanceFactor(left) < 0) {
        node.left = this.rotateLeft(left);
      }
      // Left-Left case.
      return this.rotateRight(node);
    }

    // Right heavy.
    if (balance < -1) {
      const right = node.right as AVLNode<T>;
      // Right-Left case: rotate the right child right first.
      if (this.balanceFactor(right) > 0) {
        node.right = this.rotateRight(right);
      }
      // Right-Right case.
      return this.rotateLeft(node);
    }

    return node;
  }

  /**
   * Inserts `value` if not already present, keeping the tree balanced.
   * @returns this, for chaining
   */
  insert(value: T): this {
    this.root = this.insertNode(this.root, value);
    return this;
  }

  private insertNode(node: AVLNode<T> | null, value: T): AVLNode<T> {
    if (node === null) {
      this.count++;
      return new AVLNode(value);
    }
    const cmp = this.comparator(value, node.value);
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value);
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value);
    } else {
      return node; // duplicate: ignore
    }
    return this.rebalance(node);
  }

  /**
   * Removes `value` if present, keeping the tree balanced.
   * @returns true if a value was removed, false if it was absent
   */
  remove(value: T): boolean {
    const before = this.count;
    this.root = this.removeNode(this.root, value);
    return this.count < before;
  }

  private removeNode(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (node === null) return null;
    const cmp = this.comparator(value, node.value);
    if (cmp < 0) {
      node.left = this.removeNode(node.left, value);
    } else if (cmp > 0) {
      node.right = this.removeNode(node.right, value);
    } else {
      this.count--;
      if (node.left === null) return node.right;
      if (node.right === null) return node.left;
      // Two children: replace value with the in-order successor's value, then
      // delete that successor from the right subtree without counting twice.
      let successor = node.right;
      while (successor.left !== null) successor = successor.left;
      node.value = successor.value;
      this.count++; // compensate the decrement performed by the recursive call
      node.right = this.removeNode(node.right, successor.value);
    }
    return this.rebalance(node);
  }

  /** Returns true if `value` is present. */
  contains(value: T): boolean {
    let current = this.root;
    while (current !== null) {
      const cmp = this.comparator(value, current.value);
      if (cmp === 0) return true;
      current = cmp < 0 ? current.left : current.right;
    }
    return false;
  }

  /** Returns the smallest element, or undefined if the tree is empty. */
  min(): T | undefined {
    if (this.root === null) return undefined;
    let node = this.root;
    while (node.left !== null) node = node.left;
    return node.value;
  }

  /** Returns the largest element, or undefined if the tree is empty. */
  max(): T | undefined {
    if (this.root === null) return undefined;
    let node = this.root;
    while (node.right !== null) node = node.right;
    return node.value;
  }

  /** Number of elements currently stored. */
  get size(): number {
    return this.count;
  }

  /** Height of the tree (0 for an empty tree). */
  height(): number {
    return this.nodeHeight(this.root);
  }

  /** Returns the elements in ascending (in-order) order. */
  inOrder(): T[] {
    const result: T[] = [];
    const walk = (node: AVLNode<T> | null): void => {
      if (node === null) return;
      walk(node.left);
      result.push(node.value);
      walk(node.right);
    };
    walk(this.root);
    return result;
  }

  /** Removes every element. */
  clear(): void {
    this.root = null;
    this.count = 0;
  }

  /** In-order (ascending) iteration. */
  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.inOrder();
  }
}
