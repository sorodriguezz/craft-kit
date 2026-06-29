/** Interpolation search over a sorted numeric array. Returns index or -1. */
export function interpolationSearch(
  arr: readonly number[],
  target: number
): number {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    if (lo === hi) return arr[lo] === target ? lo : -1;
    const denom = arr[hi] - arr[lo];
    const pos = denom === 0 ? lo : lo + Math.floor(((target - arr[lo]) * (hi - lo)) / denom);
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) lo = pos + 1;
    else hi = pos - 1;
  }
  return -1;
}
