import { describe, it, expect } from "vitest";
import {
  sha256, hmac, hashPassword, verifyPassword, generatePassword, aesEncrypt, aesDecrypt,
  base58Encode, base58Decode, ulid, nanoid, signJwt, verifyJwt, decodeJwt, JwtError, totp, verifyTotp,
} from "../src/index";

describe("security", () => {
  it("hashing & passwords", () => {
    expect(sha256("abc")).toBe(sha256("abc"));
    expect(typeof hmac("d", "k")).toBe("string");
    const stored = hashPassword("s3cret");
    expect(verifyPassword("s3cret", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
    expect(generatePassword({ length: 16 }).length).toBe(16);
  });
  it("aes & ids", () => {
    const enc = aesEncrypt("secreto", "clave");
    expect(aesDecrypt(enc, "clave")).toBe("secreto");
    expect(() => aesDecrypt(enc, "otra")).toThrow();
    expect(base58Decode(base58Encode("hi")).toString()).toBe("hi");
    expect(ulid().length).toBe(26);
    expect(nanoid(10).length).toBe(10);
  });
  it("jwt & totp", () => {
    const token = signJwt({ sub: "123" }, "secret", { expiresIn: 3600 });
    expect(verifyJwt<{ sub: string }>(token, "secret").sub).toBe("123");
    expect(() => verifyJwt(token, "wrong")).toThrow(JwtError);
    expect(decodeJwt(token)!.payload).toMatchObject({ sub: "123" });
    expect(verifyTotp(totp("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"), "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ")).toBe(true);
  });
});
