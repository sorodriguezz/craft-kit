import { createHmac } from "node:crypto";
import { base32Decode } from "./encoding";

export type TotpAlgorithm = "sha1" | "sha256" | "sha512";

export interface HotpOptions {
  /** Number of digits in the generated code. Defaults to 6. */
  digits?: number;
  /** HMAC algorithm. Defaults to "sha1". */
  algorithm?: TotpAlgorithm;
}

export interface TotpOptions {
  /** Time step in seconds. Defaults to 30. */
  step?: number;
  /** Number of digits in the generated code. Defaults to 6. */
  digits?: number;
  /** Unix epoch (seconds) from which counting starts. Defaults to 0. */
  t0?: number;
  /** Override the current time, in milliseconds. Defaults to Date.now(). */
  timestamp?: number;
  /** HMAC algorithm. Defaults to "sha1". */
  algorithm?: TotpAlgorithm;
}

export interface VerifyTotpOptions extends TotpOptions {
  /**
   * Number of steps of tolerance checked on either side of the current step.
   * Defaults to 1 (accepts the previous, current and next code).
   */
  window?: number;
}

/** Writes an unsigned 64-bit counter into an 8-byte big-endian buffer. */
function counterToBuffer(counter: number): Buffer {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(Math.floor(counter)));
  return buffer;
}

/**
 * HMAC-based One-Time Password (RFC 4226).
 *
 * @param secret shared secret encoded in Base32
 * @param counter moving counter value
 * @param options digit count and HMAC algorithm
 * @returns zero-padded numeric code
 */
export function hotp(
  secret: string,
  counter: number,
  options: HotpOptions = {}
): string {
  const digits = options.digits ?? 6;
  const algorithm = options.algorithm ?? "sha1";

  const key = base32Decode(secret);
  const hmacResult = createHmac(algorithm, key)
    .update(counterToBuffer(counter))
    .digest();

  // Dynamic truncation per RFC 4226 section 5.3.
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const binary =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  const code = binary % 10 ** digits;
  return code.toString().padStart(digits, "0");
}

/** Computes the counter for a TOTP given timing parameters. */
function counterForTime(options: TotpOptions): number {
  const step = options.step ?? 30;
  const t0 = options.t0 ?? 0;
  const timestamp = options.timestamp ?? Date.now();
  const seconds = Math.floor(timestamp / 1000);
  return Math.floor((seconds - t0) / step);
}

/**
 * Time-based One-Time Password (RFC 6238).
 *
 * @param secret shared secret encoded in Base32
 * @param options timing, digit count and HMAC algorithm (defaults: step 30,
 *   digits 6, sha1)
 * @returns zero-padded numeric code for the current time step
 */
export function totp(secret: string, options: TotpOptions = {}): string {
  const counter = counterForTime(options);
  return hotp(secret, counter, {
    digits: options.digits ?? 6,
    algorithm: options.algorithm ?? "sha1",
  });
}

/**
 * Verifies a TOTP `token` against `secret`, tolerating clock drift within
 * `window` steps on either side. Comparison is length-checked but does not need
 * to be constant-time because tokens are short-lived.
 *
 * @param token candidate code supplied by the user
 * @param secret shared secret encoded in Base32
 * @param options verification window plus standard TOTP options
 * @returns true if the token matches any step inside the window
 */
export function verifyTotp(
  token: string,
  secret: string,
  options: VerifyTotpOptions = {}
): boolean {
  const window = options.window ?? 1;
  const digits = options.digits ?? 6;
  const algorithm = options.algorithm ?? "sha1";
  const baseCounter = counterForTime(options);

  for (let offset = -window; offset <= window; offset++) {
    const candidate = hotp(secret, baseCounter + offset, { digits, algorithm });
    if (candidate.length === token.length && candidate === token) {
      return true;
    }
  }
  return false;
}

/**
 * Builds an `otpauth://totp/...` provisioning URI (the Key URI Format used by
 * authenticator apps and QR codes). The label and issuer are URL-encoded, and
 * the issuer is prefixed onto the label as `issuer:label` when supplied.
 *
 * @param options provisioning parameters
 * @param options.secret shared secret encoded in Base32
 * @param options.label account label, typically the user's email or username
 * @param options.issuer service or organization name
 * @param options.algorithm HMAC algorithm. Defaults to "SHA1"
 * @param options.digits number of digits in the generated code. Defaults to 6
 * @param options.period time step in seconds. Defaults to 30
 * @returns the otpauth provisioning URI
 */
export function otpauthURL(options: {
  secret: string;
  label: string;
  issuer?: string;
  algorithm?: "SHA1" | "SHA256" | "SHA512";
  digits?: number;
  period?: number;
}): string {
  const { secret, label, issuer } = options;
  const algorithm = options.algorithm ?? "SHA1";
  const digits = options.digits ?? 6;
  const period = options.period ?? 30;

  const accountLabel =
    issuer !== undefined && issuer.length > 0
      ? `${encodeURIComponent(issuer)}:${encodeURIComponent(label)}`
      : encodeURIComponent(label);

  const params = new URLSearchParams();
  params.set("secret", secret);
  if (issuer !== undefined && issuer.length > 0) {
    params.set("issuer", issuer);
  }
  params.set("algorithm", algorithm);
  params.set("digits", String(digits));
  params.set("period", String(period));

  return `otpauth://totp/${accountLabel}?${params.toString()}`;
}
