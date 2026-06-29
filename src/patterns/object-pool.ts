/**
 * Options controlling an {@link ObjectPool}.
 *
 * @typeParam T - The pooled item type.
 */
export interface ObjectPoolOptions<T> {
  /** Optional cleanup applied to an item when it is released back. */
  reset?: (item: T) => void;
  /** Number of items to pre-create when the pool is constructed. */
  initialSize?: number;
  /**
   * Maximum number of idle items to retain. Items released beyond this cap are
   * discarded rather than pooled. Defaults to unbounded.
   */
  maxSize?: number;
}

/**
 * A pool that recycles reusable objects to avoid repeated allocation. Items
 * are obtained with {@link acquire} and returned with {@link release}; a
 * factory creates new items on demand when the pool is empty.
 *
 * @typeParam T - The pooled item type.
 *
 * @example
 * const pool = new ObjectPool(() => ({ buf: new Array(1024) }), {
 *   reset: (item) => item.buf.fill(0),
 *   initialSize: 4,
 * });
 * const item = pool.acquire();
 * pool.release(item);
 */
export class ObjectPool<T> {
  private readonly available: T[] = [];
  private readonly factory: () => T;
  private readonly reset?: (item: T) => void;
  private readonly maxSize: number;
  private borrowedCount = 0;

  /**
   * Create an object pool.
   *
   * @param factory - Creates a fresh item when none are available.
   * @param options - Optional reset hook, initial size and maximum idle size.
   */
  constructor(factory: () => T, options: ObjectPoolOptions<T> = {}) {
    this.factory = factory;
    this.reset = options.reset;
    this.maxSize = options.maxSize ?? Number.POSITIVE_INFINITY;
    const initialSize = options.initialSize ?? 0;
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  /**
   * Borrow an item from the pool, creating a new one via the factory if none
   * are idle.
   *
   * @returns An available item.
   */
  acquire(): T {
    const item = this.available.pop();
    this.borrowedCount++;
    if (item === undefined) {
      return this.factory();
    }
    return item;
  }

  /**
   * Return an item to the pool. The reset hook, if any, runs before the item
   * is pooled. Items returned once the pool is at `maxSize` idle entries are
   * discarded.
   *
   * @param item - The item to release.
   */
  release(item: T): void {
    if (this.borrowedCount > 0) this.borrowedCount--;
    this.reset?.(item);
    if (this.available.length < this.maxSize) {
      this.available.push(item);
    }
  }

  /** The number of idle items currently available in the pool. */
  get size(): number {
    return this.available.length;
  }

  /** The number of items currently borrowed and not yet released. */
  get borrowed(): number {
    return this.borrowedCount;
  }
}
