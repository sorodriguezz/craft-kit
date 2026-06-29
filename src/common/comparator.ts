/**
 * A comparator function, Java-style.
 * Returns a negative number if `a < b`, zero if `a === b`, positive if `a > b`.
 */
export type Comparator<T> = (a: T, b: T) => number;

/** Natural ascending order using the `<` / `>` operators. */
export function naturalOrder<T>(a: T, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Natural descending order. */
export function reverseOrder<T>(a: T, b: T): number {
  return naturalOrder(b, a);
}

/** Numeric ascending comparator. */
export const numberComparator: Comparator<number> = (a, b) => a - b;

/** String ascending comparator (lexicographic). */
export const stringComparator: Comparator<string> = (a, b) =>
  a < b ? -1 : a > b ? 1 : 0;

/** Returns a comparator with the inverse ordering of `cmp`. */
export function reversed<T>(cmp: Comparator<T>): Comparator<T> {
  return (a, b) => cmp(b, a);
}

/**
 * Builds a comparator from a key extractor, comparing by the extracted key.
 * @example comparing((u: User) => u.age)
 */
export function comparing<T, K>(
  keySelector: (item: T) => K,
  keyComparator: Comparator<K> = naturalOrder
): Comparator<T> {
  return (a, b) => keyComparator(keySelector(a), keySelector(b));
}

/** Chains comparators: uses `second` only when `first` returns 0. */
export function thenComparing<T>(
  first: Comparator<T>,
  second: Comparator<T>
): Comparator<T> {
  return (a, b) => {
    const result = first(a, b);
    return result !== 0 ? result : second(a, b);
  };
}

/** A comparator that may resolve its result asynchronously. */
export type AsyncComparator<T> = (a: T, b: T) => number | Promise<number>;
