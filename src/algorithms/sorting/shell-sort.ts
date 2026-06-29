import { type Comparator, naturalOrder } from "../../common/comparator";

/** Shell sort (gap insertion, halving gaps). Returns a new array. */
export function shellSort<T>(
  arr: readonly T[],
  comparator: Comparator<T> = naturalOrder
): T[] {
  const a = [...arr];
  const n = a.length;
  for (let gap = n >> 1; gap > 0; gap >>= 1) {
    for (let i = gap; i < n; i++) {
      const temp = a[i];
      let j = i;
      while (j >= gap && comparator(a[j - gap], temp) > 0) {
        a[j] = a[j - gap];
        j -= gap;
      }
      a[j] = temp;
    }
  }
  return a;
}
