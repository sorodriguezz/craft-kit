# craft-kit — Referencia de funcionalidades

[English](https://github.com/sorodriguezz/craft-kit/blob/main/FEATURES.md) · **Español** · [README](https://github.com/sorodriguezz/craft-kit/blob/main/es.md)

Referencia completa de todo lo que exporta `craft-kit`, agrupado por módulo. Importa cualquier símbolo desde la raíz (`import { X } from "craft-kit"`) o desde una [subruta](https://github.com/sorodriguezz/craft-kit/blob/main/es.md) (ej. `craft-kit/structures`).

- [Estructuras de datos](#estructuras-de-datos)
- [Algoritmos](#algoritmos) — [ordenamiento](#ordenamiento) · [búsqueda](#búsqueda) · [grafos](#grafos) · [cadenas](#cadenas) · [programación dinámica](#programación-dinámica) · [backtracking](#backtracking) · [matemáticas](#matemáticas) · [geometría](#geometría)
- [Utilidades estilo Java](#utilidades-estilo-java) — [Optional](#optional) · [Stream](#stream) · [AsyncStream](#asyncstream) · [Collectors](#collectors) · [Gatherers](#gatherers) · [Colecciones](#colecciones) · [Atomics](#atomics) · [LazyConstant](#lazyconstant)
- [Programación funcional](#programación-funcional)
- [Async y concurrencia](#async-y-concurrencia)
- [Patrones de diseño](#patrones-de-diseño)
- [Cliente HTTP](#cliente-http)
- [Binario](#binario)
- [Streams](#streams)
- [Utilidades](#utilidades) — [arrays](#arrays) · [numbers](#numbers) · [booleans](#booleans) · [strings](#strings-utils) · [dates](#dates) · [objects](#objects) · [query](#query) · [is](#is-type-guards) · [guards](#guards) · [format](#format) · [colors](#colors) · [units](#units) · [csv](#csv) · [duration](#duration)
- [Validación](#validación)
- [Seguridad](#seguridad)
- [Común](#común)

---

## Estructuras de datos

| Export | Descripción |
| --- | --- |
| `Stack<T>` | Pila LIFO: `push`, `pop`, `peek`, `size`, `isEmpty`, `clear`, `toArray`, iterable. |
| `Queue<T>` | Cola FIFO (O(1)): `enqueue`, `dequeue`, `peek`, `size`, `isEmpty`. |
| `Deque<T>` | Cola doblemente terminada: `addFirst/addLast`, `removeFirst/removeLast`, `peekFirst/peekLast`. |
| `SinglyLinkedList<T>` | Lista enlazada simple: `addFirst/addLast`, `removeFirst`, `get`, `indexOf`, `reverse`. |
| `DoublyLinkedList<T>` | Lista doblemente enlazada + ops de deque + `getFirst/getLast`, `reversed()`. Es el `LinkedList` estilo Java. |
| `HashTable<K,V>` | Tabla hash con encadenamiento y *resize* automático: `set`, `get`, `has`, `delete`, `keys`, `values`. |
| `BinarySearchTree<T>` | BST no balanceado: `insert`, `contains`, `remove`, `min/max`, `inOrder/preOrder/postOrder`, `height`. |
| `AVLTree<T>` | BST auto-balanceado (O(log n)): `insert`, `remove`, `contains`, `min/max`, `inOrder`, `height`. |
| `BinaryHeap<T>` | Heap binario por comparador: `push`, `pop`, `peek`, `size`. |
| `MinHeap<T>` / `MaxHeap<T>` | Especializaciones min/max de `BinaryHeap`. |
| `PriorityQueue<T>` | Cola de prioridad sobre un heap: `enqueue/offer`, `dequeue/poll`, `peek`. |
| `Graph<T>` | Grafo con/sin dirección y pesos: `addNode`, `addEdge`, `neighbors`, `nodes`, `edges`. |
| `UnionFind<T>` / `DisjointSet<T>` | Union-find con compresión de caminos: `union`, `find`, `connected`, `count`. |
| `LRUCache<K,V>` | Caché LRU con desalojo por capacidad. |
| `TTLCache<K,V>` | Caché con expiración (time-to-live) por entrada. |
| `Trie` | Árbol de prefijos: `insert`, `has`, `startsWith`, `wordsWithPrefix`, `remove`. |
| `BloomFilter` | Pertenencia probabilística (sin falsos negativos): `add`, `has`. |
| `CircularBuffer<T>` | Buffer circular de capacidad fija: `push` (sobrescribe el más viejo), `shift`, `peek`, `toArray`. |
| `SegmentTree` | Estructura de consultas/actualizaciones de rango (merge configurable, por defecto suma). |
| `FenwickTree` / `BinaryIndexedTree` | Sumas de prefijos: `update`, `prefixSum`, `rangeSum`. |
| `SkipList<T>` | Lista ordenada probabilística: `insert`, `remove`, `contains`, `toArray`. |
| `StructureFactory` | Factory: `stack()`, `queue()`, `deque()`, `minHeap()`, `binarySearchTree()`, … |

## Algoritmos

### Ordenamiento

Los ordenamientos por comparación aceptan un `Comparator<T>` opcional y devuelven un arreglo **nuevo**. Los numéricos reciben `number[]`.

| Export | Descripción |
| --- | --- |
| `bubbleSort` / `selectionSort` / `insertionSort` | Ordenamientos por comparación O(n²). |
| `quickSort` / `mergeSort` / `heapSort` / `shellSort` | Ordenamientos O(n log n) (`mergeSort` es estable). |
| `countingSort` / `radixSort` | Ordenamientos de enteros (soportan negativos). |
| `bucketSort` | Ordenamiento por distribución para números (opción `bucketCount`). |
| `Sorter` / `sorter` | Strategy + registry: `sort(name, arr, cmp?)`, `register(name, fn)`, `available()`. |
| `sortAsync` / `mergeSortAsync` | Merge sort con comparador asíncrono → `Promise<T[]>`. |

### Búsqueda

| Export | Descripción |
| --- | --- |
| `binarySearch` | Búsqueda binaria en arreglo ordenado → índice o `-1`. |
| `linearSearch` | Búsqueda lineal con función de igualdad opcional. |
| `jumpSearch` | Jump search en arreglo ordenado (O(√n)). |
| `interpolationSearch` | Búsqueda por interpolación en números ordenados. |
| `Searcher` / `searcher` | Strategy + registry sobre algoritmos de búsqueda. |
| `binarySearchAsync` / `linearSearchAsync` | Variantes con comparador/predicado asíncrono. |

### Grafos

| Export | Descripción |
| --- | --- |
| `bfs` / `dfs` | Recorrido en anchura / profundidad. |
| `bfsShortestPath` | Camino con menos aristas entre dos nodos. |
| `dijkstra` / `shortestPath` | Distancias/previos de Dijkstra; camino + distancia reconstruidos. |
| `aStar` | Búsqueda A* con heurística → `{ path, cost }`. |
| `bellmanFord` | Caminos mínimos con pesos negativos + detección de ciclo negativo. |
| `floydWarshall` / `floydWarshallPath` | Caminos mínimos entre todos los pares + reconstrucción. |
| `topologicalSort` | Orden topológico (Kahn); `null` si hay ciclo. |
| `connectedComponents` | Componentes conexas de un grafo no dirigido. |
| `stronglyConnectedComponents` | SCC de Tarjan (grafo dirigido). |
| `bridges` / `articulationPoints` | Aristas críticas / puntos de articulación (no dirigido). |
| `isBipartite` / `bipartitePartition` | Comprobación bipartita / partición por 2-coloreo. |
| `kruskalMST` / `primMST` | Árbol de expansión mínima (Kruskal / Prim). |
| `maxFlow` | Flujo máximo (Edmonds-Karp). |

### Cadenas

| Export | Descripción |
| --- | --- |
| `levenshtein` / `similarity` | Distancia de edición / similitud normalizada (0–1). |
| `kmpSearch` / `kmpSearchAll` | Búsqueda de subcadena KMP (primera / todas las posiciones). |
| `fuzzyMatch` / `fuzzySearch` | Coincidencia por subsecuencia / filtro difuso ordenado. |

### Programación dinámica

| Export | Descripción |
| --- | --- |
| `fibonacci` / `fibonacciSequence` / `fibonacciBig` | n-ésimo Fibonacci (number) / primeros n / BigInt. |
| `knapsack01` | Mochila 0/1 → `{ maxValue, selectedIndices }`. |
| `longestCommonSubsequence` | LCS de arreglos/strings → `{ length, sequence }`. |

### Backtracking

| Export | Descripción |
| --- | --- |
| `solveNQueens` / `countNQueens` / `renderNQueens` | Soluciones de N-Reinas / conteo / render del tablero. |
| `solveSudoku` | Resuelve un tablero 9×9 (0 = vacío); devuelve una copia resuelta o `null`. |
| `solveMaze` | Encuentra un camino en una grilla (0 = libre) → celdas o `null`. |

### Matemáticas

| Export | Descripción |
| --- | --- |
| `gcd` / `lcm` | Máximo común divisor / mínimo común múltiplo. |
| `isPrime` / `primesUpTo` | Test de primalidad / criba de Eratóstenes. |
| `factorial` / `combinations` / `permutations` | Factorial / nCk / nPk (BigInt). |
| `modPow` | Exponenciación modular (BigInt). |
| `randomInt` / `shuffle` / `sample` / `weightedSample` | Entero aleatorio / barajado Fisher-Yates / muestreo. |
| `Vector` | Vector numérico inmutable: `add`, `subtract`, `scale`, `dot`, `magnitude`, `normalize`. |
| `Matrix` | Matriz inmutable: `add`, `multiply`, `transpose`, `scale`, `identity`, `zeros`. |
| `stats` | `mean`, `median`, `mode`, `variance`, `standardDeviation`, `percentile`, `range`, `sum`, `min`, `max`. |

### Geometría

| Export | Descripción |
| --- | --- |
| `Point` | Tipo tupla `[number, number]`. |
| `distance` | Distancia euclidiana entre dos puntos. |
| `convexHull` | Envolvente convexa (monotone chain de Andrew). |
| `pointInPolygon` | Test punto-en-polígono (ray casting). |
| `polygonArea` | Área del polígono (shoelace). |

## Utilidades estilo Java

### Optional

`Optional<T>` — `of`, `ofNullable`, `empty`, `isPresent`, `isEmpty`, `get`, `orElse`, `orElseGet`, `orElseThrow`, `map`, `flatMap`, `filter`, `ifPresent`, `ifPresentOrElse`, y versiones async `mapAsync`, `flatMapAsync`, `ifPresentAsync`, `orElseGetAsync`.

### Stream

`Stream<T>` — secuencia perezosa y encadenable.

| Método | Descripción |
| --- | --- |
| `of` / `from` / `empty` / `range` / `iterate` | Constructores (estáticos). |
| `map` / `filter` / `flatMap` / `distinct` / `sorted` / `peek` | Operaciones intermedias perezosas. |
| `limit` / `skip` / `takeWhile` / `dropWhile` | Operaciones de recorte. |
| `mapMulti` | Uno-a-muchos vía consumidor `push` (Java 16). |
| `gather` | Operación intermedia personalizada vía `Gatherer` (Java Gatherers). |
| `forEach` / `toArray` / `toList` / `reduce` / `count` / `join` | Operaciones terminales (`toList` = arreglo congelado). |
| `anyMatch` / `allMatch` / `noneMatch` / `findFirst` / `min` / `max` / `collect` | Operaciones terminales. |

### AsyncStream

`AsyncStream<T>` — pipeline perezoso sobre datos async/sync; los callbacks pueden devolver promesas.

| Método | Descripción |
| --- | --- |
| `of` / `from` / `fromPromises` / `range` | Constructores (estáticos). |
| `map` / `filter` / `flatMap` / `distinct` / `peek` / `limit` / `skip` / `takeWhile` / `dropWhile` | Intermedias async perezosas. |
| `mapParallel(fn, concurrency)` | Mapeo con concurrencia acotada, en orden. |
| `mapMulti` / `gather` | Igual que `Stream`, en async (reutiliza `Gatherers`). |
| `forEach` / `toArray` / `reduce` / `count` / `anyMatch` / `allMatch` / `noneMatch` / `findFirst` / `min` / `max` | Terminales → `Promise`. |

### Collectors

`Collectors` — factories para `Stream.collect`.

| Método | Descripción |
| --- | --- |
| `toArray` / `toSet` | Recolecta en arreglo / Set. |
| `groupingBy(keyFn)` | `Map<K, T[]>` agrupado por clave. |
| `toMap(keyFn, valueFn)` | `Map<K, V>`. |
| `partitioningBy(pred)` | `{ true: T[], false: T[] }`. |
| `counting` / `summing(fn)` / `averaging(fn)` | Reducciones numéricas. |
| `joining(sep?, prefix?, suffix?)` | Une representaciones en string. |
| `teeing(c1, c2, merge)` | Bifurca a dos colectores y fusiona (Java 12). |
| `mapping(fn, down)` / `filtering(pred, down)` / `reducing(id, op)` | Colectores adaptadores. |
| `minBy(cmp)` / `maxBy(cmp)` | Elemento mínimo / máximo. |

### Gatherers

`Gatherers` — gatherers integrados (para `Stream.gather` / `AsyncStream.gather`).

| Método | Descripción |
| --- | --- |
| `windowFixed(size)` | Ventanas consecutivas no solapadas. |
| `windowSliding(size)` | Ventanas deslizantes solapadas. |
| `fold(init, fn)` | Reduce a un único valor emitido. |
| `scan(init, fn)` | Emite la acumulación corriente. |
| `distinctBy(keyFn)` | Distintos por clave. |
| `limit(n)` | Límite con corto-circuito. |

### Colecciones

| Export | Descripción |
| --- | --- |
| `ArrayList<T>` | Lista sobre arreglo + ops SequencedCollection (`addFirst`, `reversed`, …). |
| `LinkedList<T>` | Lista/deque doblemente enlazada (alias de `DoublyLinkedList`). |
| `HashMap<K,V>` | `put`, `get`, `getOrDefault`, `computeIfAbsent`, `merge`, `keySet`, `values`, `entrySet`. |
| `LinkedHashMap<K,V>` | `HashMap` con orden de inserción. |
| `TreeMap<K,V>` | Mapa ordenado: `firstKey`, `lastKey`, `floorKey`, `ceilingKey`, `lowerKey`, `higherKey`. |
| `HashSet<T>` / `LinkedHashSet<T>` | Conjunto / conjunto con orden de inserción. |
| `TreeSet<T>` | Conjunto ordenado: `first`, `last`, `floor`, `ceiling`, `lower`, `higher`. |
| `MultiMap<K,V>` | Clave → múltiples valores. |
| `MultiSet<T>` | Contador/bolsa: `add`, `count`, `mostCommon`, `totalSize`, `distinctSize`. |
| `BiMap<K,V>` | Mapa bidireccional: `getKey`, `inverse()`. |
| `EnumMap<K,V>` / `EnumSet<T>` | Mapa/conjunto tipado sobre un conjunto fijo de claves. |

### Atomics

`AtomicInteger`, `AtomicLong` (BigInt), `AtomicBoolean`, `AtomicReference<T>` — `get`, `set`, `getAndSet`, `incrementAndGet`/`decrementAndGet`, `addAndGet`/`getAndAdd`, `compareAndSet`, `compareAndExchange`, `updateAndGet`, `accumulateAndGet`/`getAndAccumulate`.

### LazyConstant

`LazyConstant<T>` (JEP 526) — valor que se computa como máximo una vez: `of(supplier)`, `empty()`, `get()`, `setIfUnset`, `computeIfUnset`, `isInitialized`. (Ver también `Lazy` en [programación funcional](#programación-funcional).)

## Programación funcional

| Export | Descripción |
| --- | --- |
| `Result<T,E>` | Contenedor Ok/Err: `ok`, `err`, `isOk`, `unwrap`, `unwrapOr`, `map`, `mapErr`, `andThen`, `match`, `fromPromise`. |
| `tryCatch` / `tryCatchAsync` | Ejecuta una fn capturando errores en un `Result`. |
| `Pair` / `Triple` / `pair` / `triple` | Tuplas inmutables + factories. |
| `Lazy<T>` | Valor perezoso y memoizado. |
| `Range` | Rango numérico: `of`, `contains`, `toArray`, iterable. |
| `StringBuilder` | Constructor de strings mutable: `append`, `appendLine`, `insert`, `reverse`. |
| `pipe` / `compose` | Composición de funciones izq→der / der→izq. |
| `curry` / `partial` | Currificación / aplicación parcial. |
| `memoize` | Cachea resultados por argumentos. |
| `debounce` / `throttle` / `once` | Limitadores de tasa / ejecución única. |
| `identity` / `noop` / `tap` | Helpers. |

## Async y concurrencia

| Export | Descripción |
| --- | --- |
| `sleep` / `delay` | Demora basada en promesas. |
| `timeout` / `TimeoutError` | Rechaza una promesa pasado un plazo. |
| `retry` | Reintento con backoff exponencial. |
| `pMap` / `pAll` / `pSettle` | Mapeo / ejecución de tareas con concurrencia acotada. |
| `Deferred<T>` | Promesa resoluble desde afuera. |
| `Semaphore` / `Mutex` | Limitador de concurrencia / exclusión mutua (`runExclusive`). |
| `AsyncQueue<T>` | Cola async productor/consumidor. |
| `RateLimiter` | Limitador de tasa token-bucket: `tryRemove`, `removeTokens`. |
| `WorkerPool<T,R>` | Pool de tareas con concurrencia fija: `run`, `runAll`, `onIdle`. |
| `CircuitBreaker` / `CircuitOpenError` | Circuit breaker (closed/open/half-open) para `execute`. |
| `Bulkhead` / `BulkheadFullError` | Aislamiento por concurrencia + cola. |
| `CountDownLatch` | Espera hasta que un contador llega a cero. |
| `Channel<T>` / `ChannelClosedError` | Canal estilo CSP con backpressure, async-iterable. |
| `debounceAsync` / `throttleAsync` | Debounce / throttle asíncronos. |
| `iter` | Helpers generadores perezosos — ver abajo. |

Métodos de `iter`: `range`, `map`, `filter`, `take`, `drop`, `takeWhile`, `dropWhile`, `distinct`, `enumerate`, `zip`, `chunk`, `windows`, `flatten`, `concat`, `repeat`, `tap`, `toArray`, `reduce`, `count`, `forEach`, `find`.

## Patrones de diseño

| Export | Descripción |
| --- | --- |
| `EventEmitter<TEvents>` | Observer tipado: `on`, `once`, `off`, `emit`, `listenerCount`. |
| `PubSub<T>` | Publicación/suscripción por tópicos. |
| `StateMachine<S,E>` | Máquina de estados finita: `state`, `can`, `send`, `reset`. |
| `CommandManager` | Patrón Command con historial undo/redo. |
| `Chain<TContext>` | Cadena de responsabilidad (estilo middleware). |
| `Mediator` | Mediador petición/handler: `register`, `send`, `has`. |
| `ObjectPool<T>` | Pool de objetos reutilizables: `acquire`, `release`. |
| `Builder<T>` / `createBuilder` | Builder genérico. |
| `singleton` | Factory de instancia única memoizada. |
| `Signal<T>` / `computed` | Valor reactivo + valor derivado. |
| `Observable<T>` | Observable frío mínimo: `subscribe`, `map`, `filter`. |

## Cliente HTTP

| Export | Descripción |
| --- | --- |
| `HttpClient` | Cliente basado en Adapter: `request`, `get/post/put/patch/delete/head`, `useRequestInterceptor`, `useResponseInterceptor`. |
| `FetchAdapter` | Adapter por defecto sobre `fetch` (inyectable). |
| `HttpAdapter` | Interfaz para enchufar un transporte propio (axios, node http, mock…). |
| `HttpError` | Se lanza ante respuestas no-2xx (lleva `response`, `config`). |
| `HttpRequestConfig` / `HttpResponse` / `HttpMethod` / `RequestInterceptor` / `ResponseInterceptor` | Tipos. |

## Utilidades

### arrays

`chunk`, `unique`, `uniqueBy`, `groupBy`, `partition`, `flatten`, `flattenDeep`, `zip`, `range`, `compact`, `difference`, `intersection`, `union`, `countBy`, `sortBy`, `first`, `last`, `sum`, `mean`, `min`, `max`, `take`, `drop`, `count`, `frequencies`, `mode`, `isAllNumbers`, `isAllStrings`, `isAllBooleans`, `isAllOf`, `includesAll`, `includesAny`, `shallowClone`, `insertAt`, `removeAt`, `move`, `rotate`, `equals`.

### numbers

`clamp`, `round`, `inRange`, `isEven`, `isOdd`, `isInteger`, `randomInt`, `sum`, `average`, `percentage`, `formatThousands`, `toRoman`, `fromRoman`, `toOrdinal`, `toWords`, `lerp`, `mapRange`, `normalize`, `roundTo`.

### booleans

`parse`, `isTruthy`, `xor`, `allTrue`, `anyTrue`, `noneTrue`, `toggle`.

### strings (utils)

`capitalize`, `capitalizeWords`, `camelCase`, `snakeCase`, `kebabCase`, `pascalCase`, `slugify`, `truncate`, `reverse`, `isBlank`, `stripAccents`, `words`, `count`, `countChar`, `charFrequency`, `occurrences`, `truncateMiddle`, `pluralize`, `singularize`, `mask`, `escapeHtml`, `unescapeHtml`, `template`, `dedent`, `indent`, `wordWrap`, `truncateWords`.

### dates

`format`, `addDays`, `addMonths`, `addHours`, `addMinutes`, `diffInDays`, `diffInHours`, `startOfDay`, `endOfDay`, `isWeekend`, `isLeapYear`, `isSameDay`, `daysInMonth`, `parse`, `parseISO`, `toISODate`, `fromUnix`, `toUnix`, `fromTimestamp`, `toTimestamp`.

### objects

`deepClone`, `shallowClone`, `clone`, `deepEqual`, `deepMerge`, `pick`, `omit`, `pickBy`, `omitBy`, `get`, `set`, `mapValues`, `mapKeys`, `invert`, `deepFreeze`, `flatten`, `unflatten`, `isEmpty`.

### query

`parse(queryString)`, `stringify(params)`.

### is (type guards)

`number`, `finite`, `integer`, `nan`, `string`, `boolean`, `bigint`, `symbol`, `function`, `array`, `object`, `plainObject`, `date`, `regexp`, `map`, `set`, `promise`, `error`, `null`, `undefined`, `nullish`, `defined`, `primitive`, `empty`.

### guards

Helpers de primer nivel: `isNil`, `isNotNil`, `isEmpty`, `isNotEmpty`, `isBlank`, `isNotBlank`, `coalesce`, `defaultTo`, `requireNonNull`, `ensureArray`, `parseNumber`, `toInt`, `toFloat`, `toBoolean`, `toDate`, `assert`, `invariant`.

### format

`bytes`, `duration`, `relativeTime`, `number`, `currency`, `percent`.

### colors

`hexToRgb`, `rgbToHex`, `rgbToHsl`, `hslToRgb`, `hexToHsl`, `hslToHex`, `lighten`, `darken`, `mix`, `luminance`, `contrastRatio`, `isValidHex`, `randomHex`.

### units

Temperatura / longitud / masa / ángulo: `celsiusToFahrenheit`, `fahrenheitToCelsius`, `celsiusToKelvin`, `kelvinToCelsius`, `kmToMiles`, `milesToKm`, `metersToFeet`, `feetToMeters`, `cmToInches`, `inchesToCm`, `kgToPounds`, `poundsToKg`, `gramsToOunces`, `ouncesToGrams`, `degreesToRadians`, `radiansToDegrees`.

### csv

`parse(text, { delimiter?, header? })`, `stringify(rows, { delimiter?, header?, columns? })`.

### duration

`parse("1h30m")` → ms, `format(ms)`, `toObject(ms)`, `fromObject({ days, hours, minutes, seconds, milliseconds })`.

### ansi

Colores/estilos de terminal (estilo chalk): `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`, fondos (`bgRed`…), estilos (`bold`, `dim`, `italic`, `underline`, `inverse`, `strikethrough`) y `strip`.

### Money y Random (clases)

`Money` — dinero con decimales exactos: `of`, `fromMinor`, `add`/`subtract`/`multiply`/`divide`, `allocate`, `compare`, `format`. `Random` — PRNG determinista con semilla: `next`, `int`, `float`, `bool`, `pick`, `sample`, `shuffle`, `string`.

## Validación

| Export | Descripción |
| --- | --- |
| `isEmail` | Validación de formato de email. |
| `rut` | RUT chileno: `clean`, `computeDv`, `validate`, `format`, `random`. |
| `isValidRut` | Validador de RUT de conveniencia. |
| `validators` | `isEmail`, `isUrl`, `isUuid`, `isNumeric`, `isAlpha`, `isAlphanumeric`, `isInteger`, `isHexColor`, `isIpv4`, `isJson`, `isEmpty`, `isCreditCard`, `isIBAN`, `isPhone`, `isPostalCode`. |
| `luhn` / `creditCardBrand` | Checksum de Luhn / detección de marca de tarjeta. |
| `schema` | Builder estilo zod: `string`, `number`, `boolean`, `array`, `object`, `literal`. |
| `Schema` / `StringSchema` / `NumberSchema` / `BooleanSchema` / `ArraySchema` / `ObjectSchema` | Clases de schema (`parse`, `safeParse` → `Result`, `optional`, `nullable`, `default`). |
| `SchemaError` / `Infer<S>` | Error de validación / helper de tipo inferido. |

## Seguridad

| Export | Descripción |
| --- | --- |
| `hash` / `sha256` / `sha512` / `md5` | Helpers de hash. |
| `hmac` | HMAC con clave. |
| `randomToken` / `uuid` | Token aleatorio / UUID v4. |
| `generatePassword` / `PasswordGenerator` | Generación de contraseñas con RNG criptográfico. |
| `pbkdf2` / `hashPassword` / `verifyPassword` | Derivación PBKDF2 / hashing con salt / verificación en tiempo constante. |
| `passwordStrength` | Puntaje heurístico de fortaleza. |
| `aesEncrypt` / `aesDecrypt` | AES-256-GCM con derivación de clave por scrypt. |
| `base64Encode/Decode` / `base64UrlEncode/Decode` / `base32Encode/Decode` / `hexEncode/Decode` / `base58Encode/Decode` | Codificaciones. |
| `constantTimeEqual` | Comparación en tiempo constante. |
| `totp` / `hotp` / `verifyTotp` / `otpauthURL` | Códigos TOTP/HOTP (2FA). |
| `nanoid` / `customAlphabet` / `ulid` / `uuidv7` | IDs compactos / de alfabeto custom / ordenables. |
| `signJwt` / `verifyJwt` / `decodeJwt` / `JwtError` | JSON Web Tokens (HS256/384/512). |

## Binario

Importa desde `craft-kit` o `craft-kit/binary`.

| Export | Descripción |
| --- | --- |
| `ByteBuffer` | Buffer binario creciente con cursor de lectura/escritura y endianness: `writeUint8`…`writeBigInt64`, `writeBytes`, `writeString`, sus `read*`, `position`, `length`, `toUint8Array`. |
| `bytes` | Helpers de bytes: `fromHex`/`toHex`, `fromBase64`/`toBase64`, `fromUtf8`/`toUtf8`, `concat`, `equals`, `compare`, `xor`. |
| `BitSet` | Conjunto de bits compacto y creciente: `set`, `clear`, `toggle`, `get`/`test`, `count`, `and`/`or`/`xor`, `toArray`. |
| `bits` | Helpers bit a bit de 32 bits: `popcount`, `leadingZeros`, `trailingZeros`, `setBit`/`clearBit`/`toggleBit`/`testBit`, `rotateLeft`/`rotateRight`, `toBinaryString`/`parseBinary`, `isPowerOfTwo`, `nextPowerOfTwo`. |

## Streams

Helpers sobre Web Streams (`ReadableStream`/`TransformStream`; Node 18+ o navegador). Importa desde `craft-kit` o `craft-kit/streams`.

Métodos de `streams`: `fromIterable`, `toArray`, `toAsyncIterable`, `map`, `filter`, `take`, `forEach`, `reduce`, `text`, `fromString`, `mapTransform`.

## Común

| Export | Descripción |
| --- | --- |
| `Comparator<T>` / `AsyncComparator<T>` | Tipos de función comparadora. |
| `naturalOrder` / `reverseOrder` / `numberComparator` / `stringComparator` | Comparadores integrados. |
| `reversed` / `comparing` / `thenComparing` | Combinadores de comparadores. |
| `MaybePromise<T>` | Tipo `T \| Promise<T>`. |
| `UtilsRegistry<K,T>` | Registro genérico con nombre (patrón Strategy/Registry). |
| `VERSION` | Versión de la librería. |
