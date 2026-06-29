import { type Comparator, naturalOrder } from "../../common/comparator";

/** Heap sort. O(n log n). Returns a new array. */
export function heapSort<T>(
  arr: readonly T[],
  comparator: Comparator<T> = naturalOrder
): T[] {
  const a = [...arr];
  const n = a.length;
  const swap = (i: number, j: number): void => {
    [a[i], a[j]] = [a[j], a[i]];
  };
  const siftDown = (start: number, end: number): void => {
    let root = start;
    for (;;) {
      let child = 2 * root + 1;
      if (child > end) break;
      if (child + 1 <= end && comparator(a[child], a[child + 1]) < 0) child++;
      if (comparator(a[root], a[child]) < 0) {
        swap(root, child);
        root = child;
      } else {
        break;
      }
    }
  };
  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(i, n - 1);
  for (let end = n - 1; end > 0; end--) {
    swap(0, end);
    siftDown(0, end - 1);
  }
  return a;
}
