import { type Comparator, naturalOrder } from "../../common/comparator";

function merge<T>(left: T[], right: T[], comparator: Comparator<T>): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (comparator(left[i], right[j]) <= 0) result.push(left[i++]);
    else result.push(right[j++]);
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

/** Merge sort. Stable, O(n log n). Returns a new array. */
export function mergeSort<T>(
  arr: readonly T[],
  comparator: Comparator<T> = naturalOrder
): T[] {
  if (arr.length <= 1) return [...arr];
  const mid = arr.length >> 1;
  const left = mergeSort(arr.slice(0, mid), comparator);
  const right = mergeSort(arr.slice(mid), comparator);
  return merge(left, right, comparator);
}
