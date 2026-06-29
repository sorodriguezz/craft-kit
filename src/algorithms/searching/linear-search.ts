/** Linear search. Returns the first matching index or -1. O(n). */
export function linearSearch<T>(
  arr: readonly T[],
  target: T,
  equals: (a: T, b: T) => boolean = (a, b) => a === b
): number {
  for (let i = 0; i < arr.length; i++) {
    if (equals(arr[i], target)) return i;
  }
  return -1;
}
