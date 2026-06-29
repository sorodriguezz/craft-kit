/**
 * Immutable dense numeric matrix. Every operation returns a new {@link Matrix};
 * the rows are deep-copied on construction and never mutated. All rows must
 * share the same length.
 */
export class Matrix {
  private readonly data: readonly (readonly number[])[];
  private readonly rowCount: number;
  private readonly colCount: number;

  /**
   * Creates a matrix from a row-major array of rows.
   * @param rows array of equal-length rows (deep-copied, not retained)
   * @throws {Error} if the rows have differing lengths
   */
  constructor(rows: number[][]) {
    this.rowCount = rows.length;
    this.colCount = rows.length > 0 ? rows[0].length : 0;
    for (const row of rows) {
      if (row.length !== this.colCount) {
        throw new Error("All matrix rows must have the same length");
      }
    }
    this.data = rows.map((row) => [...row]);
  }

  /** Number of rows in the matrix. */
  get rows(): number {
    return this.rowCount;
  }

  /** Number of columns in the matrix. */
  get cols(): number {
    return this.colCount;
  }

  /**
   * Reads the entry at the given position.
   * @param r zero-based row index
   * @param c zero-based column index
   * @returns the value stored at `(r, c)`
   * @throws {Error} if the indices are out of range
   */
  get(r: number, c: number): number {
    if (r < 0 || r >= this.rowCount || c < 0 || c >= this.colCount) {
      throw new Error(`Index out of range: (${r}, ${c})`);
    }
    return this.data[r][c];
  }

  /**
   * Adds another matrix element-wise.
   * @param m matrix of identical dimensions
   * @returns a new matrix holding the element-wise sum
   * @throws {Error} if the dimensions differ
   */
  add(m: Matrix): Matrix {
    if (this.rowCount !== m.rowCount || this.colCount !== m.colCount) {
      throw new Error(
        `Matrix dimension mismatch: ${this.rowCount}x${this.colCount} vs ${m.rowCount}x${m.colCount}`
      );
    }
    const result: number[][] = [];
    for (let r = 0; r < this.rowCount; r++) {
      const row = new Array<number>(this.colCount);
      for (let c = 0; c < this.colCount; c++) {
        row[c] = this.data[r][c] + m.data[r][c];
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * Multiplies this matrix by another (standard matrix product). The number of
   * columns of this matrix must equal the number of rows of `m`.
   * @param m right-hand matrix
   * @returns a new `rows x m.cols` matrix
   * @throws {Error} if the inner dimensions are incompatible
   */
  multiply(m: Matrix): Matrix {
    if (this.colCount !== m.rowCount) {
      throw new Error(
        `Incompatible dimensions for multiplication: ${this.rowCount}x${this.colCount} * ${m.rowCount}x${m.colCount}`
      );
    }
    const result: number[][] = [];
    for (let r = 0; r < this.rowCount; r++) {
      const row = new Array<number>(m.colCount).fill(0);
      for (let k = 0; k < this.colCount; k++) {
        const factor = this.data[r][k];
        for (let c = 0; c < m.colCount; c++) {
          row[c] += factor * m.data[k][c];
        }
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * Transposes the matrix, swapping rows and columns.
   * @returns a new `cols x rows` matrix
   */
  transpose(): Matrix {
    const result: number[][] = [];
    for (let c = 0; c < this.colCount; c++) {
      const row = new Array<number>(this.rowCount);
      for (let r = 0; r < this.rowCount; r++) {
        row[r] = this.data[r][c];
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * Multiplies every entry by a scalar.
   * @param k scalar factor
   * @returns a new scaled matrix
   */
  scale(k: number): Matrix {
    const result: number[][] = [];
    for (let r = 0; r < this.rowCount; r++) {
      const row = new Array<number>(this.colCount);
      for (let c = 0; c < this.colCount; c++) {
        row[c] = this.data[r][c] * k;
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * Copies the matrix into a plain row-major array.
   * @returns a new deep-copied 2D array of the matrix entries
   */
  toArray(): number[][] {
    return this.data.map((row) => [...row]);
  }

  /**
   * Builds the `n x n` identity matrix.
   * @param n side length (must be non-negative)
   * @returns a new identity matrix
   * @throws {Error} if `n` is negative
   */
  static identity(n: number): Matrix {
    if (n < 0) throw new Error("Identity size must be non-negative");
    const result: number[][] = [];
    for (let r = 0; r < n; r++) {
      const row = new Array<number>(n).fill(0);
      row[r] = 1;
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * Builds a matrix of the given shape filled with zeros.
   * @param rows number of rows (must be non-negative)
   * @param cols number of columns (must be non-negative)
   * @returns a new zero-filled matrix
   * @throws {Error} if either dimension is negative
   */
  static zeros(rows: number, cols: number): Matrix {
    if (rows < 0 || cols < 0) {
      throw new Error("Matrix dimensions must be non-negative");
    }
    const result: number[][] = [];
    for (let r = 0; r < rows; r++) {
      result.push(new Array<number>(cols).fill(0));
    }
    return new Matrix(result);
  }
}
