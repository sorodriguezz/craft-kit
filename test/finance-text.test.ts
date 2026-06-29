import { describe, it, expect } from "vitest";
import { Money, Random, numbers, uuidv7, otpauthURL, luhn, creditCardBrand, validators, ansi, strings } from "../src/index";

describe("money", () => {
  it("arithmetic, allocate, format, mismatch", () => {
    expect(Money.of(10.5, "USD").minorUnits).toBe(1050);
    expect(Money.of(10).add(Money.of(5)).amount).toBe(15);
    expect(Money.of(10).multiply(3).amount).toBe(30);
    expect(Money.of(10).divide(3).minorUnits).toBe(333);
    expect(Money.of(10).allocate([1, 1, 1]).reduce((s, m) => s + m.minorUnits, 0)).toBe(1000);
    expect(Money.of(1234.5, "USD").format("en-US")).toBe("$1,234.50");
    expect(() => Money.of(1, "USD").add(Money.of(1, "EUR"))).toThrow();
  });
});

describe("random (seeded)", () => {
  it("deterministic + permutation", () => {
    const a = new Random(42), b = new Random(42);
    expect(a.next()).toBe(b.next());
    expect(a.int(1, 6)).toBe(b.int(1, 6));
    expect([...new Random(1).shuffle([1, 2, 3])].sort()).toEqual([1, 2, 3]);
  });
});

describe("numbers extras", () => {
  it("lerp/mapRange/normalize/roundTo", () => {
    expect(numbers.lerp(0, 10, 0.5)).toBe(5);
    expect(numbers.mapRange(5, 0, 10, 0, 100)).toBe(50);
    expect(numbers.normalize(5, 0, 10)).toBe(0.5);
    expect(numbers.roundTo(3.14159, 2)).toBe(3.14);
  });
});

describe("ids", () => {
  it("uuidv7 & otpauthURL", () => {
    expect(uuidv7()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    const url = otpauthURL({ secret: "ABC", label: "user@x", issuer: "App" });
    expect(url.startsWith("otpauth://totp/")).toBe(true);
    expect(url).toContain("secret=ABC");
  });
});

describe("validators extra", () => {
  it("luhn / brand / iban / phone / postal", () => {
    expect(luhn("4242424242424242")).toBe(true);
    expect(luhn("1234")).toBe(false);
    expect(creditCardBrand("4242424242424242")).toBe("visa");
    expect(validators.isCreditCard("4242 4242 4242 4242")).toBe(true);
    expect(validators.isIBAN("DE89370400440532013000")).toBe(true);
    expect(validators.isPhone("+14155552671")).toBe(true);
    expect(validators.isPostalCode("90210")).toBe(true);
  });
});

describe("ansi & strings extras", () => {
  it("ansi", () => {
    expect(ansi.strip(ansi.red("x"))).toBe("x");
    expect(ansi.bold("y")).toContain("[1m");
  });
  it("strings", () => {
    expect(strings.template("{{a}}/{{b}}", { a: "x" })).toBe("x/{{b}}");
    expect(strings.dedent("    a\n      b")).toBe("a\n  b");
    expect(strings.truncateWords("a b c d", 2)).toBe("a b…");
    expect(strings.wordWrap("the quick brown fox", 10)).toBe("the quick\nbrown fox");
    expect(strings.indent("a\nb", 2)).toBe("  a\n  b");
  });
});
