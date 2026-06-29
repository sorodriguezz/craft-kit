import { Result } from "../fp/result";

/**
 * A single problem found while validating a value, identifying both the
 * location of the offending data and a human-readable description.
 */
export type ValidationIssue = {
  /** Path of property keys and array indices leading to the failing value. */
  path: (string | number)[];
  /** Human-readable explanation of why validation failed. */
  message: string;
};

/**
 * Error thrown by {@link Schema.parse} when validation fails, carrying every
 * collected {@link ValidationIssue} rather than only the first.
 */
export class SchemaError extends Error {
  /** All validation issues gathered during the failed parse. */
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    const summary = issues
      .map((issue) => {
        const location = issue.path.length > 0 ? issue.path.join(".") : "(root)";
        return `${location}: ${issue.message}`;
      })
      .join("; ");
    super(summary.length > 0 ? summary : "Validation failed.");
    this.name = "SchemaError";
    this.issues = issues;
    Object.setPrototypeOf(this, SchemaError.prototype);
  }
}

/**
 * Outcome of an internal validation pass: either the parsed value or the list
 * of issues that prevented parsing.
 * @typeParam T the validated value type
 */
type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };

/** Convenience constructor for a successful internal validation result. */
function success<T>(value: T): ValidationResult<T> {
  return { ok: true, value };
}

/** Convenience constructor for a failing internal validation result. */
function failure<T>(issues: ValidationIssue[]): ValidationResult<T> {
  return { ok: false, issues };
}

/** Builds a single-issue list rooted at the given path. */
function issueAt(path: (string | number)[], message: string): ValidationIssue[] {
  return [{ path, message }];
}

/**
 * Base class for all schemas. Concrete schemas implement {@link _validate};
 * shared combinators such as {@link optional} and {@link nullable} are provided
 * here. Instances are immutable: combinators return new schemas.
 * @typeParam T the type produced by a successful parse
 */
export abstract class Schema<T> {
  /**
   * Validates `value` at the supplied `path`, returning either the parsed value
   * or the accumulated issues. Implemented by concrete schemas.
   * @param value the raw value to validate
   * @param path the path to `value` within the surrounding structure
   */
  abstract _validate(value: unknown, path: (string | number)[]): ValidationResult<T>;

  /**
   * Parses `value`, returning the typed result.
   * @throws {SchemaError} when validation fails, with every collected issue
   */
  parse(value: unknown): T {
    const result = this._validate(value, []);
    if (result.ok) {
      return result.value;
    }
    throw new SchemaError(result.issues);
  }

  /**
   * Parses `value` without throwing, returning a {@link Result} that is `Ok`
   * on success or `Err` holding a {@link SchemaError} on failure.
   */
  safeParse(value: unknown): Result<T, SchemaError> {
    const result = this._validate(value, []);
    if (result.ok) {
      return Result.ok<T, SchemaError>(result.value);
    }
    return Result.err<T, SchemaError>(new SchemaError(result.issues));
  }

  /** Returns a schema that also accepts `undefined`. */
  optional(): Schema<T | undefined> {
    return new OptionalSchema<T>(this);
  }

  /** Returns a schema that also accepts `null`. */
  nullable(): Schema<T | null> {
    return new NullableSchema<T>(this);
  }

  /**
   * Returns a schema that substitutes `value` when the input is `undefined`,
   * otherwise validating with the underlying schema.
   * @param value the fallback used for `undefined` input
   */
  default(value: T): Schema<T> {
    return new DefaultSchema<T>(this, value);
  }
}

/** Wraps a schema so that `undefined` is accepted as-is. */
class OptionalSchema<T> extends Schema<T | undefined> {
  constructor(private readonly inner: Schema<T>) {
    super();
  }

  override _validate(
    value: unknown,
    path: (string | number)[],
  ): ValidationResult<T | undefined> {
    if (value === undefined) {
      return success<T | undefined>(undefined);
    }
    return this.inner._validate(value, path);
  }
}

/** Wraps a schema so that `null` is accepted as-is. */
class NullableSchema<T> extends Schema<T | null> {
  constructor(private readonly inner: Schema<T>) {
    super();
  }

  override _validate(
    value: unknown,
    path: (string | number)[],
  ): ValidationResult<T | null> {
    if (value === null) {
      return success<T | null>(null);
    }
    return this.inner._validate(value, path);
  }
}

