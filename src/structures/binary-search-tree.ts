import { type Comparator, naturalOrder } from "../common/comparator";

class BSTNode<T> {
  left: BSTNode<T> | null = null;
  right: BSTNode<T> | null = null;
  constructor(public value: T) {}
}

/**
 * Unbalanced binary search tree ordered by a comparator.
 * In-order iteration yields elements in ascending order.
 * @typeParam T element type
 */
export class BinarySearchTree<T> implements Iterable<T> {
  private root: BSTNode<T> | null = null;
  private count = 0;

  constructor(private readonly comparator: Comparator<T> = naturalOrder) {}

  insert(value: T): this {
    const node = new BSTNode(value);
    if (!this.root) {
      this.root = node;
      this.count++;
      return this;
    }
    let current = this.root;
    for (;;) {
      const cmp = this.comparator(value, current.value);
      if (cmp === 0) return this; // ignore duplicates
      if (cmp < 0) {
        if (!current.left) {
          current.left = node;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = node;
          break;
        }
        current = current.right;
      }
    }
    this.count++;
    return this;
  }

  contains(value: T): boolean {
    let current = this.root;
    while (current) {
      const cmp = this.comparator(value, current.value);
      if (cmp === 0) return true;
      current = cmp < 0 ? current.left : current.right;
    }
    return false;
  }

  remove(value: T): boolean {
    const before = this.count;
    this.root = this.removeNode(this.root, value);
    return this.count < before;
  }

  private removeNode(node: BSTNode<T> | null, value: T): BSTNode<T> | null {
    if (!node) return null;
    const cmp = this.comparator(value, node.value);
    if (cmp < 0) {
      node.left = this.removeNode(node.left, value);
    } else if (cmp > 0) {
      node.right = this.removeNode(node.right, value);
    } else {
      this.count--;
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      // Two children: replace with in-order successor.
      let successor = node.right;
      while (successor.left) successor = successor.left;
      node.value = successor.value;
      node.right = this.removeNode(node.right, successor.value);
      this.count++; // compensate: successor removal decremented once already
    }
    return node;
  }

  min(): T | undefined {
    if (!this.root) return undefined;
    let node = this.root;
    while (node.left) node = node.left;
    return node.value;
  }

  max(): T | undefined {
    if (!this.root) return undefined;
    let node = this.root;
    while (node.right) node = node.right;
    return node.value;
  }

  /** Maximum depth of the tree. */
  height(): number {
    const walk = (node: BSTNode<T> | null): number =>
      node ? 1 + Math.max(walk(node.left), walk(node.right)) : 0;
    return walk(this.root);
  }

  inOrder(): T[] {
    const result: T[] = [];
    const walk = (node: BSTNode<T> | null): void => {
      if (!node) return;
      walk(node.left);
      result.push(node.value);
      walk(node.right);
    };
    walk(this.root);
    return result;
  }

  preOrder(): T[] {
    const result: T[] = [];
    const walk = (node: BSTNode<T> | null): void => {
      if (!node) return;
      result.push(node.value);
      walk(node.left);
      walk(node.right);
    };
    walk(this.root);
    return result;
  }

  postOrder(): T[] {
    const result: T[] = [];
    const walk = (node: BSTNode<T> | null): void => {
      if (!node) return;
      walk(node.left);
      walk(node.right);
      result.push(node.value);
    };
    walk(this.root);
    return result;
  }

  get size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  clear(): void {
    this.root = null;
    this.count = 0;
  }

  /** In-order (ascending) iteration. */
  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.inOrder();
  }
}
