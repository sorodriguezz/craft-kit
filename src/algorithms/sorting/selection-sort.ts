import { type Comparator, naturalOrder } from "../../common/comparator";

/** Selection sort. O(n^2). Returns a new, sorted array. */
export function selectionSort<T>(
  arr: readonly T[],
  comparator: Comparator<T> = naturalOrder
): T[] {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if (comparator(a[j], a[min]) < 0) min = j;
    }
    if (min !== i) [a[i], a[min]] = [a[min], a[i]];
  }
  return a;
}