/** Wraps a schema so that `undefined` input is replaced by a default value. */
class DefaultSchema<T> extends Schema<T> {
  constructor(
    private readonly inner: Schema<T>,
    private readonly fallback: T,
  ) {
    super();
  }

  override _validate(value: unknown, path: (string | number)[]): ValidationResult<T> {
    if (value === undefined) {
      return success<T>(this.fallback);
    }
    return this.inner._validate(value, path);
  }
}

/** A single string-validation rule applied after the base type check. */
type StringCheck = (value: string) => string | null;

// Pragmatic, dependency-free email pattern: non-space local and domain parts
// separated by '@', with at least one dot in the domain.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Schema validating string values with chainable refinements. */
export class StringSchema extends Schema<string> {
  constructor(private readonly checks: StringCheck[] = []) {
    super();
  }

  /** Returns a new schema with an additional refinement appended. */
  private withCheck(check: StringCheck): StringSchema {
    return new StringSchema([...this.checks, check]);
  }

  /** Requires the string length to be at least `n` characters. */
  min(n: number): StringSchema {
    return this.withCheck((value) =>
      value.length >= n ? null : `Expected at least ${n} character(s).`,
    );
  }

  /** Requires the string length to be at most `n` characters. */
  max(n: number): StringSchema {
    return this.withCheck((value) =>
      value.length <= n ? null : `Expected at most ${n} character(s).`,
    );
  }

  /** Requires the string length to be exactly `n` characters. */
  length(n: number): StringSchema {
    return this.withCheck((value) =>
      value.length === n ? null : `Expected exactly ${n} character(s).`,
    );
  }

  /** Requires the string to look like an email address. */
  email(): StringSchema {
    return this.withCheck((value) =>
      EMAIL_PATTERN.test(value) ? null : "Expected a valid email address.",
    );
  }

  /** Requires the string to match the given regular expression. */
  regex(re: RegExp): StringSchema {
    return this.withCheck((value) =>
      re.test(value) ? null : `Expected to match ${re.toString()}.`,
    );
  }

  override _validate(value: unknown, path: (string | number)[]): ValidationResult<string> {
    if (typeof value !== "string") {
      return failure<string>(issueAt(path, "Expected a string."));
    }
    for (const check of this.checks) {
      const message = check(value);
      if (message !== null) {
        return failure<string>(issueAt(path, message));
      }
    }
    return success(value);
  }
}

/** A single number-validation rule applied after the base type check. */
type NumberCheck = (value: number) => string | null;

/** Schema validating finite number values with chainable refinements. */
export class NumberSchema extends Schema<number> {
  constructor(private readonly checks: NumberCheck[] = []) {
    super();
  }

  /** Returns a new schema with an additional refinement appended. */
  private withCheck(check: NumberCheck): NumberSchema {
    return new NumberSchema([...this.checks, check]);
  }

  /** Requires the number to be greater than or equal to `n`. */
  min(n: number): NumberSchema {
    return this.withCheck((value) =>
      value >= n ? null : `Expected a value greater than or equal to ${n}.`,
    );
  }

  /** Requires the number to be less than or equal to `n`. */
  max(n: number): NumberSchema {
    return this.withCheck((value) =>
      value <= n ? null : `Expected a value less than or equal to ${n}.`,
    );
  }

  /** Requires the number to be an integer. */
  int(): NumberSchema {
    return this.withCheck((value) =>
      Number.isInteger(value) ? null : "Expected an integer.",
    );
  }

  /** Requires the number to be strictly greater than zero. */
  positive(): NumberSchema {
    return this.withCheck((value) =>
      value > 0 ? null : "Expected a positive number.",
    );
  }

  override _validate(value: unknown, path: (string | number)[]): ValidationResult<number> {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return failure<number>(issueAt(path, "Expected a number."));
    }
    for (const check of this.checks) {
      const message = check(value);
      if (message !== null) {
        return failure<number>(issueAt(path, message));
      }
    }
    return success(value);
  }
}

/** Schema validating boolean values. */
export class BooleanSchema extends Schema<boolean> {
  override _validate(value: unknown, path: (string | number)[]): ValidationResult<boolean> {
    if (typeof value !== "boolean") {
      return failure<boolean>(issueAt(path, "Expected a boolean."));
    }
    return success(value);
  }
}

/**
 * Schema validating arrays whose every element satisfies the element schema.
 * Issues from all failing elements are accumulated with their indices.
 * @typeParam T the element type
 */
