/**
 * A mutable buffer for efficiently assembling strings through chained calls,
 * inspired by Java's `StringBuilder`. The buffer is internal state; chaining
 * methods return `this`.
 */
export class StringBuilder {
  private buffer: string;

  constructor(initial = "") {
    this.buffer = initial;
  }

  /** Appends the string form of `value` to the buffer. */
  append(value: unknown): this {
    this.buffer += String(value);
    return this;
  }

  /** Appends `value` (if provided) followed by a newline character. */
  appendLine(value?: unknown): this {
    if (value !== undefined) {
      this.buffer += String(value);
    }
    this.buffer += "\n";
    return this;
  }

  /** Inserts `value` at the given character index. */
  insert(index: number, value: string): this {
    this.buffer = this.buffer.slice(0, index) + value + this.buffer.slice(index);
    return this;
  }

  /** Reverses the current contents of the buffer. */
  reverse(): this {
    this.buffer = this.buffer.split("").reverse().join("");
    return this;
  }

  /** Empties the buffer. */
  clear(): this {
    this.buffer = "";
    return this;
  }

  /** Current length of the buffered string. */
  get length(): number {
    return this.buffer.length;
  }

  toString(): string {
    return this.buffer;
  }
}
