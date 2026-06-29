import type { AsyncComparator } from "../../common/comparator";

async function mergeAsync<T>(
  left: T[],
  right: T[],
  comparator: AsyncComparator<T>
): Promise<T[]> {
  const result: T[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if ((await comparator(left[i], right[j])) <= 0) result.push(left[i++]);
    else result.push(right[j++]);
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

/**
 * Merge sort that awaits an async comparator. Halves are sorted in parallel.
 * Use when comparing elements requires async work (e.g. remote lookups).
 */
export async function mergeSortAsync<T>(
  arr: readonly T[],
  comparator: AsyncComparator<T>
): Promise<T[]> {
  if (arr.length <= 1) return [...arr];
  const mid = arr.length >> 1;
  const [left, right] = await Promise.all([
    mergeSortAsync(arr.slice(0, mid), comparator),
    mergeSortAsync(arr.slice(mid), comparator),
  ]);
  return mergeAsync(left, right, comparator);
}

/** Alias of {@link mergeSortAsync}. */
export const sortAsync = mergeSortAsync;
