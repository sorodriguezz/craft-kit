import type { AsyncComparator } from "../../common/comparator";

/** Linear search awaiting an async predicate. Returns the index or -1. */
export async function linearSearchAsync<T>(
  arr: readonly T[],
  predicate: (value: T, index: number) => boolean | Promise<boolean>
): Promise<number> {
  for (let i = 0; i < arr.length; i++) {
    if (await predicate(arr[i], i)) return i;
  }
  return -1;
}

/** Binary search over a sorted array awaiting an async comparator. */
export async function binarySearchAsync<T>(
  arr: readonly T[],
  target: T,
  comparator: AsyncComparator<T>
): Promise<number> {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const cmp = await comparator(arr[mid], target);
    if (cmp === 0) return mid;
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
