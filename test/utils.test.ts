import { describe, it, expect } from "vitest";
import {
  arrays, numbers, booleans, strings, dates, objects, query, is, format,
  isNil, isEmpty, isBlank, coalesce, defaultTo, requireNonNull, ensureArray, parseNumber, toInt, toDate,
} from "../src/index";

describe("namespaced utils", () => {
  it("arrays", () => {
    expect(arrays.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(arrays.unique([1, 1, 2])).toEqual([1, 2]);
    expect(arrays.count([1, 2, 2, 2], 2)).toBe(3);
    expect(arrays.isAllNumbers([1, 2])).toBe(true);
    expect(arrays.flattenDeep([1, [2, [3]]])).toEqual([1, 2, 3]);
  });
  it("numbers/booleans/strings", () => {
    expect(numbers.clamp(15, 0, 10)).toBe(10);
    expect(numbers.formatThousands(1234567)).toBe("1.234.567");
    expect(booleans.parse("yes")).toBe(true);
    expect(strings.slugify("Canción Ñandú!")).toBe("cancion-nandu");
    expect(strings.count("banana", "a")).toBe(3);
    expect(strings.truncateMiddle("abcdefghij", 7)).toBe("abc…hij");
  });
  it("dates/objects/query", () => {
    expect(dates.isLeapYear(2020)).toBe(true);
    expect(dates.format(new Date(2020, 0, 5, 9, 3, 7), "YYYY-MM-DD HH:mm:ss")).toBe("2020-01-05 09:03:07");
    expect(objects.flatten({ a: { b: 1 }, c: [10] })).toEqual({ "a.b": 1, "c.0": 10 });
    expect(objects.get({ a: { b: [{ c: 5 }] } }, "a.b[0].c")).toBe(5);
    expect(query.parse("?a=1&b=2")).toEqual({ a: "1", b: "2" });
  });
});

describe("guards / is / format", () => {
  it("guards", () => {
    expect(isNil(null)).toBe(true);
    expect(isEmpty("")).toBe(true);
    expect(isBlank("   ")).toBe(true);
    expect(coalesce(null, undefined, 5)).toBe(5);
    expect(defaultTo(0, 9)).toBe(0);
    expect(requireNonNull(5)).toBe(5);
    expect(() => requireNonNull(null)).toThrow();
    expect(ensureArray(1)).toEqual([1]);
    expect(parseNumber("42")).toBe(42);
    expect(toInt("3.9")).toBe(3);
    expect(toDate("2020-01-01")).toBeInstanceOf(Date);
  });
  it("is type guards", () => {
    expect(is.number(5) && !is.number("5")).toBe(true);
    expect(is.plainObject({}) && !is.plainObject([])).toBe(true);
    expect(is.nullish(null) && !is.nullish(0)).toBe(true);
  });
  it("format", () => {
    expect(format.bytes(1536, 1)).toBe("1.5 KB");
    expect(format.duration(90000)).toBe("1m 30s");
    expect(format.currency(1234.5, "USD", "en-US")).toBe("$1,234.50");
    expect(format.percent(0.25)).toBe("25%");
  });
});
