import { timingSafeEqual } from "node:crypto";
import { hmac, type HashAlgorithm } from "./hash";
import { base64UrlDecode, base64UrlEncode } from "./encoding";

/** Error thrown when signing, verifying, or decoding a JWT fails. */
export class JwtError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JwtError";
    Object.setPrototypeOf(this, JwtError.prototype);
  }
}

/** HMAC-based JWT signing algorithms supported by this module. */
export type JwtAlgorithm = "HS256" | "HS384" | "HS512";

/** Options controlling how a JWT is signed. */
export interface SignJwtOptions {
  /** Signing algorithm. Defaults to "HS256". */
  algorithm?: JwtAlgorithm;
  /** Lifetime in seconds; when set, an `exp` claim is added. */
  expiresIn?: number;
  /** Extra header fields merged over the defaults (`alg` and `typ`). */
  header?: Record<string, unknown>;
}

/** Options controlling how a JWT is verified. */
export interface VerifyJwtOptions {
  /** Allowed algorithms. Defaults to every {@link JwtAlgorithm}. */
  algorithms?: JwtAlgorithm[];
}

/** Maps a {@link JwtAlgorithm} to the underlying HMAC hash algorithm. */
const ALGORITHM_TO_HASH: Record<JwtAlgorithm, HashAlgorithm> = {
  HS256: "sha256",
  HS384: "sha384",
  HS512: "sha512",
};

/** Encodes an object as a URL-safe Base64 JSON segment. */
function encodeSegment(data: Record<string, unknown>): string {
  return base64UrlEncode(JSON.stringify(data));
}

/** Decodes a URL-safe Base64 JSON segment into an object. */
function decodeSegment(segment: string): Record<string, unknown> {
  const json = base64UrlDecode(segment);
  const parsed: unknown = JSON.parse(json);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new JwtError("Malformed JWT segment: expected a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

/** Computes the URL-safe Base64 signature for `${header}.${payload}`. */
function computeSignature(signingInput: string, secret: string, algorithm: JwtAlgorithm): string {
  return hmac(signingInput, secret, ALGORITHM_TO_HASH[algorithm], "base64url");
}

/**
 * Compares two URL-safe Base64 signatures in constant time, first checking
 * length and then the raw bytes, so neither length nor position of a mismatch
 * is leaked through timing.
 */
function signaturesEqual(expected: string, actual: string): boolean {
  const expectedBytes = Buffer.from(expected, "base64url");
  const actualBytes = Buffer.from(actual, "base64url");
  if (expectedBytes.length !== actualBytes.length) {
    // Compare equal-length buffers to avoid short-circuiting on length.
    timingSafeEqual(expectedBytes, expectedBytes);
    return false;
  }
  return timingSafeEqual(expectedBytes, actualBytes);
}

/** Current Unix time in whole seconds. */
function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Signs a payload and returns a compact JWT (`header.payload.signature`).
 * An `iat` (issued-at) claim is always added, and when `expiresIn` is provided
 * an `exp` claim is set to `iat + expiresIn`. The input payload is not mutated.
 *
 * @param payload claims to embed in the token
 * @param secret shared secret used for the HMAC signature
 * @param options algorithm, expiry, and extra header fields
 * @returns the encoded JWT string
 */
export function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  options: SignJwtOptions = {},
): string {
  const algorithm = options.algorithm ?? "HS256";
  const issuedAt = nowInSeconds();

  const header: Record<string, unknown> = {
    alg: algorithm,
    typ: "JWT",
    ...options.header,
  };

  const claims: Record<string, unknown> = {
    ...payload,
    iat: issuedAt,
  };
  if (options.expiresIn !== undefined) {
    claims.exp = issuedAt + options.expiresIn;
  }

  const signingInput = `${encodeSegment(header)}.${encodeSegment(claims)}`;
  const signature = computeSignature(signingInput, secret, algorithm);
  return `${signingInput}.${signature}`;
}

/**
 * Verifies a JWT's signature and expiration, returning its payload.
 * The signature is checked in constant time against `secret`, and an `exp`
 * claim, if present, must lie in the future.
 *
 * @typeParam T the expected payload shape
 * @param token the compact JWT to verify
 * @param secret shared secret used for the HMAC signature
 * @param options allowed algorithms
 * @returns the decoded payload
 * @throws {JwtError} when the token is malformed, the algorithm is disallowed,
 *   the signature is invalid, or the token has expired
 */
export function verifyJwt<T = Record<string, unknown>>(
  token: string,
  secret: string,
  options: VerifyJwtOptions = {},
): T {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new JwtError("Malformed JWT: expected three segments.");
  }
  const [headerSegment, payloadSegment, signatureSegment] = parts;

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = decodeSegment(headerSegment);
    payload = decodeSegment(payloadSegment);
  } catch (error) {
    if (error instanceof JwtError) {
      throw error;
    }
    throw new JwtError("Malformed JWT: segments are not valid Base64URL JSON.");
  }

  const algorithm = header.alg;
  if (typeof algorithm !== "string" || !(algorithm in ALGORITHM_TO_HASH)) {
    throw new JwtError(`Unsupported JWT algorithm: ${String(algorithm)}.`);
  }
  const allowed = options.algorithms ?? (["HS256", "HS384", "HS512"] as JwtAlgorithm[]);
  if (!allowed.includes(algorithm as JwtAlgorithm)) {
    throw new JwtError(`JWT algorithm ${algorithm} is not allowed.`);
  }

  const signingInput = `${headerSegment}.${payloadSegment}`;
  const expected = computeSignature(signingInput, secret, algorithm as JwtAlgorithm);
  if (!signaturesEqual(expected, signatureSegment)) {
    throw new JwtError("Invalid JWT signature.");
  }

  const exp = payload.exp;
  if (exp !== undefined) {
    if (typeof exp !== "number") {
      throw new JwtError("Invalid JWT: exp claim must be a number.");
    }
    if (nowInSeconds() >= exp) {
      throw new JwtError("JWT has expired.");
    }
  }

  return payload as T;
}

/**
 * Decodes a JWT without verifying its signature or expiration. Use only when
 * the token's authenticity is not required (e.g. inspecting claims).
 *
 * @typeParam T the expected payload shape
 * @param token the compact JWT to decode
 * @returns the header and payload, or `null` if the token cannot be decoded
 */
export function decodeJwt<T = Record<string, unknown>>(
  token: string,
): { header: Record<string, unknown>; payload: T } | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  try {
    const header = decodeSegment(parts[0]);
    const payload = decodeSegment(parts[1]);
    return { header, payload: payload as T };
  } catch {
    return null;
  }
}
