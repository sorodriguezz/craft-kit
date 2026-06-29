import { type Comparator, naturalOrder } from "../../common/comparator";

/** Jump search over a sorted array. Returns index or -1. O(sqrt n). */
export function jumpSearch<T>(
  arr: readonly T[],
  target: T,
  comparator: Comparator<T> = naturalOrder
): number {
  const n = arr.length;
  if (n === 0) return -1;
  const step = Math.max(1, Math.floor(Math.sqrt(n)));
  let prev = 0;
  let curr = step;
  while (curr < n && comparator(arr[Math.min(curr, n) - 1], target) < 0) {
    prev = curr;
    curr += step;
  }
  const end = Math.min(curr, n);
  for (let i = prev; i < end; i++) {
    if (comparator(arr[i], target) === 0) return i;
  }
  return -1;
}
