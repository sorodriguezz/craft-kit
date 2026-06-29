/** Bucket sort for numbers. `bucketCount` controls granularity. New array. */
export function bucketSort(arr: readonly number[], bucketCount = 16): number[] {
  if (arr.length === 0) return [];
  let min = arr[0];
  let max = arr[0];
  for (const x of arr) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  if (min === max) return [...arr];
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);
  const range = (max - min) / bucketCount;
  for (const x of arr) {
    let idx = Math.floor((x - min) / range);
    if (idx >= bucketCount) idx = bucketCount - 1;
    buckets[idx].push(x);
  }
  const result: number[] = [];
  for (const bucket of buckets) {
    bucket.sort((p, q) => p - q);
    result.push(...bucket);
  }
  return result;
}
