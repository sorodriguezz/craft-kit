/**
 * An immutable two-element tuple with named accessors.
 * @typeParam A type of the first element
 * @typeParam B type of the second element
 */
export class Pair<A, B> {
  constructor(
    readonly first: A,
    readonly second: B,
  ) {}

  /** Returns the pair as a fixed-length tuple. */
  toArray(): [A, B] {
    return [this.first, this.second];
  }

  /** Produces a new `Pair` by transforming both elements at once. */
  map<C, D>(fn: (a: A, b: B) => [C, D]): Pair<C, D> {
    const [c, d] = fn(this.first, this.second);
    return new Pair<C, D>(c, d);
  }

  toString(): string {
    return `(${String(this.first)}, ${String(this.second)})`;
  }
}

/**
 * An immutable three-element tuple with named accessors.
 * @typeParam A type of the first element
 * @typeParam B type of the second element
 * @typeParam C type of the third element
 */
export class Triple<A, B, C> {
  constructor(
    readonly first: A,
    readonly second: B,
    readonly third: C,
  ) {}

  /** Returns the triple as a fixed-length tuple. */
  toArray(): [A, B, C] {
    return [this.first, this.second, this.third];
  }

  toString(): string {
    return `(${String(this.first)}, ${String(this.second)}, ${String(this.third)})`;
  }
}

/** Convenience factory that builds a {@link Pair}. */
export function pair<A, B>(a: A, b: B): Pair<A, B> {
  return new Pair<A, B>(a, b);
}

/** Convenience factory that builds a {@link Triple}. */
export function triple<A, B, C>(a: A, b: B, c: C): Triple<A, B, C> {
  return new Triple<A, B, C>(a, b, c);
}
