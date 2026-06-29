# craft-kit

[![npm version](https://img.shields.io/npm/v/craft-kit.svg)](https://www.npmjs.com/package/craft-kit)
[![license](https://img.shields.io/npm/l/craft-kit.svg)](./LICENSE)
[![types](https://img.shields.io/npm/types/craft-kit.svg)](https://www.npmjs.com/package/craft-kit)

**craft-kit** es un kit de utilidades para **JavaScript y TypeScript nativo**: estructuras de datos, algoritmos (ordenamiento, búsqueda, programación dinámica, backtracking), utilidades de estilo Java (`Optional`, `Stream`, *atomics*, *collections*) y helpers de seguridad (generación de contraseñas, hashing, PBKDF2).

- ✅ **Agnóstico de frameworks** — funciona en Node, navegadores con bundler, Express, NestJS, Vite, etc.
- ✅ **Dual ESM + CommonJS** — `import` y `require` funcionan out of the box.
- ✅ **Tipado completo** — `.d.ts` incluidos, todo genérico.
- ✅ **Cero dependencias de runtime** y *tree-shakeable*.
- ✅ **Patrones de diseño** (Strategy, Registry, Facade, Factory, Iterator) para extenderlo sin tocar el core.
- ✅ **Variantes async y generadores** — `AsyncStream`, sort/search con callbacks que devuelven `Promise`, y helpers `iter` perezosos con `yield`.

> ⚠️ **Cambio importante en la v2:** craft-kit ya **no depende de NestJS**. La API anterior basada en `@nestjs/common` (módulos, `@Injectable`, `PasswordFacade` por DI) fue reemplazada por una API agnóstica de funciones y clases. Revisa los ejemplos de abajo para migrar.

## 📦 Instalación

```bash
npm install craft-kit
# o
yarn add craft-kit
# o
pnpm add craft-kit
```

Requisitos: Node.js 16+.

## 🚀 Uso rápido

```ts
// ESM / TypeScript
import { quickSort, Optional, Stream, generatePassword } from "craft-kit";
```

```js
// CommonJS
const { quickSort, Optional, Stream, generatePassword } = require("craft-kit");
```

```ts
quickSort([5, 3, 8, 1]);                 // [1, 3, 5, 8]
Optional.ofNullable(null).orElse(42);    // 42
Stream.range(1, 11).filter(n => n % 2 === 0).map(n => n * n).toArray(); // [4,16,36,64,100]
generatePassword({ length: 20, useSymbols: true });
```

## 🧱 Estructuras de datos

Todas las estructuras son genéricas e iterables (`for...of`, *spread*, etc.).

| Clase | Descripción |
| --- | --- |
| `Stack<T>` | Pila LIFO |
| `Queue<T>` | Cola FIFO (O(1)) |
| `Deque<T>` | Cola doblemente terminada |
| `SinglyLinkedList<T>` | Lista enlazada simple |
| `DoublyLinkedList<T>` | Lista doblemente enlazada (lista + deque) |
| `HashTable<K,V>` | Tabla hash con *separate chaining* y *resize* |
| `BinarySearchTree<T>` | Árbol binario de búsqueda |
| `BinaryHeap<T>` / `MinHeap<T>` / `MaxHeap<T>` | Heaps binarios |
| `PriorityQueue<T>` | Cola de prioridad |
| `StructureFactory` | Factory para crear cualquier estructura |

```ts
import { Stack, PriorityQueue, BinarySearchTree, StructureFactory } from "craft-kit";

const stack = new Stack<number>();
stack.push(1).push(2).push(3);
stack.pop();          // 3
[...stack];           // itera de tope a base

const pq = new PriorityQueue<{ name: string; p: number }>((a, b) => a.p - b.p);
pq.enqueue({ name: "low", p: 5 }).enqueue({ name: "high", p: 1 });
pq.dequeue();         // { name: "high", p: 1 }

const bst = new BinarySearchTree<number>();
[5, 3, 8, 1].forEach(v => bst.insert(v));
bst.inOrder();        // [1, 3, 5, 8]

const queue = StructureFactory.queue<string>(); // Factory pattern
```

## 🧮 Algoritmos

### Ordenamiento (10)

`bubbleSort`, `selectionSort`, `insertionSort`, `quickSort`, `mergeSort`, `heapSort`, `shellSort` (genéricos, aceptan `Comparator`), `countingSort`, `radixSort`, `bucketSort` (numéricos).

Todos devuelven un **nuevo arreglo** (no mutan la entrada).

```ts
import { mergeSort, reverseOrder, sorter } from "craft-kit";

mergeSort([5, 3, 8, 1]);                 // [1, 3, 5, 8]
mergeSort([5, 3, 8, 1], reverseOrder);   // [8, 5, 3, 1]

// Facade con Strategy + Registry:
sorter.sort("quick", [9, 2, 7, 1]);      // [1, 2, 7, 9]
sorter.available();                      // ["bubble", ..., "bucket"]
```

### Búsqueda (4)

`binarySearch`, `linearSearch`, `jumpSearch`, `interpolationSearch` — devuelven el índice o `-1`.

```ts
import { binarySearch, searcher } from "craft-kit";

binarySearch([1, 2, 3, 4, 5], 4);        // 3
searcher.search("binary", [10, 20, 30], 20); // 1
```

### Programación dinámica (3)

```ts
import { fibonacci, fibonacciBig, knapsack01, longestCommonSubsequence } from "craft-kit";

fibonacci(10);                           // 55
fibonacciBig(100);                       // 354224848179261915075n
knapsack01([1, 2, 3], [6, 10, 12], 5);   // { maxValue: 22, selectedIndices: [1, 2] }
longestCommonSubsequence("ABCBDAB", "BDCAB"); // { length: 4, sequence: [...] }
```

### Backtracking (3)

```ts
import { solveNQueens, countNQueens, solveSudoku, solveMaze } from "craft-kit";

countNQueens(8);                         // 92
solveSudoku(board);                      // tablero resuelto (copia) o null
solveMaze(grid, [0, 0], [3, 3]);         // camino [[r,c], ...] o null  (0 = libre)
```

## ☕ Utilidades estilo Java

### Optional

```ts
import { Optional } from "craft-kit";

Optional.of(5).map(x => x * 2).get();             // 10
Optional.ofNullable(null).orElse(42);             // 42
Optional.of(4).filter(x => x > 10).isEmpty();     // true
```

### Stream (perezoso / lazy)

```ts
import { Stream } from "craft-kit";

Stream.of(3, 1, 2, 3, 1).distinct().sorted().toArray();   // [1, 2, 3]
Stream.iterate(1, x => x * 2).limit(5).toArray();         // [1, 2, 4, 8, 16]
Stream.range(1, 100).filter(x => x % 3 === 0).reduce(0, (a, b) => a + b);
```

### Atomics

API equivalente a `AtomicInteger` / `AtomicLong` / `AtomicBoolean` / `AtomicReference` (semántica lógica; JS es de un solo hilo).

```ts
import { AtomicInteger } from "craft-kit";

const counter = new AtomicInteger(0);
counter.incrementAndGet();               // 1
counter.compareAndSet(1, 10);            // true
```

### Collections

`ArrayList`, `LinkedList`, `HashMap`, `LinkedHashMap`, `TreeMap`, `HashSet`, `LinkedHashSet`, `TreeSet`.

```ts
import { HashMap, TreeMap, TreeSet } from "craft-kit";

const map = new HashMap<string, number>();
map.put("a", 1);
map.getOrDefault("z", 99);               // 99
map.computeIfAbsent("b", () => 2);       // 2

const tree = new TreeMap<number, string>();
[[3, "c"], [1, "a"], [2, "b"]].forEach(([k, v]) => tree.put(k as number, v as string));
tree.keySet();                           // [1, 2, 3]
tree.floorKey(2);                        // 2

new TreeSet<number>(undefined, [5, 1, 3, 1]).toArray(); // [1, 3, 5]
```

## ⚡ Async y generadores (rendimiento)

A veces tus transformaciones llaman a funciones asíncronas (HTTP, base de datos, archivos) o un comparador necesita esperar un resultado. Para esos casos hay variantes `async`, y para procesar grandes secuencias sin reservar arreglos intermedios hay helpers basados en generadores (`yield`).

> El `Stream` síncrono ya es perezoso: cada operación intermedia es un generador, así que no crea arreglos intermedios.

### iter — generadores perezosos

`iter` es un conjunto de funciones generadoras componibles. No reservan memoria intermedia, así que sirven incluso para secuencias enormes o infinitas.

```ts
import { iter } from "craft-kit";

// Solo evalúa lo necesario (lazy) aunque el rango sea de 1 millón:
const primeros5Pares = iter.toArray(
  iter.take(iter.filter(iter.range(0, 1_000_000), n => n % 2 === 0), 5)
); // [0, 2, 4, 6, 8]

[...iter.zip([1, 2, 3], ["a", "b", "c"])];   // [[1,"a"],[2,"b"],[3,"c"]]
[...iter.chunk([1, 2, 3, 4, 5], 2)];          // [[1,2],[3,4],[5]]
[...iter.windows([1, 2, 3, 4], 2)];           // [[1,2],[2,3],[3,4]]
```

Incluye: `range`, `map`, `filter`, `take`, `drop`, `takeWhile`, `dropWhile`, `distinct`, `enumerate`, `zip`, `chunk`, `windows`, `flatten`, `concat`, `repeat`, `tap` y terminales `toArray`, `reduce`, `count`, `forEach`, `find`.

### AsyncStream

Pipeline perezoso sobre datos asíncronos (o síncronos). Cada callback puede devolver un valor o una `Promise`; las operaciones terminales devuelven una `Promise`.

```ts
import { AsyncStream } from "craft-kit";

const ids = [1, 2, 3, 4, 5];

const usuarios = await AsyncStream.from(ids)
  .map(async id => fetch(`/api/users/${id}`).then(r => r.json()))
  .filter(async u => u.active)
  .toArray();

// mapParallel: ejecuta hasta N callbacks async a la vez, manteniendo el orden.
const resultados = await AsyncStream.from(ids)
  .mapParallel(id => fetchUsuario(id), 4) // 4 en paralelo
  .toArray();
```

### Ordenamiento / búsqueda async

Cuando comparar o evaluar requiere trabajo asíncrono:

```ts
import { sortAsync, binarySearchAsync, linearSearchAsync } from "craft-kit";

await sortAsync(items, async (a, b) => (await score(a)) - (await score(b)));
await binarySearchAsync(ordenados, objetivo, async (a, b) => a - b);
await linearSearchAsync(items, async x => await existeEnDB(x));
```

### Optional async

```ts
import { Optional } from "craft-kit";

await Optional.of(userId).mapAsync(id => loadUser(id));      // Promise<Optional<User>>
await Optional.ofNullable(cached).orElseGetAsync(() => loadFromDB());
```

## 🔐 Seguridad

```ts
import { generatePassword, hashPassword, verifyPassword, sha256, hmac } from "craft-kit";

generatePassword({ length: 16, useSymbols: true, excludeSimilar: true });

const stored = hashPassword("s3cret");   // { hash, salt, iterations, keylen, digest } (PBKDF2)
verifyPassword("s3cret", stored);        // true  (comparación en tiempo constante)

sha256("hola");                          // hash hex
hmac("payload", "secret-key");           // HMAC-SHA256
```

## 🧩 Patrones de diseño y arquitectura

El código se organiza por **dominio**, y cada dominio aplica patrones que permiten **agregar funcionalidades sin modificar el core**:

```
src/
├─ common/        # Comparator, UtilsRegistry (Registry), tipos e iter (generadores)
├─ security/      # passwords + hashing (funciones puras + PasswordGenerator)
├─ structures/    # estructuras de datos (Iterator + Template Method + Factory)
├─ algorithms/
│  ├─ sorting/    # 10 algoritmos + async + Sorter (Strategy + Registry + Facade)
│  ├─ searching/  # 4 algoritmos + async + Searcher (Strategy + Registry + Facade)
│  ├─ dynamic-programming/
│  └─ backtracking/
└─ java/
   ├─ optional.ts      # + variantes async (mapAsync, flatMapAsync, ...)
   ├─ stream.ts        # pipeline perezoso síncrono (Builder)
   ├─ async-stream.ts  # pipeline asíncrono (async generators)
   ├─ atomic/
   └─ collections/
```

- **Strategy + Registry + Facade:** `Sorter` y `Searcher` registran cada algoritmo por nombre.
- **Factory:** `StructureFactory` crea cualquier estructura desde un único punto.
- **Iterator:** todas las estructuras implementan `Symbol.iterator`.
- **Template Method:** `BinaryHeap` define la estructura; `MinHeap` / `MaxHeap` la especializan.

### Extender la librería

```ts
import { Sorter, type Comparator } from "craft-kit";

const sorter = new Sorter();
sorter.register("gnome", <T>(arr: readonly T[], cmp?: Comparator<T>) => {
  const a = [...arr];
  // ...tu implementación...
  return a;
});

sorter.sort("gnome", [3, 1, 2]);
```

## 🛠️ Desarrollo

```bash
npm install
npm run build       # genera dist/ (ESM + CJS + tipos) con tsup
npm run typecheck   # tsc --noEmit
```

## 📤 Publicación

Al hacer push de un tag `v*` (por ejemplo `v2.0.0`), el workflow de GitHub Actions construye y publica a npm:

```bash
npm version 2.0.0   # actualiza package.json y crea el tag
git push --follow-tags
```

Requiere el secret `NPM_TOKEN` configurado en el repositorio.

## 📜 Licencia

MIT.
