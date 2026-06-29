export interface LcsResult<T> {
  length: number;
  sequence: T[];
}

/**
 * Longest common subsequence of two sequences (arrays or strings).
 * Returns both the length and one reconstructed subsequence.
 */
export function longestCommonSubsequence<T>(
  a: readonly T[] | string,
  b: readonly T[] | string,
  equals: (x: T, y: T) => boolean = (x, y) => x === y
): LcsResult<T> {
  const A = (typeof a === "string" ? a.split("") : a) as readonly T[];
  const B = (typeof b === "string" ? b.split("") : b) as readonly T[];
  const m = A.length;
  const n = B.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = equals(A[i - 1], B[j - 1])
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const sequence: T[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (equals(A[i - 1], B[j - 1])) {
      sequence.push(A[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  sequence.reverse();
  return { length: dp[m][n], sequence };
}
