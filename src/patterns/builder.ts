/**
 * A generic fluent builder that accumulates partial state and produces a final
 * object. Useful for assembling configuration objects step by step without a
 * bespoke builder class per type.
 *
 * @typeParam T - The object type being built.
 *
 * @example
 * interface Config { host: string; port: number }
 * const config = new Builder<Config>()
 *   .set("host", "localhost")
 *   .set("port", 8080)
 *   .build();
 */
export class Builder<T extends object> {
  private readonly state: Partial<T>;

  /**
   * Create a builder, optionally seeded with initial values. The initial
   * object is copied, so the caller's object is not mutated.
   *
   * @param initial - Optional starting values.
   */
  constructor(initial: Partial<T> = {}) {
    this.state = { ...initial };
  }

  /**
   * Set a single property.
   *
   * @typeParam K - The property key.
   * @param key - The property to set.
   * @param value - The value to assign.
   * @returns This builder, for fluent chaining.
   */
  set<K extends keyof T>(key: K, value: T[K]): this {
    this.state[key] = value;
    return this;
  }

  /**
   * Merge several properties at once.
   *
   * @param values - Partial values to merge into the current state.
   * @returns This builder, for fluent chaining.
   */
  setAll(values: Partial<T>): this {
    Object.assign(this.state, values);
    return this;
  }

  /**
   * Produce the built object. A shallow copy of the accumulated state is
   * returned and asserted as the complete type `T`.
   *
   * @returns The assembled object.
   */
  build(): T {
    return { ...this.state } as T;
  }
}

/**
 * Create a {@link Builder}, optionally seeded with initial values.
 *
 * @typeParam T - The object type being built.
 * @param initial - Optional starting values.
 * @returns A new builder instance.
 */
export function createBuilder<T extends object>(
  initial?: Partial<T>,
): Builder<T> {
  return new Builder<T>(initial);
}
