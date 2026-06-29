export interface KnapsackResult {
  /** Maximum total value that fits in the capacity. */
  maxValue: number;
  /** Indices of the chosen items. */
  selectedIndices: number[];
}

/**
 * 0/1 knapsack via DP. Weights and capacity must be non-negative integers.
 * @throws if weights and values differ in length.
 */
export function knapsack01(
  weights: readonly number[],
  values: readonly number[],
  capacity: number
): KnapsackResult {
  const n = weights.length;
  if (values.length !== n) {
    throw new Error("knapsack01: weights and values must have the same length.");
  }
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(capacity + 1).fill(0)
  );
  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];
    for (let c = 0; c <= capacity; c++) {
      dp[i][c] = w <= c ? Math.max(dp[i - 1][c], dp[i - 1][c - w] + v) : dp[i - 1][c];
    }
  }
  const selectedIndices: number[] = [];
  let c = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][c] !== dp[i - 1][c]) {
      selectedIndices.push(i - 1);
      c -= weights[i - 1];
    }
  }
  selectedIndices.reverse();
  return { maxValue: dp[n][capacity], selectedIndices };
}