export class ArraySchema<T> extends Schema<T[]> {
  constructor(
    private readonly item: Schema<T>,
    private readonly minLength?: number,
    private readonly maxLength?: number,
  ) {
    super();
  }

  /** Requires the array to contain at least `n` elements. */
  min(n: number): ArraySchema<T> {
    return new ArraySchema<T>(this.item, n, this.maxLength);
  }

  /** Requires the array to contain at most `n` elements. */
  max(n: number): ArraySchema<T> {
    return new ArraySchema<T>(this.item, this.minLength, n);
  }

  override _validate(value: unknown, path: (string | number)[]): ValidationResult<T[]> {
    if (!Array.isArray(value)) {
      return failure<T[]>(issueAt(path, "Expected an array."));
    }

    const issues: ValidationIssue[] = [];
    if (this.minLength !== undefined && value.length < this.minLength) {
      issues.push({ path, message: `Expected at least ${this.minLength} item(s).` });
    }
    if (this.maxLength !== undefined && value.length > this.maxLength) {
      issues.push({ path, message: `Expected at most ${this.maxLength} item(s).` });
    }

    const parsed: T[] = [];
    for (let index = 0; index < value.length; index++) {
      const result = this.item._validate(value[index], [...path, index]);
      if (result.ok) {
        parsed.push(result.value);
      } else {
        issues.push(...result.issues);
      }
    }

    if (issues.length > 0) {
      return failure<T[]>(issues);
    }
    return success(parsed);
  }
}

/**
 * Mapping from object keys to the schema validating each property value.
 * @typeParam S the resulting object shape
 */
export type ObjectShape<S> = { [K in keyof S]: Schema<S[K]> };

/**
 * Schema validating plain objects against a fixed shape. Each property is
 * validated independently, issues from every property are accumulated with
 * their key in the path, and unknown keys are ignored.
 * @typeParam S the resulting object shape
 */
export class ObjectSchema<S extends Record<string, unknown>> extends Schema<S> {
  constructor(private readonly shape: ObjectShape<S>) {
    super();
  }

  override _validate(value: unknown, path: (string | number)[]): ValidationResult<S> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return failure<S>(issueAt(path, "Expected an object."));
    }

    const source = value as Record<string, unknown>;
    const issues: ValidationIssue[] = [];
    const parsed: Record<string, unknown> = {};

    for (const key of Object.keys(this.shape) as (keyof S & string)[]) {
      const propertySchema = this.shape[key];
      const result = propertySchema._validate(source[key], [...path, key]);
      if (result.ok) {
        parsed[key] = result.value;
      } else {
        issues.push(...result.issues);
      }
    }

    if (issues.length > 0) {
      return failure<S>(issues);
    }
    // Extra keys present on the input are intentionally ignored.
    return success(parsed as S);
  }
}

/** Schema accepting only a single literal value compared with strict equality. */
class LiteralSchema<L extends string | number | boolean> extends Schema<L> {
  constructor(private readonly literal: L) {
    super();
  }

  override _validate(value: unknown, path: (string | number)[]): ValidationResult<L> {
    if (value !== this.literal) {
      return failure<L>(issueAt(path, `Expected the literal ${JSON.stringify(this.literal)}.`));
    }
    return success(this.literal);
  }
}

/**
 * Factory for building schemas fluently, e.g.
 * `schema.object({ name: schema.string().min(1) })`.
 */
export const schema = {
  /** Creates a {@link StringSchema}. */
  string(): StringSchema {
    return new StringSchema();
  },
  /** Creates a {@link NumberSchema}. */
  number(): NumberSchema {
    return new NumberSchema();
  },
  /** Creates a {@link BooleanSchema}. */
  boolean(): BooleanSchema {
    return new BooleanSchema();
  },
  /** Creates an {@link ArraySchema} validating each element with `item`. */
  array<T>(item: Schema<T>): ArraySchema<T> {
    return new ArraySchema<T>(item);
  },
  /** Creates an {@link ObjectSchema} from a shape of per-property schemas. */
  object<S extends Record<string, unknown>>(shape: ObjectShape<S>): ObjectSchema<S> {
    return new ObjectSchema<S>(shape);
  },
  /** Creates a schema accepting only the given literal value. */
  literal<L extends string | number | boolean>(value: L): Schema<L> {
    return new LiteralSchema<L>(value);
  },
};

/**
 * Infers the parsed TypeScript type produced by a schema.
 * @typeParam S a {@link Schema} instance type
 */
export type Infer<S> = S extends Schema<infer T> ? T : never;
