import { describe, it, expect } from "vitest";
import { colors, units, csv, duration, numbers } from "../src/index";

describe("converters", () => {
  it("colors", () => {
    expect(colors.hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(colors.rgbToHex(255, 0, 0)).toBe("#ff0000");
    expect(colors.rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
    expect(colors.contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(colors.isValidHex("#abc")).toBe(true);
    expect(colors.isValidHex("xyz")).toBe(false);
  });
  it("units", () => {
    expect(units.celsiusToFahrenheit(100)).toBe(212);
    expect(units.fahrenheitToCelsius(32)).toBe(0);
    expect(units.degreesToRadians(180)).toBeCloseTo(Math.PI);
    expect(units.kmToMiles(1)).toBeCloseTo(0.621371);
  });
  it("csv", () => {
    expect(csv.parse("a,b\n1,2", { header: true })).toEqual([{ a: "1", b: "2" }]);
    expect(csv.parse('x,y\n"1,5",2')).toEqual([["x", "y"], ["1,5", "2"]]);
    expect(csv.stringify([{ a: 1, b: 2 }], { header: true }).replace(/\r/g, "")).toBe("a,b\n1,2");
  });
  it("duration", () => {
    expect(duration.parse("1h30m")).toBe(5400000);
    expect(duration.format(5400000)).toBe("1h 30m");
    expect(duration.fromObject({ hours: 1, minutes: 30 })).toBe(5400000);
  });
  it("numbers extras", () => {
    expect(numbers.toRoman(1990)).toBe("MCMXC");
    expect(numbers.fromRoman("MCMXC")).toBe(1990);
    expect(numbers.toOrdinal(21)).toBe("21st");
    expect(numbers.toWords(42)).toBe("forty-two");
  });
});
