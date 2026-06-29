# craft-kit — Feature Reference

[English README](./README.md) · [README en Español](./es.md)

Complete reference of everything `craft-kit` exports, grouped by module. Import any symbol from the package root (`import { X } from "craft-kit"`) or from a [subpath](./README.md#-subpath-imports) (e.g. `craft-kit/structures`).

- [Data structures](#data-structures)
- [Algorithms](#algorithms) — [sorting](#sorting) · [searching](#searching) · [graph](#graph) · [strings](#strings) · [dynamic programming](#dynamic-programming) · [backtracking](#backtracking) · [math](#math) · [geometry](#geometry)
- [Java-style utilities](#java-style-utilities) — [Optional](#optional) · [Stream](#stream) · [AsyncStream](#asyncstream) · [Collectors](#collectors) · [Gatherers](#gatherers) · [Collections](#collections) · [Atomics](#atomics) · [LazyConstant](#lazyconstant)
- [Functional programming](#functional-programming)
- [Async & concurrency](#async--concurrency)
- [Design patterns](#design-patterns)
- [HTTP client](#http-client)
- [Utilities](#utilities) — [arrays](#arrays) · [numbers](#numbers) · [booleans](#booleans) · [strings (utils)](#strings-utils) · [dates](#dates) · [objects](#objects) · [query](#query) · [is](#is-type-guards) · [guards](#guards) · [format](#format)
- [Validation](#validation)
- [Security](#security)
- [Common](#common)

---

## Data structures

| Export | Description |
| --- | --- |
| `Stack<T>` | LIFO stack: `push`, `pop`, `peek`, `size`, `isEmpty`, `clear`, `toArray`, iterable. |
| `Queue<T>` | FIFO queue (O(1)): `enqueue`, `dequeue`, `peek`, `size`, `isEmpty`. |
| `Deque<T>` | Double-ended queue: `addFirst/addLast`, `removeFirst/removeLast`, `peekFirst/peekLast`. |
| `SinglyLinkedList<T>` | Singly linked list: `addFirst/addLast`, `removeFirst`, `get`, `indexOf`, `reverse`. |
| `DoublyLinkedList<T>` | Doubly linked list + deque ops + `getFirst/getLast`, `reversed()`. Java-style `LinkedList`. |
| `HashTable<K,V>` | Separate-chaining hash table with auto-resize: `set`, `get`, `has`, `delete`, `keys`, `values`. |
| `BinarySearchTree<T>` | Unbalanced BST: `insert`, `contains`, `remove`, `min/max`, `inOrder/preOrder/postOrder`, `height`. |
| `AVLTree<T>` | Self-balancing BST (O(log n) ops): `insert`, `remove`, `contains`, `min/max`, `inOrder`, `height`. |
| `BinaryHeap<T>` | Comparator-based binary heap: `push`, `pop`, `peek`, `size`. |
| `MinHeap<T>` / `MaxHeap<T>` | Min/Max heap specializations of `BinaryHeap`. |
| `PriorityQueue<T>` | Priority queue backed by a heap: `enqueue/offer`, `dequeue/poll`, `peek`. |
| `Graph<T>` | Directed/undirected weighted graph: `addNode`, `addEdge`, `neighbors`, `nodes`, `edges`. |
| `UnionFind<T>` / `DisjointSet<T>` | Union-find with path compression: `union`, `find`, `connected`, `count`. |
| `LRUCache<K,V>` | Least-recently-used cache with capacity eviction. |
| `TTLCache<K,V>` | Cache with per-entry time-to-live expiration. |
| `Trie` | Prefix tree: `insert`, `has`, `startsWith`, `wordsWithPrefix`, `remove`. |
| `BloomFilter` | Probabilistic set membership (no false negatives): `add`, `has`. |
| `CircularBuffer<T>` | Fixed-capacity ring buffer: `push` (overwrites oldest), `shift`, `peek`, `toArray`. |
| `SegmentTree` | Range query/update structure (configurable merge, default sum). |
| `FenwickTree` / `BinaryIndexedTree` | Prefix-sum structure: `update`, `prefixSum`, `rangeSum`. |
| `SkipList<T>` | Probabilistic ordered list: `insert`, `remove`, `contains`, `toArray`. |
| `StructureFactory` | Factory: `stack()`, `queue()`, `deque()`, `minHeap()`, `binarySearchTree()`, … |

## Algorithms

### Sorting

All comparison sorts accept an optional `Comparator<T>` and return a **new** array. Numeric sorts take `number[]`.

| Export | Description |
| --- | --- |
| `bubbleSort` / `selectionSort` / `insertionSort` | O(n²) comparison sorts. |
| `quickSort` / `mergeSort` / `heapSort` / `shellSort` | O(n log n) comparison sorts (`mergeSort` is stable). |
| `countingSort` / `radixSort` | Integer sorts (support negatives). |
| `bucketSort` | Distribution sort for numbers (`bucketCount` option). |
| `Sorter` / `sorter` | Strategy + registry: `sort(name, arr, cmp?)`, `register(name, fn)`, `available()`. |
| `sortAsync` / `mergeSortAsync` | Merge sort awaiting an async comparator → `Promise<T[]>`. |

### Searching

| Export | Description |
| --- | --- |
| `binarySearch` | Binary search on a sorted array → index or `-1`. |
| `linearSearch` | Linear search with optional equality fn. |
| `jumpSearch` | Jump search on a sorted array (O(√n)). |
| `interpolationSearch` | Interpolation search on sorted numbers. |
| `Searcher` / `searcher` | Strategy + registry over search algorithms. |
| `binarySearchAsync` / `linearSearchAsync` | Async-comparator / async-predicate variants. |

### Graph

| Export | Description |
| --- | --- |
| `bfs` / `dfs` | Breadth-/depth-first traversal order. |
| `bfsShortestPath` | Fewest-edges path between two nodes. |
| `dijkstra` / `shortestPath` | Dijkstra distances/previous map; reconstructed path + distance. |
| `aStar` | A* search with a heuristic → `{ path, cost }`. |
| `bellmanFord` | Shortest paths with negative weights + negative-cycle detection. |
| `floydWarshall` / `floydWarshallPath` | All-pairs shortest paths + path reconstruction. |
| `topologicalSort` | Kahn's topological order (`null` if cyclic). |
| `connectedComponents` | Connected components of an undirected graph. |
| `stronglyConnectedComponents` | Tarjan's SCCs of a directed graph. |
| `bridges` / `articulationPoints` | Critical edges / cut vertices (undirected). |
| `isBipartite` / `bipartitePartition` | Bipartite check / 2-coloring partition. |
| `kruskalMST` / `primMST` | Minimum spanning tree (Kruskal / Prim). |
| `maxFlow` | Maximum flow (Edmonds-Karp). |

### Strings

| Export | Description |
| --- | --- |
| `levenshtein` / `similarity` | Edit distance / normalized similarity (0–1). |
| `kmpSearch` / `kmpSearchAll` | KMP substring search (first / all positions). |
| `fuzzyMatch` / `fuzzySearch` | Subsequence match / ranked fuzzy filter. |

### Dynamic programming

| Export | Description |
| --- | --- |
| `fibonacci` / `fibonacciSequence` / `fibonacciBig` | nth Fibonacci (number) / first n / BigInt. |
| `knapsack01` | 0/1 knapsack → `{ maxValue, selectedIndices }`. |
| `longestCommonSubsequence` | LCS of arrays/strings → `{ length, sequence }`. |

### Backtracking

| Export | Description |
| --- | --- |
| `solveNQueens` / `countNQueens` / `renderNQueens` | N-Queens solutions / count / board render. |
| `solveSudoku` | Solves a 9×9 board (0 = empty); returns a solved copy or `null`. |
| `solveMaze` | Finds a path in a grid (0 = open) → cells or `null`. |

### Math

| Export | Description |
| --- | --- |
| `gcd` / `lcm` | Greatest common divisor / least common multiple. |
| `isPrime` / `primesUpTo` | Primality test / sieve of Eratosthenes. |
| `factorial` / `combinations` / `permutations` | BigInt factorial / nCk / nPk. |
| `modPow` | Modular exponentiation (BigInt). |
| `randomInt` / `shuffle` / `sample` / `weightedSample` | Random int / Fisher-Yates copy / sampling. |
| `Vector` | Immutable numeric vector: `add`, `subtract`, `scale`, `dot`, `magnitude`, `normalize`. |
| `Matrix` | Immutable matrix: `add`, `multiply`, `transpose`, `scale`, `identity`, `zeros`. |
| `stats` | `mean`, `median`, `mode`, `variance`, `standardDeviation`, `percentile`, `range`, `sum`, `min`, `max`. |

### Geometry

| Export | Description |
| --- | --- |
| `Point` | `[number, number]` tuple type. |
| `distance` | Euclidean distance between two points. |
| `convexHull` | Andrew monotone-chain convex hull. |
| `pointInPolygon` | Ray-casting point-in-polygon test. |
| `polygonArea` | Polygon area (shoelace). |

## Java-style utilities

### Optional

`Optional<T>` — `of`, `ofNullable`, `empty`, `isPresent`, `isEmpty`, `get`, `orElse`, `orElseGet`, `orElseThrow`, `map`, `flatMap`, `filter`, `ifPresent`, `ifPresentOrElse`, plus async `mapAsync`, `flatMapAsync`, `ifPresentAsync`, `orElseGetAsync`.

### Stream

`Stream<T>` — lazy, chainable sequence.

| Method | Description |
| --- | --- |
| `of` / `from` / `empty` / `range` / `iterate` | Constructors (static). |
| `map` / `filter` / `flatMap` / `distinct` / `sorted` / `peek` | Lazy intermediate ops. |
| `limit` / `skip` / `takeWhile` / `dropWhile` | Slicing intermediate ops. |
| `mapMulti` | One-to-many via push consumer (Java 16). |
| `gather` | Custom intermediate op via a `Gatherer` (Java Gatherers). |
| `forEach` / `toArray` / `toList` / `reduce` / `count` / `join` | Terminal ops (`toList` = frozen array). |
| `anyMatch` / `allMatch` / `noneMatch` / `findFirst` / `min` / `max` / `collect` | Terminal ops. |

### AsyncStream

`AsyncStream<T>` — lazy pipeline over async/sync data; callbacks may return promises.

| Method | Description |
| --- | --- |
| `of` / `from` / `fromPromises` / `range` | Constructors (static). |
| `map` / `filter` / `flatMap` / `distinct` / `peek` / `limit` / `skip` / `takeWhile` / `dropWhile` | Lazy async intermediate ops. |
| `mapParallel(fn, concurrency)` | Bounded-concurrency mapping, order preserved. |
| `mapMulti` / `gather` | Same as `Stream`, async (reuses `Gatherers`). |
| `forEach` / `toArray` / `reduce` / `count` / `anyMatch` / `allMatch` / `noneMatch` / `findFirst` / `min` / `max` | Terminal ops → `Promise`. |

### Collectors

`Collectors` — factories for `Stream.collect`.

| Method | Description |
| --- | --- |
| `toArray` / `toSet` | Collect into array / Set. |
| `groupingBy(keyFn)` | `Map<K, T[]>` grouped by key. |
| `toMap(keyFn, valueFn)` | `Map<K, V>`. |
| `partitioningBy(pred)` | `{ true: T[], false: T[] }`. |
| `counting` / `summing(fn)` / `averaging(fn)` | Numeric reductions. |
| `joining(sep?, prefix?, suffix?)` | Join string representations. |
| `teeing(c1, c2, merge)` | Fork to two collectors and merge (Java 12). |
| `mapping(fn, down)` / `filtering(pred, down)` / `reducing(id, op)` | Adapting collectors. |
| `minBy(cmp)` / `maxBy(cmp)` | Min/max element. |

### Gatherers

`Gatherers` — built-in stream gatherers (for `Stream.gather` / `AsyncStream.gather`).

| Method | Description |
| --- | --- |
| `windowFixed(size)` | Consecutive non-overlapping windows. |
| `windowSliding(size)` | Overlapping sliding windows. |
| `fold(init, fn)` | Reduce to a single emitted value. |
| `scan(init, fn)` | Emit running accumulation. |
| `distinctBy(keyFn)` | Distinct by key. |
| `limit(n)` | Short-circuiting limit. |

### Collections

| Export | Description |
| --- | --- |
| `ArrayList<T>` | Array-backed list + SequencedCollection ops (`addFirst`, `reversed`, …). |
| `LinkedList<T>` | Doubly-linked list/deque (alias of `DoublyLinkedList`). |
| `HashMap<K,V>` | `put`, `get`, `getOrDefault`, `computeIfAbsent`, `merge`, `keySet`, `values`, `entrySet`. |
| `LinkedHashMap<K,V>` | Insertion-ordered `HashMap`. |
| `TreeMap<K,V>` | Sorted map: `firstKey`, `lastKey`, `floorKey`, `ceilingKey`, `lowerKey`, `higherKey`. |
| `HashSet<T>` / `LinkedHashSet<T>` | Set / insertion-ordered set. |
| `TreeSet<T>` | Sorted set: `first`, `last`, `floor`, `ceiling`, `lower`, `higher`. |
| `MultiMap<K,V>` | Key → multiple values. |
| `MultiSet<T>` | Counter/bag: `add`, `count`, `mostCommon`, `totalSize`, `distinctSize`. |
| `BiMap<K,V>` | Bidirectional map: `getKey`, `inverse()`. |
| `EnumMap<K,V>` / `EnumSet<T>` | Typed map/set over a fixed key set. |

### Atomics

`AtomicInteger`, `AtomicLong` (BigInt), `AtomicBoolean`, `AtomicReference<T>` — `get`, `set`, `getAndSet`, `incrementAndGet`/`decrementAndGet`, `addAndGet`/`getAndAdd`, `compareAndSet`, `compareAndExchange`, `updateAndGet`, `accumulateAndGet`/`getAndAccumulate`.

### LazyConstant

`LazyConstant<T>` (JEP 526) — compute-at-most-once value: `of(supplier)`, `empty()`, `get()`, `setIfUnset`, `computeIfUnset`, `isInitialized`. (See also `Lazy` in [functional](#functional-programming).)

## Functional programming

| Export | Description |
| --- | --- |
| `Result<T,E>` | Ok/Err container: `ok`, `err`, `isOk`, `unwrap`, `unwrapOr`, `map`, `mapErr`, `andThen`, `match`, `fromPromise`. |
| `tryCatch` / `tryCatchAsync` | Run a fn capturing errors into a `Result`. |
| `Pair` / `Triple` / `pair` / `triple` | Immutable tuples + factories. |
| `Lazy<T>` | Lazily-evaluated, memoized value. |
| `Range` | Numeric range: `of`, `contains`, `toArray`, iterable. |
| `StringBuilder` | Mutable string builder: `append`, `appendLine`, `insert`, `reverse`. |
| `pipe` / `compose` | Left-to-right / right-to-left function composition. |
| `curry` / `partial` | Currying / partial application. |
| `memoize` | Cache results by arguments. |
| `debounce` / `throttle` / `once` | Rate-limit / single-call wrappers. |
| `identity` / `noop` / `tap` | Helpers. |

## Async & concurrency

| Export | Description |
| --- | --- |
| `sleep` / `delay` | Promise-based delay. |
| `timeout` / `TimeoutError` | Reject a promise after a deadline. |
| `retry` | Retry with exponential backoff. |
| `pMap` / `pAll` / `pSettle` | Bounded-concurrency mapping / task runners. |
| `Deferred<T>` | Externally-resolvable promise. |
| `Semaphore` / `Mutex` | Concurrency limiter / mutual exclusion (`runExclusive`). |
| `AsyncQueue<T>` | Async producer/consumer queue. |
| `RateLimiter` | Token-bucket rate limiter: `tryRemove`, `removeTokens`. |
| `WorkerPool<T,R>` | Fixed-concurrency task pool: `run`, `runAll`, `onIdle`. |
| `CircuitBreaker` / `CircuitOpenError` | Circuit breaker (closed/open/half-open) for `execute`. |
| `Bulkhead` / `BulkheadFullError` | Concurrency + queue isolation. |
| `CountDownLatch` | Wait until a counter reaches zero. |
| `Channel<T>` / `ChannelClosedError` | CSP-style channel with backpressure, async-iterable. |
| `debounceAsync` / `throttleAsync` | Async debounce / throttle. |
| `iter` | Lazy generator helpers — see below. |

`iter` methods: `range`, `map`, `filter`, `take`, `drop`, `takeWhile`, `dropWhile`, `distinct`, `enumerate`, `zip`, `chunk`, `windows`, `flatten`, `concat`, `repeat`, `tap`, `toArray`, `reduce`, `count`, `forEach`, `find`.

## Design patterns

| Export | Description |
| --- | --- |
| `EventEmitter<TEvents>` | Typed observer: `on`, `once`, `off`, `emit`, `listenerCount`. |
| `PubSub<T>` | Topic-based publish/subscribe. |
| `StateMachine<S,E>` | Finite state machine: `state`, `can`, `send`, `reset`. |
| `CommandManager` | Command pattern with undo/redo history. |
| `Chain<TContext>` | Chain of responsibility (middleware-style). |
| `Mediator` | Request/handler mediator: `register`, `send`, `has`. |
| `ObjectPool<T>` | Reusable object pool: `acquire`, `release`. |
| `Builder<T>` / `createBuilder` | Generic builder. |
| `singleton` | Memoized single-instance factory. |
| `Signal<T>` / `computed` | Reactive value + derived value. |
| `Observable<T>` | Minimal cold observable: `subscribe`, `map`, `filter`. |

## HTTP client

| Export | Description |
| --- | --- |
| `HttpClient` | Adapter-based client: `request`, `get/post/put/patch/delete/head`, `useRequestInterceptor`, `useResponseInterceptor`. |
| `FetchAdapter` | Default adapter over `fetch` (injectable). |
| `HttpAdapter` | Interface to plug a custom transport (axios, node http, mock…). |
| `HttpError` | Thrown on non-2xx responses (carries `response`, `config`). |
| `HttpRequestConfig` / `HttpResponse` / `HttpMethod` / `RequestInterceptor` / `ResponseInterceptor` | Types. |

## Utilities

### arrays

`chunk`, `unique`, `uniqueBy`, `groupBy`, `partition`, `flatten`, `flattenDeep`, `zip`, `range`, `compact`, `difference`, `intersection`, `union`, `countBy`, `sortBy`, `first`, `last`, `sum`, `mean`, `min`, `max`, `take`, `drop`, `count`, `frequencies`, `mode`, `isAllNumbers`, `isAllStrings`, `isAllBooleans`, `isAllOf`, `includesAll`, `includesAny`, `shallowClone`, `insertAt`, `removeAt`, `move`, `rotate`, `equals`.

### numbers

`clamp`, `round`, `inRange`, `isEven`, `isOdd`, `isInteger`, `randomInt`, `sum`, `average`, `percentage`, `formatThousands`.

### booleans

`parse`, `isTruthy`, `xor`, `allTrue`, `anyTrue`, `noneTrue`, `toggle`.

### strings (utils)

`capitalize`, `capitalizeWords`, `camelCase`, `snakeCase`, `kebabCase`, `pascalCase`, `slugify`, `truncate`, `reverse`, `isBlank`, `stripAccents`, `words`, `count`, `countChar`, `charFrequency`, `occurrences`, `truncateMiddle`, `pluralize`, `singularize`, `mask`, `escapeHtml`, `unescapeHtml`.

### dates

`format`, `addDays`, `addMonths`, `addHours`, `addMinutes`, `diffInDays`, `diffInHours`, `startOfDay`, `endOfDay`, `isWeekend`, `isLeapYear`, `isSameDay`, `daysInMonth`, `parseISO`, `toISODate`.

### objects

`deepClone`, `shallowClone`, `clone`, `deepEqual`, `deepMerge`, `pick`, `omit`, `pickBy`, `omitBy`, `get`, `set`, `mapValues`, `mapKeys`, `invert`, `deepFreeze`, `flatten`, `unflatten`, `isEmpty`.

### query

`parse(queryString)`, `stringify(params)`.

### is (type guards)

`number`, `finite`, `integer`, `nan`, `string`, `boolean`, `bigint`, `symbol`, `function`, `array`, `object`, `plainObject`, `date`, `regexp`, `map`, `set`, `promise`, `error`, `null`, `undefined`, `nullish`, `defined`, `primitive`, `empty`.

### guards

Top-level helpers: `isNil`, `isNotNil`, `isEmpty`, `isNotEmpty`, `isBlank`, `isNotBlank`, `coalesce`, `defaultTo`, `requireNonNull`, `ensureArray`, `parseNumber`, `toInt`, `toFloat`, `toBoolean`, `toDate`, `assert`, `invariant`.

### format

`bytes`, `duration`, `relativeTime`, `number`, `currency`, `percent`.

## Validation

| Export | Description |
| --- | --- |
| `isEmail` | Email format check. |
| `rut` | Chilean RUT: `clean`, `computeDv`, `validate`, `format`, `random`. |
| `isValidRut` | Convenience RUT validator. |
| `validators` | `isEmail`, `isUrl`, `isUuid`, `isNumeric`, `isAlpha`, `isAlphanumeric`, `isInteger`, `isHexColor`, `isIpv4`, `isJson`, `isEmpty`. |
| `schema` | Zod-style builder: `string`, `number`, `boolean`, `array`, `object`, `literal`. |
| `Schema` / `StringSchema` / `NumberSchema` / `BooleanSchema` / `ArraySchema` / `ObjectSchema` | Schema classes (`parse`, `safeParse` → `Result`, `optional`, `nullable`, `default`). |
| `SchemaError` / `Infer<S>` | Validation error / inferred type helper. |

## Security

| Export | Description |
| --- | --- |
| `hash` / `sha256` / `sha512` / `md5` | Hash helpers. |
| `hmac` | Keyed HMAC. |
| `randomToken` / `uuid` | Random token / UUID v4. |
| `generatePassword` / `PasswordGenerator` | Cryptographically-strong password generation. |
| `pbkdf2` / `hashPassword` / `verifyPassword` | PBKDF2 derivation / salted hashing / constant-time verify. |
| `passwordStrength` | Heuristic strength score. |
| `aesEncrypt` / `aesDecrypt` | AES-256-GCM with scrypt key derivation. |
| `base64Encode/Decode` / `base64UrlEncode/Decode` / `base32Encode/Decode` / `hexEncode/Decode` / `base58Encode/Decode` | Encodings. |
| `constantTimeEqual` | Timing-safe comparison. |
| `totp` / `hotp` / `verifyTotp` | TOTP/HOTP (2FA) codes. |
| `nanoid` / `customAlphabet` / `ulid` | Compact / custom-alphabet / sortable IDs. |
| `signJwt` / `verifyJwt` / `decodeJwt` / `JwtError` | JSON Web Tokens (HS256/384/512). |

## Common

| Export | Description |
| --- | --- |
| `Comparator<T>` / `AsyncComparator<T>` | Comparator function types. |
| `naturalOrder` / `reverseOrder` / `numberComparator` / `stringComparator` | Built-in comparators. |
| `reversed` / `comparing` / `thenComparing` | Comparator combinators. |
| `MaybePromise<T>` | `T \| Promise<T>` type. |
| `UtilsRegistry<K,T>` | Generic named registry (Strategy/Registry pattern). |
| `VERSION` | Library version string. |
