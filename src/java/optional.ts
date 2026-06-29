/**
 * A container that may or may not hold a non-null value, mirroring
 * java.util.Optional.
 * @typeParam T value type
 */
export class Optional<T> {
  private constructor(private readonly value: T | null) {}

  /** Optional with a guaranteed non-null value. @throws if value is null/undefined. */
  static of<T>(value: T): Optional<T> {
    if (value == null) throw new Error("Optional.of: value must not be null.");
    return new Optional<T>(value);
  }

  /** Optional that is empty when the value is null/undefined. */
  static ofNullable<T>(value: T | null | undefined): Optional<T> {
    return value == null ? Optional.empty<T>() : new Optional<T>(value);
  }

  /** An empty Optional. */
  static empty<T>(): Optional<T> {
    return new Optional<T>(null);
  }

  isPresent(): boolean {
    return this.value !== null;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  /** Returns the value. @throws if empty. */
  get(): T {
    if (this.value === null) throw new Error("Optional.get: no value present.");
    return this.value;
  }

  orElse(other: T): T {
    return this.value !== null ? this.value : other;
  }

  orElseGet(supplier: () => T): T {
    return this.value !== null ? this.value : supplier();
  }

  orElseThrow(errorSupplier: () => Error = () => new Error("No value present")): T {
    if (this.value === null) throw errorSupplier();
    return this.value;
  }

  ifPresent(consumer: (value: T) => void): void {
    if (this.value !== null) consumer(this.value);
  }

  ifPresentOrElse(consumer: (value: T) => void, emptyAction: () => void): void {
    if (this.value !== null) consumer(this.value);
    else emptyAction();
  }

  map<U>(mapper: (value: T) => U): Optional<U> {
    return this.value === null
      ? Optional.empty<U>()
      : Optional.ofNullable(mapper(this.value));
  }

  flatMap<U>(mapper: (value: T) => Optional<U>): Optional<U> {
    return this.value === null ? Optional.empty<U>() : mapper(this.value);
  }

  filter(predicate: (value: T) => boolean): Optional<T> {
    return this.value !== null && predicate(this.value) ? this : Optional.empty<T>();
  }

  /** Async map: applies an async mapper if present. */
  async mapAsync<U>(mapper: (value: T) => Promise<U>): Promise<Optional<U>> {
    return this.value === null
      ? Optional.empty<U>()
      : Optional.ofNullable(await mapper(this.value));
  }

  /** Async flatMap: applies an async Optional-returning mapper if present. */
  async flatMapAsync<U>(mapper: (value: T) => Promise<Optional<U>>): Promise<Optional<U>> {
    return this.value === null ? Optional.empty<U>() : mapper(this.value);
  }

  /** Runs an async side effect if a value is present. */
  async ifPresentAsync(consumer: (value: T) => Promise<void>): Promise<void> {
    if (this.value !== null) await consumer(this.value);
  }

  /** Returns the value, or awaits an async supplier when empty. */
  async orElseGetAsync(supplier: () => Promise<T>): Promise<T> {
    return this.value !== null ? this.value : supplier();
  }

  toString(): string {
    return this.value === null ? "Optional.empty" : `Optional[${String(this.value)}]`;
  }
}
