import { type Comparator, naturalOrder } from "../../common/comparator";

/** Bubble sort. O(n^2). Returns a new, sorted array (does not mutate input). */
export function bubbleSort<T>(
  arr: readonly T[],
  comparator: Comparator<T> = naturalOrder
): T[] {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (comparator(a[j], a[j + 1]) > 0) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}
