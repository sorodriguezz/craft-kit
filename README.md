# craft-kit

[![npm version](https://img.shields.io/npm/v/craft-kit.svg)](https://www.npmjs.com/package/craft-kit)
[![license](https://img.shields.io/npm/l/craft-kit.svg)](https://github.com/sorodriguezz/craft-kit/blob/main/LICENSE)
[![types](https://img.shields.io/npm/types/craft-kit.svg)](https://www.npmjs.com/package/craft-kit)

**English** · [Español](https://github.com/sorodriguezz/craft-kit/blob/main/es.md) · 📚 [Full feature reference (tables)](https://github.com/sorodriguezz/craft-kit/blob/main/FEATURES.md)

All-in-one utility kit for **JavaScript and TypeScript**: data structures, algorithms, design patterns, an HTTP client, Java-style utilities, functional programming, async helpers, array/object/string/date utilities, validation (including **Chilean RUT**) and security.

- Works in **Node, the browser (with a bundler), Express, NestJS, Vite**, etc.
- **ESM and CommonJS**: `import` and `require` work with no configuration.
- **Types included**, fully generic. **Zero dependencies** and *tree-shakeable*.

> 📚 Looking for the full list of everything the library exposes? See the **[feature reference](https://github.com/sorodriguezz/craft-kit/blob/main/FEATURES.md)**.

## 📦 Installation

```bash
npm install craft-kit      # or: yarn add craft-kit / pnpm add craft-kit
```

```ts
import { quickSort, HttpClient, EventEmitter, rut, arrays, is } from "craft-kit"; // ESM
const { quickSort, HttpClient } = require("craft-kit");                            // CommonJS
```

## 🧱 Data structures

```ts
import { Stack, PriorityQueue, LRUCache, Trie, AVLTree, Graph } from "craft-kit";

new Stack<number>().push(1).push(2).pop();          // 2
new PriorityQueue<number>((a, b) => a - b);          // priority queue
new LRUCache<string, number>(100);                   // LRU cache
new AVLTree<number>();                                // self-balancing tree
```

Available: `Stack`, `Queue`, `Deque`, `SinglyLinkedList`, `DoublyLinkedList`, `HashTable`, `BinarySearchTree`, `AVLTree`, `BinaryHeap`/`MinHeap`/`MaxHeap`, `PriorityQueue`, `Graph`, `UnionFind`, `LRUCache`, `TTLCache`, `Trie`, `BloomFilter`, `CircularBuffer`, `SkipList`, `SegmentTree`, `FenwickTree`, `StructureFactory`.

## 🧮 Algorithms

```ts
import { quickSort, binarySearch, sorter } from "craft-kit";
quickSort([5, 3, 8, 1]);                 // [1, 3, 5, 8]   (10 sorting algorithms)
binarySearch([1, 2, 3, 4], 3);           // 2             (binary/linear/jump/interpolation)
```

**Graph:** `bfs`, `dfs`, `dijkstra`/`shortestPath`, `aStar`, `bellmanFord`, `floydWarshall`, `topologicalSort`, `connectedComponents`, `kruskalMST`/`primMST`, `stronglyConnectedComponents`, `bridges`, `isBipartite`, `maxFlow`.

```ts
import { Graph, shortestPath, aStar } from "craft-kit";
const g = new Graph(); g.addEdge("A", "B", 1).addEdge("B", "C", 2).addEdge("A", "C", 4);
shortestPath(g, "A", "C");               // { path: ["A","B","C"], distance: 3 }
```

**Strings:** `levenshtein`, `similarity`, `kmpSearch`, `fuzzySearch`. **Dynamic programming:** `fibonacci`, `knapsack01`, `longestCommonSubsequence`. **Backtracking:** `solveNQueens`, `solveSudoku`, `solveMaze`. **Math:** `gcd`, `lcm`, `isPrime`, `primesUpTo`, `factorial`, `modPow`, `shuffle`, `stats`, `Vector`, `Matrix`. **Geometry:** `convexHull`, `pointInPolygon`, `distance`.

```ts
import { levenshtein, stats, Vector } from "craft-kit";
levenshtein("kitten", "sitting");        // 3
stats.median([1, 2, 3, 4]);              // 2.5
new Vector([3, 4]).magnitude();          // 5
```

## 🎯 Design patterns

```ts
import { EventEmitter, StateMachine, CommandManager, ObjectPool, Signal, singleton } from "craft-kit";

// Observer
const bus = new EventEmitter<{ login: { user: string } }>();
bus.on("login", (p) => console.log(p.user));
bus.emit("login", { user: "ana" });

// State machine (FSM)
const sm = new StateMachine({ initial: "idle", transitions: { idle: { start: "run" }, run: { stop: "idle" } } });
sm.send("start"); sm.state;              // "run"

// Command with undo/redo
const cmd = new CommandManager();
cmd.execute({ execute: () => {}, undo: () => {} });
cmd.undo(); cmd.redo();

// Reactivity
const count = new Signal(0);
count.subscribe((v) => console.log(v));
count.set(1);
```

Also: `PubSub`, `Chain` (Chain of Responsibility), `Mediator`, `Builder`, `Observable`, `computed`.

## 🌐 HTTP client (Adapter pattern)

The transport is swappable: it uses `fetch` by default, but you can inject your own `HttpAdapter` (axios, node http, a mock for tests, etc.). Supports interceptors and retries.

```ts
import { HttpClient } from "craft-kit";

const api = new HttpClient({ baseURL: "https://api.example.com", timeout: 5000, retries: 2 });

api.useRequestInterceptor((config) => {
  config.headers = { ...config.headers, Authorization: "Bearer token" };
  return config;
});

const { data } = await api.get<User[]>("/users");
await api.post("/users", { name: "Ana" });
```

```ts
// Custom adapter (Adapter pattern)
import { HttpClient, type HttpAdapter } from "craft-kit";
const myAdapter: HttpAdapter = { async request(config) { /* use axios, etc. */ return /* HttpResponse */; } };
const client = new HttpClient({ adapter: myAdapter });
```

> `FetchAdapter` uses `globalThis.fetch` by default (Node 18+ or the browser). On Node 16 pass it a `fetch` or use another adapter.

## ☕ Java-style utilities

```ts
import { Optional, Stream, Collectors, HashMap, TreeSet, AtomicInteger } from "craft-kit";

Optional.ofNullable(user).map((u) => u.name).orElse("guest");
Stream.range(1, 11).filter((n) => n % 2 === 0).map((n) => n * n).toArray();      // [4,16,36,64,100]
Stream.of(1, 2, 3, 4).collect(Collectors.groupingBy((n) => (n % 2 ? "odd" : "even")));
new HashMap<string, number>().put("a", 1);
```

Collections: `ArrayList`, `LinkedList`, `HashMap`, `LinkedHashMap`, `TreeMap`, `HashSet`, `LinkedHashSet`, `TreeSet`, `MultiMap`, `MultiSet`, `BiMap`, `EnumMap`, `EnumSet`. Plus `AtomicInteger`/`AtomicLong`/`AtomicBoolean`/`AtomicReference`.

### Modern Java APIs (12 → 26)

```ts
import { Stream, Collectors, Gatherers, LazyConstant } from "craft-kit";

Stream.of(1, 2, 3).toList();                       // immutable array (Java 16)
Stream.of(1, 2, 3, 4).mapMulti((n, push) => {      // one-to-many without intermediate Streams
  if (n % 2 === 0) { push(n); push(n * 10); }
}).toArray();                                       // [2, 20, 4, 40]

// Gatherers: custom intermediate operations (JEP 485)
Stream.of(1, 2, 3, 4, 5, 6, 7).gather(Gatherers.windowFixed(3)).toList(); // [[1,2,3],[4,5,6],[7]]
Stream.of(1, 2, 3).gather(Gatherers.scan(() => 0, (a, b) => a + b)).toArray(); // [1, 3, 6]

// Collectors.teeing (Java 12): fork to two collectors and merge in one pass
Stream.of(10, 20, 30).collect(Collectors.teeing(
  Collectors.summing((x) => x),
  Collectors.counting(),
  (sum, count) => sum / count,
));                                                 // 20

// LazyConstant (JEP 526): compute-once, cached value
const config = LazyConstant.of(() => loadConfig());
config.get();                                       // computed only once
```

Also: `SequencedCollection` on `ArrayList`/`LinkedList` (`addFirst`/`getFirst`/`removeLast`/`reversed()`), atomics with `compareAndExchange`/`accumulateAndGet`, and `Gatherers` `windowSliding`/`fold`/`distinctBy`/`limit`. `AsyncStream` also supports `mapMulti` and `gather` (reusing the same `Gatherers`); for concurrent mapping (à la `Gatherers.mapConcurrent`) use `AsyncStream.mapParallel`.

## 🔁 Functional programming

```ts
import { Result, pipe, memoize, Lazy } from "craft-kit";

Result.ok(5).map((x) => x * 2).unwrapOr(0);          // 10
pipe((x: number) => x + 1, (x) => x * 2)(3);         // 8
const cached = memoize(expensiveFn);
const lazy = new Lazy(() => compute());              // evaluated only once
```

Also: `Pair`/`Triple`, `Range`, `StringBuilder`, `compose`, `curry`, `debounce`, `throttle`, `once`, `tap`, `tryCatch`.

## ⚡ Async

```ts
import { sleep, retry, timeout, pMap, Semaphore, RateLimiter, WorkerPool, AsyncStream } from "craft-kit";

await retry(() => fetchData(), { retries: 5, delayMs: 100, factor: 2 });   // backoff
await pMap(ids, (id) => loadUser(id), { concurrency: 4 });                  // parallel + ordered
const limiter = new RateLimiter({ tokensPerInterval: 5, intervalMs: 1000 });

await AsyncStream.from(ids).mapParallel((id) => fetchUser(id), 4).toArray();
```

Also: `pAll`, `pSettle`, `Mutex`, `Deferred`, `AsyncQueue`, and `iter` (lazy generators).

**Resilience & concurrency:** `CircuitBreaker`, `Bulkhead`, `CountDownLatch`, `Channel` (CSP), `debounceAsync`/`throttleAsync`.

```ts
import { CircuitBreaker } from "craft-kit";
const breaker = new CircuitBreaker({ failureThreshold: 5, resetTimeoutMs: 30000 });
await breaker.execute(() => callFlakyService());
```

## 🛠️ Utilities

Grouped into *namespaces*: `arrays`, `numbers`, `booleans`, `strings`, `dates`, `objects`, `query`, `is`, `colors`, `units`, `csv`, `duration`, `ansi`.

Binary: `ByteBuffer`, `bytes`, `BitSet`, `bits` (`craft-kit/binary`). Web Streams helpers: `streams` (`craft-kit/streams`).

Also: `Money` (decimal-safe), `Random` (seeded PRNG), `uuidv7`, `otpauthURL`, `luhn`/`creditCardBrand` + `validators.isCreditCard`/`isIBAN`/`isPhone`/`isPostalCode`, and `ansi` terminal colors.

```ts
import { arrays, strings, objects, is } from "craft-kit";

arrays.count([1, 2, 2, 3], 2);            // 2   (occurrences)
arrays.frequencies([1, 1, 2]);            // Map { 1 => 2, 2 => 1 }
arrays.isAllNumbers([1, 2, 3]);           // true (type guard)
arrays.unique([1, 1, 2]);                 // [1, 2]
arrays.groupBy(users, (u) => u.role);     // Map<role, User[]>

strings.count("banana", "a");             // 3
strings.charFrequency("aab");             // Map { a => 2, b => 1 }
strings.slugify("Canción Ñandú!");        // "cancion-nandu"

objects.deepClone(obj);                   // deep clone (also shallowClone)
objects.deepEqual(a, b);
objects.get(obj, "a.b[0].c", fallback);   // safe path access
objects.flatten({ a: { b: 1 } });         // { "a.b": 1 }

is.number(5);  is.array(x);  is.plainObject(x);  is.nullish(x);  is.empty(x);
```

`numbers` (clamp, round, formatThousands…), `dates` (format, parse, addDays, diffInDays, fromUnix/toUnix…), `booleans` (parse, xor…), `query` (parse/stringify query strings).

## 🛡️ Quick validation (null / empty)

Direct helpers (no namespace) for the checks you write all the time:

```ts
import { isNil, isEmpty, isBlank, coalesce, defaultTo, requireNonNull, ensureArray, parseNumber } from "craft-kit";

isNil(value);               // true if null or undefined
isEmpty(value);             // true: null, undefined, "", [], {}, empty Map/Set
isBlank("   ");             // true (empty or whitespace only)
coalesce(a, b, c);          // first non-null value (like ??, chainable)
defaultTo(value, fallback); // value, or fallback if null/undefined
requireNonNull(value);      // throws TypeError if null/undefined
ensureArray(x);             // x -> [x] ; [x] -> [x] ; null -> []
parseNumber("42", 0);       // 42  (or the fallback if not a valid number)
```

Flatten / expand objects and arrays:

```ts
import { objects, arrays } from "craft-kit";

objects.flatten({ a: { b: 1 }, c: [10, 20] });   // { "a.b": 1, "c.0": 10, "c.1": 20 }
objects.unflatten({ "a.b": 1, "c.0": 10 });      // { a: { b: 1 }, c: [10] }
arrays.flattenDeep([1, [2, [3, [4]]]]);          // [1, 2, 3, 4]
```

Also with type narrowing: `is.number`, `is.string`, `is.array`, `is.plainObject`, `is.nullish`, `is.empty`, etc.

## 🎨 Formatters & coercion

```ts
import { format, toInt, toDate, toBoolean, tryCatch, Result } from "craft-kit";

format.bytes(1536);                  // "1.5 KB"
format.duration(90000);              // "1m 30s"
format.relativeTime(date);           // "5 minutes ago" (locale-aware)
format.currency(1234.5);             // "$1,234.50"
format.percent(0.25);                // "25%"

toInt("42");                         // 42
toDate("2020-01-01");                // Date | undefined
toBoolean("yes");                    // true

// Capture errors as a Result, no try/catch:
const r = tryCatch(() => JSON.parse(input));
const value = r.isOk() ? r.unwrap() : fallback;
await Result.fromPromise(fetchData());          // Promise<Result<T, Error>>
```

More in the namespaces: `objects.deepFreeze/invert/mapKeys/pickBy/omitBy`, `strings.pluralize/truncateMiddle/mask/escapeHtml`. IDs: `ulid()`, `base58Encode`/`base58Decode`.

## ✅ Validation

```ts
import { isEmail, rut, isValidRut, validators, schema } from "craft-kit";

isEmail("user@domain.com");                // true
rut.validate("12.345.678-5");              // true   (Chilean RUT)
rut.format("123456785");                   // "12.345.678-5"
rut.computeDv("12345678");                 // "5"
validators.isUrl("https://x.com");         // true

// Chainable schema validation (zod-style) -> parse / safeParse
const userSchema = schema.object({ name: schema.string().min(2), age: schema.number().int().min(0) });
userSchema.parse({ name: "Ana", age: 30 });
userSchema.safeParse(input);               // Result<User, SchemaError>
```

`validators` also: `isUuid`, `isNumeric`, `isAlpha`, `isAlphanumeric`, `isInteger`, `isHexColor`, `isIpv4`, `isJson`, `isEmpty`.

## 🔐 Security

```ts
import { hashPassword, verifyPassword, aesEncrypt, aesDecrypt, signJwt, verifyJwt, totp, nanoid } from "craft-kit";

const stored = hashPassword("s3cret");     // PBKDF2 with random salt
verifyPassword("s3cret", stored);          // true  (constant time)
const enc = aesEncrypt("secret", "key"); aesDecrypt(enc, "key");   // AES-256-GCM

const token = signJwt({ sub: "123" }, "secret", { expiresIn: 3600 });
verifyJwt(token, "secret");                // payload (throws on invalid/expired)

totp("BASE32SECRET");                      // 2FA code
nanoid();                                  // short URL-safe id
```

Also: `sha256`, `sha512`, `md5`, `hmac`, `pbkdf2`, `generatePassword`, `passwordStrength`, `hotp`, `verifyTotp`, `base64/base32/hex`, `base58`, `constantTimeEqual`, `uuid`, `ulid`, `decodeJwt`.

## 🧩 Extending

Algorithms use Strategy + Registry, so you can register your own:

```ts
import { Sorter } from "craft-kit";
const sorter = new Sorter();
sorter.register("mySort", (arr) => [...arr] /* your logic */);
sorter.sort("mySort", [3, 1, 2]);
```

## 📂 Subpath imports

Besides the root import, you can import per domain for cleaner imports and better *tree-shaking*:

```ts
import { HttpClient } from "craft-kit/http";
import { EventEmitter } from "craft-kit/patterns";
import { arrays, objects, is } from "craft-kit/utils";
import { Graph, dijkstra } from "craft-kit/algorithms";
import { Stack, LRUCache } from "craft-kit/structures";
```

Subpaths: `craft-kit/{common, structures, algorithms, java, async, fp, patterns, http, binary, streams, utils, validation, security}`.

## ✅ Compatibility

Node.js 16+ (the HTTP client uses `fetch` by default: Node 18+ or an adapter). ESM and CommonJS. Browser with any bundler. Types included.

## 🧪 Quality

Test suite with **Vitest** (`npm test`, `npm run coverage`) and benchmarks with **tinybench** (`npm run bench`). Dual ESM + CommonJS build with tsup and strict type-checking (`npm run typecheck`).

## 📚 Full reference

Every export, grouped by module, lives in **[FEATURES.md](https://github.com/sorodriguezz/craft-kit/blob/main/FEATURES.md)**.

## 📜 License

MIT.
