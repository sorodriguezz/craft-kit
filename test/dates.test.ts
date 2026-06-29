import { describe, it, expect } from "vitest";
import { dates } from "../src/index";

describe("dates: string <-> date converters", () => {
  it("parse with a pattern", () => {
    const d = dates.parse("05/01/2024 09:07", "DD/MM/YYYY HH:mm")!;
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2024, 0, 5, 9, 7]);
    expect(dates.parse("nope", "YYYY-MM-DD")).toBeNull();
  });
  it("format <-> parse round-trip", () => {
    const orig = new Date(2024, 4, 15, 13, 30, 45);
    const s = dates.format(orig, "YYYY-MM-DD HH:mm:ss");
    expect(s).toBe("2024-05-15 13:30:45");
    expect(dates.parse(s, "YYYY-MM-DD HH:mm:ss")!.getTime()).toBe(orig.getTime());
  });
  it("extended format tokens", () => {
    expect(dates.format(new Date(2024, 0, 5, 14, 5), "YYYY-MM-DD hh:mm A")).toBe("2024-01-05 02:05 PM");
    expect(dates.format(new Date(2024, 0, 5), "DD MMM YYYY", "en")).toBe("05 Jan 2024");
    expect(dates.format(new Date(2024, 0, 5), "DD-MM-YY")).toBe("05-01-24");
  });
  it("epoch converters", () => {
    expect(dates.toUnix(new Date(0))).toBe(0);
    expect(dates.fromUnix(1700000000).getTime()).toBe(1700000000000);
    expect(dates.fromTimestamp(1000).getTime()).toBe(1000);
    expect(dates.toTimestamp(new Date(5))).toBe(5);
  });
});
