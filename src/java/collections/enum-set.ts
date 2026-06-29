/**
 * A set of string or numeric constants, mirroring the spirit of
 * java.util.EnumSet. Backed by a native `Set`; the type parameter constrains
 * members to a known enum-like domain. Iteration follows insertion order.
 * @typeParam T member type (a string or number, typically a TypeScript enum)
 */
export class EnumSet<T extends string | number> implements Iterable<T> {
  private readonly set = new Set<T>();

  /**
   * Creates an enum set, optionally seeded with initial members.
   * @param initial optional iterable of members to insert
   */
  constructor(initial?: Iterable<T>) {
    if (initial) {
      for (const value of initial) this.set.add(value);
    }
  }

  /**
   * Builds an enum set from the given values.
   * @param values members to include
   * @returns a new enum set containing the values
   */
  static of<T extends string | number>(...values: T[]): EnumSet<T> {
    return new EnumSet<T>(values);
  }

  /**
   * Adds a member to the set.
   * @param value member to add
   * @returns this set for chaining
   */
  add(value: T): this {
    this.set.add(value);
    return this;
  }

  /**
   * Tests whether a member is present.
   * @param value member to test
   * @returns `true` if the member exists
   */
  has(value: T): boolean {
    return this.set.has(value);
  }

  /**
   * Removes a member from the set.
   * @param value member to remove
   * @returns `true` if the member existed and was removed
   */
  delete(value: T): boolean {
    return this.set.delete(value);
  }

  /** Number of members in the set. */
  get size(): number {
    return this.set.size;
  }

  /**
   * Returns the members as an array in insertion order.
   * @returns array of members
   */
  toArray(): T[] {
    return [...this.set];
  }

  /**
   * Iterates over the members in insertion order.
   * @returns an iterator over the members
   */
  [Symbol.iterator](): IterableIterator<T> {
    return this.set[Symbol.iterator]();
  }
}
