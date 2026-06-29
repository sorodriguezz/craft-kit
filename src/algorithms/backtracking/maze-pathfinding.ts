export type Cell = [number, number];

/**
 * Finds a path through a grid using backtracking (DFS). Cells equal to 0 are
 * open; anything else is a wall. Returns the path from start to end (inclusive)
 * or null if none exists. Movement is 4-directional.
 */
export function solveMaze(
  grid: readonly (readonly number[])[],
  start: Cell,
  end: Cell
): Cell[] | null {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const [startRow, startCol] = start;
  const [endRow, endCol] = end;

  const inBounds = (r: number, c: number): boolean =>
    r >= 0 && r < rows && c >= 0 && c < cols;
  const blocked = (r: number, c: number): boolean => grid[r][c] !== 0;

  if (
    !inBounds(startRow, startCol) ||
    !inBounds(endRow, endCol) ||
    blocked(startRow, startCol) ||
    blocked(endRow, endCol)
  ) {
    return null;
  }

  const visited: boolean[][] = Array.from({ length: rows }, () =>
    new Array<boolean>(cols).fill(false)
  );
  const path: Cell[] = [];
  const directions: ReadonlyArray<readonly [number, number]> = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  const dfs = (r: number, c: number): boolean => {
    if (!inBounds(r, c) || visited[r][c] || blocked(r, c)) return false;
    visited[r][c] = true;
    path.push([r, c]);
    if (r === endRow && c === endCol) return true;
    for (const [dr, dc] of directions) {
      if (dfs(r + dr, c + dc)) return true;
    }
    path.pop();
    return false;
  };

  return dfs(startRow, startCol) ? path : null;
}
