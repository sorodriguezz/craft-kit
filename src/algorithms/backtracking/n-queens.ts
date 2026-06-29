/**
 * Solves the N-Queens problem. Each solution is an array where index = row and
 * value = column of the queen in that row.
 */
export function solveNQueens(n: number): number[][] {
  const solutions: number[][] = [];
  const cols = new Set<number>();
  const diag1 = new Set<number>(); // row - col
  const diag2 = new Set<number>(); // row + col
  const placement: number[] = [];

  const backtrack = (row: number): void => {
    if (row === n) {
      solutions.push([...placement]);
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);
      placement.push(col);
      backtrack(row + 1);
      placement.pop();
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);
    }
  };

  backtrack(0);
  return solutions;
}

/** Number of distinct solutions to the N-Queens problem. */
export function countNQueens(n: number): number {
  let count = 0;
  const cols = new Set<number>();
  const diag1 = new Set<number>();
  const diag2 = new Set<number>();

  const backtrack = (row: number): void => {
    if (row === n) {
      count++;
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);
      backtrack(row + 1);
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);
    }
  };

  backtrack(0);
  return count;
}

/** Renders a solution as a list of board rows using "Q" and ".". */
export function renderNQueens(solution: readonly number[]): string[] {
  return solution.map((col) => ".".repeat(col) + "Q" + ".".repeat(solution.length - col - 1));
}
