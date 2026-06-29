# craft-kit

[![npm version](https://img.shields.io/npm/v/craft-kit.svg)](https://www.npmjs.com/package/craft-kit)
[![license](https://img.shields.io/npm/l/craft-kit.svg)](https://github.com/sorodriguezz/craft-kit/blob/main/LICENSE)
[![types](https://img.shields.io/npm/types/craft-kit.svg)](https://www.npmjs.com/package/craft-kit)

[English](https://github.com/sorodriguezz/craft-kit/blob/main/README.md) · **Español** · 📚 [Referencia completa de funcionalidades (tablas)](https://github.com/sorodriguezz/craft-kit/blob/main/FEATURES.md)

Kit de utilidades todo-en-uno para **JavaScript y TypeScript**: estructuras de datos, algoritmos, patrones de diseño, cliente HTTP, utilidades de estilo Java, programación funcional, helpers async, utilidades de arreglos/objetos/strings/fechas, validaciones (incluido **RUT chileno**) y seguridad.

- Funciona en **Node, navegador (con bundler), Express, NestJS, Vite**, etc.
- **ESM y CommonJS**: `import` y `require` sin configuración.
- **Tipos incluidos**, todo genérico. **Cero dependencias** y *tree-shakeable*.

## 📦 Instalación

```bash
npm install craft-kit      # o: yarn add craft-kit / pnpm add craft-kit
```

```ts
import { quickSort, HttpClient, EventEmitter, rut, arrays, is } from "craft-kit"; // ESM
const { quickSort, HttpClient } = require("craft-kit");                            // CommonJS
```

## 🧱 Estructuras de datos

```ts
import { Stack, PriorityQueue, LRUCache, Trie, AVLTree, Graph } from "craft-kit";

new Stack<number>().push(1).push(2).pop();          // 2
new PriorityQueue<number>((a, b) => a - b);          // cola de prioridad
new LRUCache<string, number>(100);                   // caché LRU
new AVLTree<number>();                                // árbol auto-balanceado
```

Disponibles: `Stack`, `Queue`, `Deque`, `SinglyLinkedList`, `DoublyLinkedList`, `HashTable`, `BinarySearchTree`, `AVLTree`, `BinaryHeap`/`MinHeap`/`MaxHeap`, `PriorityQueue`, `Graph`, `UnionFind`, `LRUCache`, `TTLCache`, `Trie`, `BloomFilter`, `CircularBuffer`, `SkipList`, `SegmentTree`, `FenwickTree`, `StructureFactory`.

## 🧮 Algoritmos

```ts
import { quickSort, binarySearch, sorter } from "craft-kit";
quickSort([5, 3, 8, 1]);                 // [1, 3, 5, 8]   (10 algoritmos de orden)
binarySearch([1, 2, 3, 4], 3);           // 2             (binary/linear/jump/interpolation)
```

**Grafos:** `bfs`, `dfs`, `dijkstra`/`shortestPath`, `aStar`, `bellmanFord`, `floydWarshall`, `topologicalSort`, `connectedComponents`, `kruskalMST`/`primMST`.

```ts
import { Graph, shortestPath, aStar } from "craft-kit";
const g = new Graph(); g.addEdge("A", "B", 1).addEdge("B", "C", 2).addEdge("A", "C", 4);
shortestPath(g, "A", "C");               // { path: ["A","B","C"], distance: 3 }
```

**Strings:** `levenshtein`, `similarity`, `kmpSearch`, `fuzzySearch`. **Programación dinámica:** `fibonacci`, `knapsack01`, `longestCommonSubsequence`. **Backtracking:** `solveNQueens`, `solveSudoku`, `solveMaze`. **Matemáticas:** `gcd`, `lcm`, `isPrime`, `primesUpTo`, `factorial`, `modPow`, `shuffle`, `stats`, `Vector`, `Matrix`.

```ts
import { levenshtein, stats, Vector } from "craft-kit";
levenshtein("kitten", "sitting");        // 3
stats.median([1, 2, 3, 4]);              // 2.5
new Vector([3, 4]).magnitude();          // 5
```

## 🎯 Patrones de diseño

```ts
import { EventEmitter, StateMachine, CommandManager, ObjectPool, Signal, singleton } from "craft-kit";

// Observer
const bus = new EventEmitter<{ login: { user: string } }>();
bus.on("login", (p) => console.log(p.user));
bus.emit("login", { user: "ana" });

// State machine (FSM)
const sm = new StateMachine({ initial: "idle", transitions: { idle: { start: "run" }, run: { stop: "idle" } } });
sm.send("start"); sm.state;              // "run"

// Command con undo/redo
const cmd = new CommandManager();
cmd.execute({ execute: () => {}, undo: () => {} });
cmd.undo(); cmd.redo();

// Reactividad
const count = new Signal(0);
count.subscribe((v) => console.log(v));
count.set(1);
```

También: `PubSub`, `Chain` (Chain of Responsibility), `Mediator`, `Builder`, `Observable`, `computed`.

## 🌐 Cliente HTTP (patrón Adapter)

La red es intercambiable: por defecto usa `fetch`, pero puedes inyectar tu propio `HttpAdapter` (axios, node http, un mock para tests, etc.). Soporta interceptores y reintentos.

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
// Adapter personalizado (Adapter pattern)
import { HttpClient, type HttpAdapter } from "craft-kit";
const myAdapter: HttpAdapter = { async request(config) { /* usa axios, etc. */ return /* HttpResponse */; } };
const client = new HttpClient({ adapter: myAdapter });
```

> El `FetchAdapter` por defecto usa `globalThis.fetch` (Node 18+ o navegador). En Node 16 pásale un `fetch` o usa otro adapter.

## ☕ Utilidades estilo Java

```ts
import { Optional, Stream, Collectors, HashMap, TreeSet, AtomicInteger } from "craft-kit";

Optional.ofNullable(user).map((u) => u.name).orElse("invitado");
Stream.range(1, 11).filter((n) => n % 2 === 0).map((n) => n * n).toArray();      // [4,16,36,64,100]
Stream.of(1, 2, 3, 4).collect(Collectors.groupingBy((n) => (n % 2 ? "impar" : "par")));
new HashMap<string, number>().put("a", 1);
```

Colecciones: `ArrayList`, `LinkedList`, `HashMap`, `LinkedHashMap`, `TreeMap`, `HashSet`, `LinkedHashSet`, `TreeSet`. Más `AtomicInteger`/`AtomicLong`/`AtomicBoolean`/`AtomicReference`.

### APIs de Java moderno (12 → 26)

```ts
import { Stream, Collectors, Gatherers, LazyConstant } from "craft-kit";

Stream.of(1, 2, 3).toList();                       // array inmutable (Java 16)
Stream.of(1, 2, 3, 4).mapMulti((n, push) => {      // uno-a-muchos sin Streams intermedios
  if (n % 2 === 0) { push(n); push(n * 10); }
}).toArray();                                       // [2, 20, 4, 40]

// Gatherers: operaciones intermedias personalizadas (JEP 485)
Stream.of(1, 2, 3, 4, 5, 6, 7).gather(Gatherers.windowFixed(3)).toList(); // [[1,2,3],[4,5,6],[7]]
Stream.of(1, 2, 3).gather(Gatherers.scan(() => 0, (a, b) => a + b)).toArray(); // [1, 3, 6]

// Collectors.teeing (Java 12): bifurca a dos colectores y fusiona en una pasada
Stream.of(10, 20, 30).collect(Collectors.teeing(
  Collectors.summing((x) => x),
  Collectors.counting(),
  (sum, count) => sum / count,
));                                                 // 20

// LazyConstant (JEP 526): inicialización única, segura y cacheada
const config = LazyConstant.of(() => loadConfig());
config.get();                                       // computa una sola vez
```

Además: `SequencedCollection` en `ArrayList`/`LinkedList` (`addFirst`/`getFirst`/`removeLast`/`reversed()`), atomics con `compareAndExchange`/`accumulateAndGet`, y `Gatherers` `windowSliding`/`fold`/`distinctBy`/`limit`. `AsyncStream` también soporta `mapMulti` y `gather` (reusando los mismos `Gatherers`); para mapeo concurrente (estilo `Gatherers.mapConcurrent`) usa `AsyncStream.mapParallel`.

## 🔁 Programación funcional

```ts
import { Result, pipe, memoize, Lazy } from "craft-kit";

Result.ok(5).map((x) => x * 2).unwrapOr(0);          // 10
pipe((x: number) => x + 1, (x) => x * 2)(3);         // 8
const cached = memoize(expensiveFn);
const lazy = new Lazy(() => compute());              // se evalúa una sola vez
```

También: `Pair`/`Triple`, `Range`, `StringBuilder`, `compose`, `curry`, `debounce`, `throttle`, `once`, `tap`.

## ⚡ Async

```ts
import { sleep, retry, timeout, pMap, Semaphore, RateLimiter, WorkerPool, AsyncStream } from "craft-kit";

await retry(() => fetchData(), { retries: 5, delayMs: 100, factor: 2 });   // backoff
await pMap(ids, (id) => loadUser(id), { concurrency: 4 });                  // paralelo + en orden
const limiter = new RateLimiter({ tokensPerInterval: 5, intervalMs: 1000 });

await AsyncStream.from(ids).mapParallel((id) => fetchUser(id), 4).toArray();
```

También: `pAll`, `pSettle`, `Mutex`, `Deferred`, `AsyncQueue`, e `iter` (generadores perezosos).

## 🛠️ Utilidades

Agrupadas en *namespaces*: `arrays`, `numbers`, `booleans`, `strings`, `dates`, `objects`, `query`, `is`.

```ts
import { arrays, strings, objects, is } from "craft-kit";

arrays.count([1, 2, 2, 3], 2);            // 2   (ocurrencias)
arrays.frequencies([1, 1, 2]);            // Map { 1 => 2, 2 => 1 }
arrays.isAllNumbers([1, 2, 3]);           // true (type guard)
arrays.unique([1, 1, 2]);                 // [1, 2]
arrays.groupBy(users, (u) => u.role);     // Map<role, User[]>

strings.count("banana", "a");             // 3
strings.charFrequency("aab");             // Map { a => 2, b => 1 }
strings.slugify("Canción Ñandú!");        // "cancion-nandu"

objects.deepClone(obj);                   // clon profundo (también shallowClone)
objects.deepEqual(a, b);
objects.get(obj, "a.b[0].c", fallback);   // acceso seguro por ruta
objects.pick(obj, ["a", "b"]);

is.number(5);  is.array(x);  is.plainObject(x);  is.nullish(x);  is.empty(x);
```

`numbers` (clamp, round, formatThousands…), `dates` (format, addDays, diffInDays…), `booleans` (parse, xor…), `query` (parse/stringify de query strings).

## 🛡️ Validación rápida (null / vacío)

Helpers directos (sin namespace) para los chequeos de siempre:

```ts
import { isNil, isEmpty, isBlank, coalesce, defaultTo, requireNonNull, ensureArray, parseNumber } from "craft-kit";

isNil(value);               // true si es null o undefined
isEmpty(value);             // true: null, undefined, "", [], {}, Map/Set vacíos
isBlank("   ");             // true (vacío o solo espacios)
coalesce(a, b, c);          // primer valor no-nulo (como ??, encadenable)
defaultTo(value, fallback); // value, o fallback si es null/undefined
requireNonNull(value);      // lanza TypeError si es null/undefined
ensureArray(x);             // x -> [x] ; [x] -> [x] ; null -> []
parseNumber("42", 0);       // 42  (o el fallback si no es número válido)
```

Aplanar / expandir objetos y arreglos:

```ts
import { objects, arrays } from "craft-kit";

objects.flatten({ a: { b: 1 }, c: [10, 20] });   // { "a.b": 1, "c.0": 10, "c.1": 20 }
objects.unflatten({ "a.b": 1, "c.0": 10 });      // { a: { b: 1 }, c: [10] }
arrays.flattenDeep([1, [2, [3, [4]]]]);          // [1, 2, 3, 4]
```

También con narrowing de tipos: `is.number`, `is.string`, `is.array`, `is.plainObject`, `is.nullish`, `is.empty`, etc.

## 🎨 Formateadores y coerción

```ts
import { format, toInt, toDate, toBoolean, tryCatch, Result } from "craft-kit";

format.bytes(1536);                  // "1.5 KB"
format.duration(90000);              // "1m 30s"
format.relativeTime(date);           // "hace 5 minutos" (locale-aware)
format.currency(1234.5);             // "$1,234.50"
format.percent(0.25);                // "25%"

toInt("42");                         // 42
toDate("2020-01-01");                // Date | undefined
toBoolean("yes");                    // true

// Captura errores como Result, sin try/catch:
const r = tryCatch(() => JSON.parse(input));
const value = r.isOk() ? r.unwrap() : fallback;
await Result.fromPromise(fetchData());          // Promise<Result<T, Error>>
```

Más en los namespaces: `objects.deepFreeze/invert/mapKeys/pickBy/omitBy`, `strings.pluralize/truncateMiddle/mask/escapeHtml`. IDs: `ulid()`, `base58Encode`/`base58Decode`.

## ✅ Validación

```ts
import { isEmail, rut, isValidRut, validators } from "craft-kit";

isEmail("user@dominio.cl");                // true
rut.validate("12.345.678-5");              // true   (RUT chileno)
rut.format("123456785");                   // "12.345.678-5"
rut.computeDv("12345678");                 // "5"
validators.isUrl("https://x.com");         // true
```

`validators` también: `isUuid`, `isNumeric`, `isAlpha`, `isAlphanumeric`, `isInteger`, `isHexColor`, `isIpv4`, `isJson`, `isEmpty`.

## 🔐 Seguridad

```ts
import { hashPassword, verifyPassword, aesEncrypt, aesDecrypt, totp, nanoid } from "craft-kit";

const stored = hashPassword("s3cret");     // PBKDF2 con salt aleatorio
verifyPassword("s3cret", stored);          // true  (tiempo constante)
const enc = aesEncrypt("secreto", "clave"); aesDecrypt(enc, "clave");   // AES-256-GCM
totp("BASE32SECRET");                      // código 2FA
nanoid();                                  // id corto URL-safe
```

También: `sha256`, `sha512`, `md5`, `hmac`, `pbkdf2`, `generatePassword`, `passwordStrength`, `hotp`, `verifyTotp`, `base64/base32/hex`, `base58`, `constantTimeEqual`, `uuid`, `ulid`.

## 🧩 Extender

Los algoritmos usan Strategy + Registry, así que puedes registrar los tuyos:

```ts
import { Sorter } from "craft-kit";
const sorter = new Sorter();
sorter.register("miSort", (arr) => [...arr] /* tu lógica */);
sorter.sort("miSort", [3, 1, 2]);
```

## 📂 Imports por subruta

Además del import principal, puedes importar por dominio para imports más limpios y mejor *tree-shaking*:

```ts
import { HttpClient } from "craft-kit/http";
import { EventEmitter } from "craft-kit/patterns";
import { arrays, objects, is } from "craft-kit/utils";
import { Graph, dijkstra } from "craft-kit/algorithms";
import { Stack, LRUCache } from "craft-kit/structures";
```

Subrutas: `craft-kit/{common, structures, algorithms, java, async, fp, patterns, http, utils, validation, security}`.

## ✅ Compatibilidad

Node.js 16+ (el cliente HTTP por defecto requiere `fetch`: Node 18+ o un adapter). ESM y CommonJS. Navegador con cualquier bundler. Tipos incluidos.

## 🧪 Calidad

Suite de tests con **Vitest** (`npm test`, `npm run coverage`) y benchmarks con **tinybench** (`npm run bench`). Build dual ESM + CommonJS con tsup y typecheck estricto (`npm run typecheck`).

## 📜 Licencia

MIT.
