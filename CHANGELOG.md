# Changelog

All notable changes to **craft-kit** are documented here. The project follows
[Semantic Versioning](https://semver.org/).

## [2.4.0]

- **Finance / numbers / IDs:** `Money` (decimal-safe arithmetic, `allocate`, `format`),
  `Random` (seeded, deterministic PRNG), `numbers.lerp` / `mapRange` / `normalize` / `roundTo`,
  `uuidv7`, and `otpauthURL` for TOTP.
- **Validators:** `luhn`, `creditCardBrand`, and `validators.isCreditCard` / `isIBAN` / `isPhone` / `isPostalCode`.
- **Terminal & text:** `ansi` (chalk-style colors/styles + `strip`), and
  `strings.template` / `dedent` / `indent` / `wordWrap` / `truncateWords`.

## [2.3.0]

- **Binary:** `ByteBuffer` (cursor + endianness), `bytes` (hex/base64/utf8/concat/xor), `BitSet`, `bits`.
- **Streams:** `streams` helpers over the Web Streams API (`fromIterable`, `map`, `filter`, `take`, `reduce`, `text`, …).
- **Converters:** `colors` (hex/rgb/hsl), `units` (temp/length/mass/angle), `csv` (parse/stringify),
  `duration` (parse/format), `numbers.toRoman` / `fromRoman` / `toOrdinal` / `toWords`.
- **Dates:** `dates.parse` (string → Date by pattern), extended `format` tokens, epoch converters.

## [2.2.0]

- **Modern Java APIs:** `Stream.toList` / `mapMulti` / `gather`, `Gatherers`, `Collectors.teeing` (+ mapping/filtering/reducing/minBy/maxBy),
  `LazyConstant`, `SequencedCollection` ops, atomics `compareAndExchange` / `accumulateAndGet`.
- `AsyncStream.mapMulti` / `gather` (sharing the same `Gatherer` abstraction).

## [2.1.0]

- **Resilience & concurrency:** `CircuitBreaker`, `Bulkhead`, `CountDownLatch`, `Channel`, `debounceAsync` / `throttleAsync`.
- **Validation:** chainable `schema` validator. **Security:** JWT (`signJwt` / `verifyJwt` / `decodeJwt`).
- **Algorithms:** SCC, bridges/articulation points, bipartite, max-flow, geometry. **Collections:** `MultiMap`, `MultiSet`, `BiMap`, `EnumMap`, `EnumSet`.
- Tooling: Vitest test suite + tinybench benchmarks.

## [2.0.0]

- Complete **framework-agnostic** rewrite — removed the NestJS dependency.
- Dual **ESM + CommonJS** build with subpath exports; zero runtime dependencies.
- Data structures, algorithms, Java-style utilities (`Optional`, `Stream`, atomics, collections),
  functional programming, async helpers, array/object/string/date utilities, validation (incl. Chilean RUT),
  security helpers, design patterns and an adapter-based HTTP client.

## [1.0.0]

- Initial release (NestJS-coupled password utilities).
