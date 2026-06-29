/**
 * Exact monetary arithmetic backed by integer minor units (e.g. cents).
 *
 * `Money` avoids floating-point drift by storing every amount as a whole number
 * of minor units (the smallest indivisible unit of the currency). All binary
 * operations require operands to share the same currency and decimal scale, and
 * every operation returns a new immutable instance — instances are never
 * mutated in place.
 */
export class Money {
  private readonly _minorUnits: number;
  private readonly _currency: string;
  private readonly _decimals: number;

  /**
   * Construct a `Money` value directly from integer minor units.
   *
   * @param minorUnits - Whole number of minor units (e.g. cents). Rounded to
   * the nearest integer using half-up rounding.
   * @param currency - ISO 4217 currency code.
   * @param decimals - Number of fractional digits the currency uses.
   */
  private constructor(minorUnits: number, currency: string, decimals: number) {
    if (!Number.isInteger(decimals) || decimals < 0) {
      throw new Error("decimals must be a non-negative integer");
    }
    this._minorUnits = Money.roundHalfUp(minorUnits);
    this._currency = currency;
    this._decimals = decimals;
  }

  /**
   * Create a `Money` value from an amount expressed in major units.
   *
   * @param amount - The amount in major units (e.g. `10.5` for ten dollars and
   * fifty cents).
   * @param currency - ISO 4217 currency code. Defaults to `"USD"`.
   * @param decimals - Number of fractional digits the currency uses. Defaults
   * to `2`.
   * @returns A new `Money` instance.
   *
   * @example
   * Money.of(10.5); // 1050 minor units, USD
   */
  static of(amount: number, currency = "USD", decimals = 2): Money {
    if (!Number.isFinite(amount)) {
      throw new Error("amount must be a finite number");
    }
    const factor = 10 ** decimals;
    return new Money(Money.roundHalfUp(amount * factor), currency, decimals);
  }

  /**
   * Create a `Money` value directly from integer minor units.
   *
   * @param minor - The amount in minor units (e.g. `1050` for `10.50`).
   * @param currency - ISO 4217 currency code. Defaults to `"USD"`.
   * @param decimals - Number of fractional digits the currency uses. Defaults
   * to `2`.
   * @returns A new `Money` instance.
   *
   * @example
   * Money.fromMinor(1050); // 10.50 USD
   */
  static fromMinor(minor: number, currency = "USD", decimals = 2): Money {
    if (!Number.isFinite(minor)) {
      throw new Error("minor must be a finite number");
    }
    return new Money(minor, currency, decimals);
  }

  /** The amount expressed in major units (e.g. `10.5`). */
  get amount(): number {
    return this._minorUnits / 10 ** this._decimals;
  }

  /** The amount expressed as whole minor units (e.g. `1050`). */
  get minorUnits(): number {
    return this._minorUnits;
  }

  /** The ISO 4217 currency code. */
  get currency(): string {
    return this._currency;
  }

  /** The number of fractional digits the currency uses. */
  get decimals(): number {
    return this._decimals;
  }

  /**
   * Add another monetary value of the same currency and scale.
   *
   * @param other - The value to add.
   * @returns A new `Money` instance with the summed amount.
   * @throws {Error} When the currency or decimals differ.
   */
  add(other: Money): Money {
    this.assertCompatible(other);
    return new Money(
      this._minorUnits + other._minorUnits,
      this._currency,
      this._decimals,
    );
  }

  /**
   * Subtract another monetary value of the same currency and scale.
   *
   * @param other - The value to subtract.
   * @returns A new `Money` instance with the difference.
   * @throws {Error} When the currency or decimals differ.
   */
  subtract(other: Money): Money {
    this.assertCompatible(other);
    return new Money(
      this._minorUnits - other._minorUnits,
      this._currency,
      this._decimals,
    );
  }

  /**
   * Multiply the amount by a scalar factor, rounding half-up to whole minor
   * units.
   *
   * @param factor - The multiplier.
   * @returns A new `Money` instance with the scaled amount.
   * @throws {Error} When `factor` is not finite.
   */
  multiply(factor: number): Money {
    if (!Number.isFinite(factor)) {
      throw new Error("factor must be a finite number");
    }
    return new Money(
      Money.roundHalfUp(this._minorUnits * factor),
      this._currency,
      this._decimals,
    );
  }

  /**
   * Divide the amount by a scalar divisor, rounding half-up to whole minor
   * units.
   *
   * @param divisor - The divisor (must be non-zero).
   * @returns A new `Money` instance with the divided amount.
   * @throws {Error} When `divisor` is zero or not finite.
   */
  divide(divisor: number): Money {
    if (!Number.isFinite(divisor) || divisor === 0) {
      throw new Error("divisor must be a non-zero finite number");
    }
    return new Money(
      Money.roundHalfUp(this._minorUnits / divisor),
      this._currency,
      this._decimals,
    );
  }

  /**
   * Return the additive inverse of this value.
   *
   * @returns A new `Money` instance with the sign flipped.
   */
  negate(): Money {
    return new Money(-this._minorUnits, this._currency, this._decimals);
  }

