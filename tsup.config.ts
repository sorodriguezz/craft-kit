import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    common: "src/common/index.ts",
    structures: "src/structures/index.ts",
    algorithms: "src/algorithms/index.ts",
    java: "src/java/index.ts",
    async: "src/async/index.ts",
    fp: "src/fp/index.ts",
    patterns: "src/patterns/index.ts",
    http: "src/http/index.ts",
    utils: "src/utils/index.ts",
    validation: "src/validation/index.ts",
    security: "src/security/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: false,
  treeshake: true,
  splitting: true,
  target: "es2020",
  outDir: "dist",
});
