import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";

export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";
export type DigestEncoding = "hex" | "base64" | "base64url";

/** Hashes data with the given algorithm and returns the encoded digest. */
export function hash(
  data: string | Buffer,
  algorithm: HashAlgorithm = "sha256",
  encoding: DigestEncoding = "hex"
): string {
  return createHash(algorithm).update(data).digest(encoding);
}

/** SHA-256 convenience helper. */
export function sha256(data: string | Buffer, encoding: DigestEncoding = "hex"): string {
  return hash(data, "sha256", encoding);
}

/** SHA-512 convenience helper. */
export function sha512(data: string | Buffer, encoding: DigestEncoding = "hex"): string {
  return hash(data, "sha512", encoding);
}

/** MD5 convenience helper (non-cryptographic use only). */
export function md5(data: string | Buffer, encoding: DigestEncoding = "hex"): string {
  return hash(data, "md5", encoding);
}

/** Keyed-hash message authentication code (HMAC). */
export function hmac(
  data: string | Buffer,
  key: string | Buffer,
  algorithm: HashAlgorithm = "sha256",
  encoding: DigestEncoding = "hex"
): string {
  return createHmac(algorithm, key).update(data).digest(encoding);
}

/** Cryptographically-strong random token of `bytes` length. */
export function randomToken(bytes = 32, encoding: DigestEncoding = "hex"): string {
  return randomBytes(bytes).toString(encoding);
}

/** RFC 4122 v4 UUID. */
export function uuid(): string {
  return randomUUID();
}