  /**
   * Return the absolute (non-negative) value.
   *
   * @returns A new `Money` instance with a non-negative amount.
   */
  abs(): Money {
    return new Money(Math.abs(this._minorUnits), this._currency, this._decimals);
  }

  /**
   * Split this value across the given ratios without losing minor units.
   *
   * The total of the returned parts always equals the original amount. Any
   * remainder left by integer division is distributed one minor unit at a time
   * to the leading entries (those with a positive ratio).
   *
   * @param ratios - Non-negative weights describing how to split the amount.
   * @returns An array of `Money` parts, one per ratio.
   * @throws {Error} When `ratios` is empty, contains a negative value, or its
   * sum is not positive.
   *
   * @example
   * Money.of(0.05).allocate([1, 1, 1]);
   * // [0.02, 0.02, 0.01] — sums exactly to 0.05
   */
  allocate(ratios: number[]): Money[] {
    if (ratios.length === 0) {
      throw new Error("ratios must contain at least one entry");
    }
    let total = 0;
    for (const ratio of ratios) {
      if (!Number.isFinite(ratio) || ratio < 0) {
        throw new Error("each ratio must be a non-negative finite number");
      }
      total += ratio;
    }
    if (total <= 0) {
      throw new Error("the sum of ratios must be positive");
    }

    const sign = this._minorUnits < 0 ? -1 : 1;
    const absolute = Math.abs(this._minorUnits);

    const shares = ratios.map((ratio) =>
      Math.floor((absolute * ratio) / total),
    );
    let remainder = absolute - shares.reduce((sum, share) => sum + share, 0);

    let index = 0;
    while (remainder > 0) {
      if (ratios[index] > 0) {
        shares[index] += 1;
        remainder -= 1;
      }
      index = (index + 1) % shares.length;
    }

    return shares.map(
      (share) => new Money(sign * share, this._currency, this._decimals),
    );
  }

  /**
   * Compare this value with another of the same currency and scale.
   *
   * @param other - The value to compare against.
   * @returns `-1` if this is smaller, `1` if larger, `0` if equal.
   * @throws {Error} When the currency or decimals differ.
   */
  compare(other: Money): number {
    this.assertCompatible(other);
    if (this._minorUnits < other._minorUnits) {
      return -1;
    }
    if (this._minorUnits > other._minorUnits) {
      return 1;
    }
    return 0;
  }

  /**
   * Determine whether this value equals another in currency, scale and amount.
   *
   * @param other - The value to compare against.
   * @returns `true` when both represent the same money.
   */
  equals(other: Money): boolean {
    return (
      this._currency === other._currency &&
      this._decimals === other._decimals &&
      this._minorUnits === other._minorUnits
    );
  }

  /**
   * Determine whether this value is greater than another.
   *
   * @param other - The value to compare against.
   * @returns `true` when this value is strictly larger.
   * @throws {Error} When the currency or decimals differ.
   */
  greaterThan(other: Money): boolean {
    return this.compare(other) > 0;
  }

  /**
   * Determine whether this value is less than another.
   *
   * @param other - The value to compare against.
   * @returns `true` when this value is strictly smaller.
   * @throws {Error} When the currency or decimals differ.
   */
  lessThan(other: Money): boolean {
    return this.compare(other) < 0;
  }

  /**
   * Determine whether the amount is zero.
   *
   * @returns `true` when the amount equals zero.
   */
  isZero(): boolean {
    return this._minorUnits === 0;
  }

  /**
   * Determine whether the amount is strictly positive.
   *
   * @returns `true` when the amount is greater than zero.
   */
  isPositive(): boolean {
    return this._minorUnits > 0;
  }

  /**
   * Determine whether the amount is strictly negative.
   *
   * @returns `true` when the amount is less than zero.
   */
  isNegative(): boolean {
    return this._minorUnits < 0;
  }

  /**
   * Format the value as a localized currency string.
   *
   * @param locale - BCP 47 locale tag passed to `Intl.NumberFormat`. Defaults
   * to the runtime's default locale.
   * @returns The formatted currency string.
   *
   * @example
   * Money.of(1234.5).format("en-US"); // "$1,234.50"
   */
  format(locale?: string): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: this._currency,
      minimumFractionDigits: this._decimals,
      maximumFractionDigits: this._decimals,
    }).format(this.amount);
  }

  /**
   * Render the value as a plain decimal string in major units.
   *
   * @returns The amount with a fixed number of decimal places followed by the
   * currency code (e.g. `"10.50 USD"`).
   */
  toString(): string {
    return `${this.amount.toFixed(this._decimals)} ${this._currency}`;
  }

  /** Round half-up to the nearest integer, symmetric around zero. */
  private static roundHalfUp(value: number): number {
    return Math.sign(value) * Math.round(Math.abs(value));
  }

  /** Ensure another value shares this value's currency and scale. */
  private assertCompatible(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        `currency mismatch: ${this._currency} !== ${other._currency}`,
      );
    }
    if (this._decimals !== other._decimals) {
      throw new Error(
        `decimals mismatch: ${this._decimals} !== ${other._decimals}`,
      );
    }
  }
}
