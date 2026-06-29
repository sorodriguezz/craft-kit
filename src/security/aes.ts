import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

const SALT_BYTES = 16;
const IV_BYTES = 12; // 96-bit nonce is the recommended size for GCM
const AUTH_TAG_BYTES = 16;
const KEY_BYTES = 32; // AES-256

/**
 * Encrypts `plaintext` with AES-256-GCM using a key derived from `secret`.
 *
 * A random 16-byte salt and 12-byte IV are generated per call. The key is
 * derived with scrypt. The returned value is the Base64 encoding of
 * `salt | iv | authTag | ciphertext`.
 *
 * @param plaintext UTF-8 text to encrypt
 * @param secret passphrase used to derive the encryption key
 * @returns Base64-encoded encrypted payload
 */
export function aesEncrypt(plaintext: string, secret: string): string {
  const salt = randomBytes(SALT_BYTES);
  const iv = randomBytes(IV_BYTES);
  const key = scryptSync(secret, salt, KEY_BYTES);

  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, authTag, ciphertext]).toString("base64");
}

/**
 * Decrypts a payload produced by {@link aesEncrypt} using the same `secret`.
 *
 * @param payload Base64-encoded `salt | iv | authTag | ciphertext`
 * @param secret passphrase used during encryption
 * @returns the original UTF-8 plaintext
 * @throws {Error} if the payload is malformed or authentication fails (wrong
 *   secret or tampered data)
 */
export function aesDecrypt(payload: string, secret: string): string {
  const data = Buffer.from(payload, "base64");
  const minLength = SALT_BYTES + IV_BYTES + AUTH_TAG_BYTES;
  if (data.length < minLength) {
    throw new Error("Invalid AES payload: too short");
  }

  const salt = data.subarray(0, SALT_BYTES);
  const iv = data.subarray(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const authTag = data.subarray(
    SALT_BYTES + IV_BYTES,
    SALT_BYTES + IV_BYTES + AUTH_TAG_BYTES
  );
  const ciphertext = data.subarray(SALT_BYTES + IV_BYTES + AUTH_TAG_BYTES);

  const key = scryptSync(secret, salt, KEY_BYTES);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  try {
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return plaintext.toString("utf8");
  } catch {
    throw new Error("AES decryption failed: authentication error");
  }
}
