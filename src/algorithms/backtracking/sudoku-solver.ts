export type SudokuBoard = number[][];

/**
 * Solves a standard 9x9 Sudoku using backtracking. Empty cells are 0.
 * Returns a solved copy (input is not mutated), or null if unsolvable.
 * @throws if the board is not 9x9.
 */
export function solveSudoku(input: readonly (readonly number[])[]): SudokuBoard | null {
  if (input.length !== 9 || input.some((row) => row.length !== 9)) {
    throw new Error("solveSudoku: board must be 9x9.");
  }
  const board: SudokuBoard = input.map((row) => [...row]);

  const isValid = (row: number, col: number, val: number): boolean => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === val || board[i][col] === val) return false;
    }
    const boxRow = 3 * Math.floor(row / 3);
    const boxCol = 3 * Math.floor(col / 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === val) return false;
      }
    }
    return true;
  };

  const solve = (): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let val = 1; val <= 9; val++) {
            if (isValid(row, col, val)) {
              board[row][col] = val;
              if (solve()) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  return solve() ? board : null;
}
