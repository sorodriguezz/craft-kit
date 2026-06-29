import { type Comparator, naturalOrder } from "../../common/comparator";

/** Binary search over a sorted array. Returns index or -1. O(log n). */
export function binarySearch<T>(
  arr: readonly T[],
  target: T,
  comparator: Comparator<T> = naturalOrder
): number {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const cmp = comparator(arr[mid], target);
    if (cmp === 0) return mid;
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
