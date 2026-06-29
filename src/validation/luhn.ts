/**
 * Credit-card brand definitions used by {@link creditCardBrand}. Each entry
 * pairs a brand name with the accepted prefixes and lengths.
 */
interface CardBrandRule {
  /** Canonical brand identifier. */
  brand: string;
  /** Predicate matching the brand's accepted prefixes. */
  matches: (digits: string) => boolean;
  /** Accepted total digit lengths for the brand. */
  lengths: number[];
}

const CARD_BRAND_RULES: CardBrandRule[] = [
  {
    brand: "visa",
    matches: (d) => d.startsWith("4"),
    lengths: [13, 16, 19],
  },
  {
    brand: "mastercard",
    matches: (d) => {
      const four = Number.parseInt(d.slice(0, 4), 10);
      const two = Number.parseInt(d.slice(0, 2), 10);
      return (two >= 51 && two <= 55) || (four >= 2221 && four <= 2720);
    },
    lengths: [16],
  },
  {
    brand: "amex",
    matches: (d) => d.startsWith("34") || d.startsWith("37"),
    lengths: [15],
  },
  {
    brand: "diners",
    matches: (d) => {
      const three = Number.parseInt(d.slice(0, 3), 10);
      return (
        d.startsWith("36") ||
        d.startsWith("38") ||
        d.startsWith("39") ||
        (three >= 300 && three <= 305)
      );
    },
    lengths: [14, 16, 19],
  },
  {
    brand: "discover",
    matches: (d) => {
      const six = Number.parseInt(d.slice(0, 6), 10);
      const three = Number.parseInt(d.slice(0, 3), 10);
      return (
        d.startsWith("6011") ||
        d.startsWith("65") ||
        (three >= 644 && three <= 649) ||
        (six >= 622126 && six <= 622925)
      );
    },
    lengths: [16, 19],
  },
  {
    brand: "jcb",
    matches: (d) => {
      const four = Number.parseInt(d.slice(0, 4), 10);
      return four >= 3528 && four <= 3589;
    },
    lengths: [16, 17, 18, 19],
  },
];

/**
 * Validate a numeric string using the Luhn (mod-10) checksum algorithm. Spaces
 * and hyphens are ignored; any other non-digit character makes the value
 * invalid.
 *
 * @param value - The candidate number, optionally containing spaces or hyphens.
 * @returns `true` when the digits satisfy the Luhn checksum.
 *
 * @example
 * luhn("4242 4242 4242 4242"); // true
 * luhn("1234 5678 9012 3456"); // false
 */
export function luhn(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  if (digits.length === 0 || !/^\d+$/.test(digits)) {
    return false;
  }
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = digits.charCodeAt(i) - 48;
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/**
 * Detect the brand of a credit-card number by its prefix and length. Spaces and
 * hyphens are ignored. This performs no Luhn validation; it only classifies the
 * number's issuer.
 *
 * @param value - The candidate card number, optionally containing spaces or
 * hyphens.
 * @returns The brand identifier (`"visa"`, `"mastercard"`, `"amex"`,
 * `"discover"`, `"diners"` or `"jcb"`), or `null` when no brand matches.
 *
 * @example
 * creditCardBrand("4242424242424242"); // "visa"
 * creditCardBrand("0000000000000000"); // null
 */
export function creditCardBrand(value: string): string | null {
  const digits = value.replace(/[\s-]/g, "");
  if (digits.length === 0 || !/^\d+$/.test(digits)) {
    return null;
  }
  for (const rule of CARD_BRAND_RULES) {
    if (rule.lengths.includes(digits.length) && rule.matches(digits)) {
      return rule.brand;
    }
  }
  return null;
}
