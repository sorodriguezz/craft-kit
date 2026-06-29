/**
 * Immutable numeric vector of arbitrary dimension. Every operation returns a
 * new {@link Vector}; the components are defensively copied on construction and
 * never mutated.
 */
export class Vector {
  private readonly values: readonly number[];

  /**
   * Creates a vector from its components.
   * @param components ordered list of components (copied, not retained)
   */
  constructor(components: number[]) {
    this.values = [...components];
  }

  /** Number of components in the vector. */
  get dimension(): number {
    return this.values.length;
  }

  /**
   * Adds another vector component-wise.
   * @param v vector of the same dimension
   * @returns a new vector holding the element-wise sum
   * @throws {Error} if the dimensions differ
   */
  add(v: Vector): Vector {
    this.assertSameDimension(v);
    const result = new Array<number>(this.values.length);
    for (let i = 0; i < this.values.length; i++) {
      result[i] = this.values[i] + v.values[i];
    }
    return new Vector(result);
  }

  /**
   * Subtracts another vector component-wise.
   * @param v vector of the same dimension
   * @returns a new vector holding the element-wise difference
   * @throws {Error} if the dimensions differ
   */
  subtract(v: Vector): Vector {
    this.assertSameDimension(v);
    const result = new Array<number>(this.values.length);
    for (let i = 0; i < this.values.length; i++) {
      result[i] = this.values[i] - v.values[i];
    }
    return new Vector(result);
  }

  /**
   * Multiplies every component by a scalar.
   * @param k scalar factor
   * @returns a new scaled vector
   */
  scale(k: number): Vector {
    const result = new Array<number>(this.values.length);
    for (let i = 0; i < this.values.length; i++) {
      result[i] = this.values[i] * k;
    }
    return new Vector(result);
  }

  /**
   * Dot (scalar) product with another vector.
   * @param v vector of the same dimension
   * @returns the sum of element-wise products
   * @throws {Error} if the dimensions differ
   */
  dot(v: Vector): number {
    this.assertSameDimension(v);
    let total = 0;
    for (let i = 0; i < this.values.length; i++) {
      total += this.values[i] * v.values[i];
    }
    return total;
  }

  /**
   * Euclidean length (L2 norm) of the vector.
   * @returns the square root of the sum of squared components
   */
  magnitude(): number {
    let total = 0;
    for (const value of this.values) total += value * value;
    return Math.sqrt(total);
  }

  /**
   * Returns the unit vector pointing in the same direction.
   * @returns a new vector of magnitude `1`
   * @throws {Error} if the vector has zero magnitude
   */
  normalize(): Vector {
    const length = this.magnitude();
    if (length === 0) {
      throw new Error("Cannot normalize a zero-magnitude vector");
    }
    return this.scale(1 / length);
  }

  /**
   * Copies the components into a plain array.
   * @returns a new array of the vector's components
   */
  toArray(): number[] {
    return [...this.values];
  }

  /**
   * Tests component-wise equality with another vector.
   * @param v vector to compare against
   * @returns `true` if both vectors have the same dimension and equal components
   */
  equals(v: Vector): boolean {
    if (this.values.length !== v.values.length) return false;
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i] !== v.values[i]) return false;
    }
    return true;
  }

  /** Throws when `v` does not share this vector's dimension. */
  private assertSameDimension(v: Vector): void {
    if (this.values.length !== v.values.length) {
      throw new Error(
        `Vector dimension mismatch: ${this.values.length} vs ${v.values.length}`
      );
    }
  }
}
