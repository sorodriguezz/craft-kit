import { describe, it, expect } from "vitest";
import { Result, tryCatch, pipe, compose, memoize, once, Lazy, pair, Range, StringBuilder } from "../src/index";

describe("fp", () => {
  it("result & tryCatch", () => {
    expect(Result.ok(5).map((x) => x * 2).unwrapOr(0)).toBe(10);
    expect(Result.err<number>(new Error()).unwrapOr(9)).toBe(9);
    expect(tryCatch(() => 5).unwrap()).toBe(5);
    expect(tryCatch(() => { throw new Error(); }).isErr()).toBe(true);
  });
  it("functions", () => {
    expect(pipe((x: number) => x + 1, (x: number) => x * 2)(3)).toBe(8);
    expect(compose((x: number) => x + 1, (x: number) => x * 2)(3)).toBe(7);
    let n = 0; const m = memoize((a: number, b: number) => { n++; return a + b; });
    m(1, 2); m(1, 2); expect(n).toBe(1);
    let o = 0; const f = once(() => ++o); f(); f(); expect(o).toBe(1);
  });
  it("lazy/pair/range/builder", () => {
    let e = 0; const l = new Lazy(() => { e++; return 1; }); l.get(); l.get(); expect(e).toBe(1);
    expect(pair(1, "a").toArray()).toEqual([1, "a"]);
    expect(Range.of(0, 5).toArray()).toEqual([0, 1, 2, 3, 4]);
    expect(new StringBuilder().append("a").appendLine("b").toString()).toBe("ab\n");
  });
});
