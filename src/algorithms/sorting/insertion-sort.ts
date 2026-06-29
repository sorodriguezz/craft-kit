import { type Comparator, naturalOrder } from "../../common/comparator";

/** Insertion sort. O(n^2), fast for nearly-sorted data. Returns a new array. */
export function insertionSort<T>(
  arr: readonly T[],
  comparator: Comparator<T> = naturalOrder
): T[] {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && comparator(a[j], key) > 0) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}
