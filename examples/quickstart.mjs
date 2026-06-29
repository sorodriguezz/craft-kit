// Quick tour. Run: npm run build && node examples/quickstart.mjs
import { quickSort, Optional, Money, dates, rut, Stream } from "../dist/index.js";

console.log("sort:", quickSort([5, 3, 8, 1]));
console.log("optional:", Optional.ofNullable(null).orElse("default"));
console.log("money:", Money.of(19.99, "USD").multiply(3).format("en-US"));
console.log("date:", dates.parse("31/12/2024", "DD/MM/YYYY"));
console.log("rut valid:", rut.validate("12.345.678-5"));
console.log("stream:", Stream.range(1, 6).map((n) => n * n).toArray());
