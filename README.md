# craft-kit

[![npm version](https://img.shields.io/npm/v/craft-kit.svg)](https://www.npmjs.com/package/craft-kit)
[![license](https://img.shields.io/npm/l/craft-kit.svg)](./LICENSE)
[![types](https://img.shields.io/npm/types/craft-kit.svg)](https://www.npmjs.com/package/craft-kit)

Kit de utilidades para **JavaScript y TypeScript**: estructuras de datos, algoritmos (ordenamiento, búsqueda, programación dinámica, backtracking), utilidades de estilo Java (`Optional`, `Stream`, *atomics*, *collections*), variantes asíncronas y helpers de seguridad (contraseñas, hashing, PBKDF2).

- Funciona en **Node, navegador (con bundler), Express, NestJS, Vite**, etc.
- **ESM y CommonJS**: `import` y `require` funcionan sin configuración.
- **Tipos incluidos** (`.d.ts`), todo genérico.
- **Cero dependencias** y *tree-shakeable* (importa solo lo que uses).

## 📦 Instalación

```bash
npm install craft-kit
```

```bash
yarn add craft-kit
```

```bash
pnpm add craft-kit
```

## 🚀 Importar

```ts
// TypeScript / ESM
import { quickSort, Optional, Stream, HashMap, generatePassword } from "craft-kit";
```

```js
// CommonJS
const { quickSort, Optional, Stream, HashMap, generatePassword } = require("craft-kit");
```

Gracias al *tree-shaking*, importar solo lo que usas mantiene tu bundle pequeño.

## 🧱 Estructuras de datos

Todas son genéricas e iterables (`for...of`, *spread*, etc.).

```ts
import { Stack, Queue, Deque, PriorityQueue, BinarySearchTree, HashTable } from "craft-kit";

const stack = new Stack<number>();
stack.push(1).push(2).push(3);
stack.pop();          // 3
stack.peek();         // 2
[...stack];           // [2, 1]  (de tope a base)

const queue = new Queue<string>();
queue.enqueue("a").enqueue("b");
queue.dequeue();      // "a"  (FIFO)

const deque = new Deque<number>();
deque.addFirst(1); deque.addLast(2);
deque.peekFirst();    // 1
deque.peekLast();     // 2

// Cola de prioridad con comparador (menor prioridad primero)
const pq = new PriorityQueue<{ name: string; p: number }>((a, b) => a.p - b.p);
pq.enqueue({ name: "low", p: 5 }).enqueue({ name: "high", p: 1 });
pq.dequeue();         // { name: "high", p: 1 }

const bst = new BinarySearchTree<number>();
[5, 3, 8, 1].forEach((v) => bst.insert(v));
bst.inOrder();        // [1, 3, 5, 8]
bst.contains(8);      // true

const table = new HashTable<string, number>();
table.set("edad", 30);
table.get("edad");    // 30
table.has("edad");    // true
```

Disponibles: `Stack`, `Queue`, `Deque`, `SinglyLinkedList`, `DoublyLinkedList`, `HashTable`, `BinarySearchTree`, `BinaryHeap`, `MinHeap`, `MaxHeap`, `PriorityQueue`. También `StructureFactory` para crearlas desde un único punto:

```ts
import { StructureFactory } from "craft-kit";
const s = StructureFactory.stack<number>();
const h = StructureFactory.minHeap<number>();
```

## 🧮 Algoritmos

### Ordenamiento

Todos devuelven un **nuevo arreglo** (no modifican la entrada). Los genéricos aceptan un `Comparator` opcional.

```ts
import { quickSort, mergeSort, reverseOrder, comparing } from "craft-kit";

quickSort([5, 3, 8, 1]);                  // [1, 3, 5, 8]
mergeSort([5, 3, 8, 1], reverseOrder);    // [8, 5, 3, 1]

// Ordenar objetos por un campo
const users = [{ name: "Ana", age: 30 }, { name: "Leo", age: 22 }];
mergeSort(users, comparing((u) => u.age)); // Leo, Ana
```

Genéricos: `bubbleSort`, `selectionSort`, `insertionSort`, `quickSort`, `mergeSort`, `heapSort`, `shellSort`. Numéricos: `countingSort`, `radixSort`, `bucketSort`.

También puedes elegir el algoritmo por nombre:

```ts
import { sorter } from "craft-kit";
sorter.sort("quick", [9, 2, 7, 1]);       // [1, 2, 7, 9]
sorter.available();                       // ["bubble", "selection", ..., "bucket"]
```

### Búsqueda

Devuelven el índice encontrado o `-1`.

```ts
import { binarySearch, linearSearch, jumpSearch, interpolationSearch } from "craft-kit";

binarySearch([1, 2, 3, 4, 5], 4);         // 3   (arreglo ordenado)
linearSearch(["a", "b", "c"], "c");       // 2
jumpSearch([1, 2, 3, 4, 5, 6], 5);        // 4   (arreglo ordenado)
interpolationSearch([1, 2, 3, 4, 5], 3);  // 2   (numérico ordenado)
```

### Programación dinámica

```ts
import { fibonacci, fibonacciBig, knapsack01, longestCommonSubsequence } from "craft-kit";

fibonacci(10);                            // 55
fibonacciBig(100);                        // 354224848179261915075n
knapsack01([1, 2, 3], [6, 10, 12], 5);    // { maxValue: 22, selectedIndices: [1, 2] }
longestCommonSubsequence("ABCBDAB", "BDCAB"); // { length: 4, sequence: [...] }
```

### Backtracking

```ts
import { solveNQueens, countNQueens, solveSudoku, solveMaze } from "craft-kit";

countNQueens(8);                          // 92
solveNQueens(4);                          // [[1,3,0,2], [2,0,3,1]]

solveSudoku(board);                       // tablero resuelto (copia) o null   (0 = vacío)

const grid = [[0,1,0,0],[0,1,0,1],[0,0,0,1],[1,1,0,0]];
solveMaze(grid, [0, 0], [3, 3]);          // [[0,0], ...] o null   (0 = libre, ≠0 = muro)
```

## ☕ Utilidades estilo Java

### Optional

Evita `null`/`undefined` sueltos.

```ts
import { Optional } from "craft-kit";

Optional.of(5).map((x) => x * 2).get();           // 10
Optional.ofNullable(null).orElse(42);             // 42
Optional.of(4).filter((x) => x > 10).isEmpty();   // true

const name = Optional.ofNullable(user.name).orElseGet(() => "invitado");
```

### Stream (perezoso)

Pipeline encadenable y *lazy* (no crea arreglos intermedios).

```ts
import { Stream } from "craft-kit";

Stream.range(1, 11).filter((n) => n % 2 === 0).map((n) => n * n).toArray();
// [4, 16, 36, 64, 100]

Stream.of(3, 1, 2, 3, 1).distinct().sorted().toArray();   // [1, 2, 3]
Stream.iterate(1, (x) => x * 2).limit(5).toArray();       // [1, 2, 4, 8, 16]
Stream.of(1, 2, 3, 4).reduce(0, (a, b) => a + b);         // 10
```

### Atomics

API equivalente a `AtomicInteger` / `AtomicLong` / `AtomicBoolean` / `AtomicReference`.

```ts
import { AtomicInteger } from "craft-kit";

const counter = new AtomicInteger(0);
counter.incrementAndGet();                // 1
counter.addAndGet(5);                     // 6
counter.compareAndSet(6, 10);             // true
```

### Collections

```ts
import { ArrayList, HashMap, TreeMap, HashSet, TreeSet } from "craft-kit";

const list = new ArrayList<number>([1, 2, 3]);
list.add(4);
list.get(0);                              // 1

const map = new HashMap<string, number>();
map.put("a", 1);
map.getOrDefault("z", 99);                // 99
map.computeIfAbsent("b", () => 2);        // 2

const sorted = new TreeMap<number, string>();
[[3, "c"], [1, "a"], [2, "b"]].forEach(([k, v]) => sorted.put(k as number, v as string));
sorted.keySet();                          // [1, 2, 3]   (ordenado)
sorted.floorKey(2);                       // 2

new HashSet([1, 1, 2, 3, 3]).size;        // 3
new TreeSet<number>(undefined, [5, 1, 3]).toArray(); // [1, 3, 5]
```

Disponibles: `ArrayList`, `LinkedList`, `HashMap`, `LinkedHashMap`, `TreeMap`, `HashSet`, `LinkedHashSet`, `TreeSet`.

## ⚡ Async y generadores

Para transformaciones que llaman a funciones asíncronas (HTTP, base de datos, archivos) o para procesar secuencias grandes sin reservar memoria intermedia.

### AsyncStream

Cada callback puede devolver un valor o una `Promise`; las operaciones finales devuelven una `Promise`.

```ts
import { AsyncStream } from "craft-kit";

const activos = await AsyncStream.from(ids)
  .map(async (id) => fetch(`/api/users/${id}`).then((r) => r.json()))
  .filter(async (u) => u.active)
  .toArray();

// mapParallel: ejecuta hasta N callbacks a la vez, MANTENIENDO el orden
const datos = await AsyncStream.from(ids)
  .mapParallel((id) => cargarUsuario(id), 4)   // 4 en paralelo
  .toArray();
```

### iter (generadores perezosos)

Funciones generadoras componibles que evalúan solo lo necesario.

```ts
import { iter } from "craft-kit";

// Aunque el rango sea de 1 millón, solo evalúa los primeros 5 pares:
iter.toArray(
  iter.take(iter.filter(iter.range(0, 1_000_000), (n) => n % 2 === 0), 5)
); // [0, 2, 4, 6, 8]

[...iter.zip([1, 2, 3], ["a", "b", "c"])];   // [[1,"a"],[2,"b"],[3,"c"]]
[...iter.chunk([1, 2, 3, 4, 5], 2)];          // [[1,2],[3,4],[5]]
```

Incluye: `range`, `map`, `filter`, `take`, `drop`, `takeWhile`, `dropWhile`, `distinct`, `enumerate`, `zip`, `chunk`, `windows`, `flatten`, `concat`, `repeat`, `tap` y terminales `toArray`, `reduce`, `count`, `forEach`, `find`.

### Ordenamiento / búsqueda / Optional async

```ts
import { sortAsync, binarySearchAsync, linearSearchAsync, Optional } from "craft-kit";

await sortAsync(items, async (a, b) => (await score(a)) - (await score(b)));
await binarySearchAsync(ordenados, objetivo, async (a, b) => a - b);
await linearSearchAsync(items, async (x) => await existeEnDB(x));

await Optional.of(userId).mapAsync((id) => loadUser(id));    // Promise<Optional<User>>
await Optional.ofNullable(cache).orElseGetAsync(() => loadFromDB());
```

## 🔐 Seguridad

```ts
import { generatePassword, hashPassword, verifyPassword, sha256, hmac } from "craft-kit";

generatePassword({ length: 16, useSymbols: true, excludeSimilar: true });

// Guardar contraseñas (PBKDF2 con salt aleatorio)
const stored = hashPassword("s3cret");    // { hash, salt, iterations, keylen, digest }
verifyPassword("s3cret", stored);         // true  (comparación en tiempo constante)

sha256("hola");                           // hash hex
hmac("payload", "secret-key");            // HMAC-SHA256
```

También: `pbkdf2`, `passwordStrength`, `sha512`, `md5`, `randomToken`, `uuid`.

## 🧩 Extender con tus propias estrategias

```ts
import { Sorter, type Comparator } from "craft-kit";

const sorter = new Sorter();
sorter.register("miSort", <T>(arr: readonly T[], cmp?: Comparator<T>) => {
  const a = [...arr];
  // ...tu implementación...
  return a;
});

sorter.sort("miSort", [3, 1, 2]);
```

## ✅ Compatibilidad

- Node.js 16+.
- ESM (`import`) y CommonJS (`require`).
- Navegador a través de cualquier bundler (Vite, webpack, esbuild, Rollup).
- TypeScript con tipos incluidos (no necesitas instalar `@types`).

## 📜 Licencia

MIT.
