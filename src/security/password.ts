import { pbkdf2Sync, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+[]{}|;:,.<>?";
const SIMILAR = /[O0lI1|]/g;

export interface PasswordOptions {
  /** Total length of the generated password. Default 16. */
  length?: number;
  useUppercase?: boolean;
  useLowercase?: boolean;
  useDigits?: boolean;
  useSymbols?: boolean;
  /** Exclude visually similar characters such as O, 0, l, 1, I, |. */
  excludeSimilar?: boolean;
}

/**
 * Generates a random password using a cryptographically-strong RNG.
 * @throws if every character set is disabled.
 */
export function generatePassword(options: PasswordOptions = {}): string {
  const {
    length = 16,
    useUppercase = true,
    useLowercase = true,
    useDigits = true,
    useSymbols = false,
    excludeSimilar = false,
  } = options;

  let charset = "";
  if (useUppercase) charset += UPPER;
  if (useLowercase) charset += LOWER;
  if (useDigits) charset += DIGITS;
  if (useSymbols) charset += SYMBOLS;
  if (excludeSimilar) charset = charset.replace(SIMILAR, "");

  if (charset.length === 0) {
    throw new Error("generatePassword: at least one character set must be enabled.");
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(randomInt(charset.length));
  }
  return password;
}

export type Pbkdf2Digest = "sha1" | "sha256" | "sha384" | "sha512";

export interface Pbkdf2Options {
  iterations?: number;
  keylen?: number;
  digest?: Pbkdf2Digest;
  encoding?: BufferEncoding;
}

/** Derives a key from a password using PBKDF2 and a known salt. */
export function pbkdf2(password: string, salt: string, options: Pbkdf2Options = {}): string {
  const { iterations = 100_000, keylen = 64, digest = "sha512", encoding = "hex" } = options;
  return pbkdf2Sync(password, salt, iterations, keylen, digest).toString(encoding);
}

export interface HashedPassword {
  hash: string;
  salt: string;
  iterations: number;
  keylen: number;
  digest: Pbkdf2Digest;
}

/** Hashes a password with a freshly generated random salt (PBKDF2). */
export function hashPassword(password: string, options: Pbkdf2Options = {}): HashedPassword {
  const { iterations = 100_000, keylen = 64, digest = "sha512" } = options;
  const salt = randomBytes(16).toString("hex");
  const hashed = pbkdf2Sync(password, salt, iterations, keylen, digest).toString("hex");
  return { hash: hashed, salt, iterations, keylen, digest };
}

/** Verifies a plaintext password against a stored hash in constant time. */
export function verifyPassword(password: string, stored: HashedPassword): boolean {
  const computed = pbkdf2Sync(
    password,
    stored.salt,
    stored.iterations,
    stored.keylen,
    stored.digest
  );
  const expected = Buffer.from(stored.hash, "hex");
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}

export interface PasswordStrength {
  /** 0 (very weak) to 4 (very strong). */
  score: number;
  label: "very-weak" | "weak" | "fair" | "strong" | "very-strong";
}

const STRENGTH_LABELS: PasswordStrength["label"][] = [
  "very-weak",
  "weak",
  "fair",
  "strong",
  "very-strong",
];

/** Heuristic password strength estimate based on length and character variety. */
export function passwordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  score = Math.min(score, 4);
  return { score, label: STRENGTH_LABELS[score]! };
}

/** Object-oriented wrapper that remembers default generation options. */
export class PasswordGenerator {
  constructor(private readonly defaults: PasswordOptions = {}) {}

  generate(overrides: PasswordOptions = {}): string {
    return generatePassword({ ...this.defaults, ...overrides });
  }
}
