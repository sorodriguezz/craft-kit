function lsdRadix(input: number[]): number[] {
  if (input.length === 0) return [];
  let max = input[0];
  for (const x of input) if (x > max) max = x;
  let a = [...input];
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const output = new Array<number>(a.length);
    const count = new Array<number>(10).fill(0);
    for (const x of a) count[Math.floor(x / exp) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = a.length - 1; i >= 0; i--) {
      const digit = Math.floor(a[i] / exp) % 10;
      output[--count[digit]] = a[i];
    }
    a = output;
  }
  return a;
}

/** LSD radix sort for integers (supports negatives). Returns a new array. */
export function radixSort(arr: readonly number[]): number[] {
  if (arr.length === 0) return [];
  const negatives: number[] = [];
  const nonNegatives: number[] = [];
  for (const x of arr) {
    if (x < 0) negatives.push(-x);
    else nonNegatives.push(x);
  }
  const sortedNeg = lsdRadix(negatives)
    .reverse()
    .map((x) => -x);
  const sortedNonNeg = lsdRadix(nonNegatives);
  return [...sortedNeg, ...sortedNonNeg];
}
