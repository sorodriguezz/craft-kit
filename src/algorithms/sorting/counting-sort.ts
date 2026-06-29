/** Counting sort for integers (supports negatives). Returns a new array. */
export function countingSort(arr: readonly number[]): number[] {
  if (arr.length === 0) return [];
  let min = arr[0];
  let max = arr[0];
  for (const x of arr) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  const range = max - min + 1;
  const counts = new Array<number>(range).fill(0);
  for (const x of arr) counts[x - min]++;
  const result: number[] = [];
  for (let i = 0; i < range; i++) {
    while (counts[i]-- > 0) result.push(i + min);
  }
  return result;
}
