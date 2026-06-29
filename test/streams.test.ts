import { describe, it, expect } from "vitest";
import { streams } from "../src/index";

describe("streams (Web Streams)", () => {
  it("fromIterable / toArray / map / filter / take", async () => {
    expect(await streams.toArray(streams.fromIterable([1, 2, 3]))).toEqual([1, 2, 3]);
    expect(await streams.toArray(streams.map(streams.fromIterable([1, 2, 3]), (x) => x * 2))).toEqual([2, 4, 6]);
    expect(await streams.toArray(streams.filter(streams.fromIterable([1, 2, 3, 4]), (x) => x % 2 === 0))).toEqual([2, 4]);
    expect(await streams.toArray(streams.take(streams.fromIterable([1, 2, 3, 4, 5]), 2))).toEqual([1, 2]);
  });
  it("reduce / text", async () => {
    expect(await streams.reduce(streams.fromIterable([1, 2, 3]), (a, b) => a + b, 0)).toBe(6);
    expect(await streams.text(streams.fromString("hello"))).toBe("hello");
  });
});
