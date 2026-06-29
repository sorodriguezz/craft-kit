import { Bench } from "tinybench";
import { quickSort, mergeSort, heapSort } from "../dist/index.js";

const data = Array.from({ length: 2000 }, () => Math.floor(Math.random() * 10000));
const bench = new Bench({ time: 300 });

bench
  .add("quickSort", () => quickSort(data))
  .add("mergeSort", () => mergeSort(data))
  .add("heapSort", () => heapSort(data))
  .add("native sort", () => [...data].sort((a, b) => a - b));

await bench.run();
console.table(bench.table());
