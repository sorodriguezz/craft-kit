import { describe, it, expect } from "vitest";
import { isEmail, rut, isValidRut, validators, schema, SchemaError } from "../src/index";

describe("validation", () => {
  it("email & rut", () => {
    expect(isEmail("a@b.com")).toBe(true);
    expect(isEmail("nope")).toBe(false);
    expect(rut.computeDv("12345678")).toBe("5");
    expect(rut.validate("12.345.678-5")).toBe(true);
    expect(rut.format("123456785")).toBe("12.345.678-5");
    expect(isValidRut(rut.random())).toBe(true);
    expect(validators.isUrl("https://x.com")).toBe(true);
  });
  it("schema parse/safeParse", () => {
    const userSchema = schema.object({
      name: schema.string().min(2),
      age: schema.number().int().min(0),
      email: schema.string().email().optional(),
    });
    expect(userSchema.parse({ name: "Ana", age: 30 })).toEqual({ name: "Ana", age: 30 });
    expect(userSchema.safeParse({ name: "A", age: -1 }).isErr()).toBe(true);
    expect(schema.array(schema.number()).parse([1, 2, 3])).toEqual([1, 2, 3]);
    expect(() => schema.string().email().parse("nope")).toThrow(SchemaError);
  });
});
