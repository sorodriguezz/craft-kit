import { type Comparator, naturalOrder } from "../../common/comparator";

/** Quick sort (Lomuto partition). Avg O(n log n). Returns a new array. */
export function quickSort<T>(
  arr: readonly T[],
  comparator: Comparator<T> = naturalOrder
): T[] {
  const a = [...arr];
  const swap = (i: number, j: number): void => {
    [a[i], a[j]] = [a[j], a[i]];
  };
  const partition = (lo: number, hi: number): number => {
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (comparator(a[j], pivot) < 0) {
        swap(i, j);
        i++;
      }
    }
    swap(i, hi);
    return i;
  };
  const sort = (lo: number, hi: number): void => {
    if (lo >= hi) return;
    const p = partition(lo, hi);
    sort(lo, p - 1);
    sort(p + 1, hi);
  };
  sort(0, a.length - 1);
  return a;
}
