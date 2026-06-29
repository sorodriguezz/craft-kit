import { type Comparator, naturalOrder } from "../../common/comparator";
import { UtilsRegistry } from "../../common/registry";
import { bubbleSort } from "./bubble-sort";
import { selectionSort } from "./selection-sort";
import { insertionSort } from "./insertion-sort";
import { quickSort } from "./quick-sort";
import { mergeSort } from "./merge-sort";
import { heapSort } from "./heap-sort";
import { countingSort } from "./counting-sort";
import { radixSort } from "./radix-sort";
import { shellSort } from "./shell-sort";
import { bucketSort } from "./bucket-sort";

export type SortAlgorithm =
  | "bubble"
  | "selection"
  | "insertion"
  | "quick"
  | "merge"
  | "heap"
  | "counting"
  | "radix"
  | "shell"
  | "bucket";

/** Internal registry signature: comparator-aware, returns a sorted copy. */
type AnySort = (arr: readonly any[], comparator?: Comparator<any>) => any[];

/**
 * Strategy-based sorter. Built-in algorithms are pre-registered; register your
 * own with {@link Sorter.register}. Comparator is ignored by the numeric
 * distribution sorts (counting, radix, bucket).
 */
export class Sorter {
  private readonly registry = new UtilsRegistry<string, AnySort>();

  constructor() {
    this.registry.register("bubble", bubbleSort);
    this.registry.register("selection", selectionSort);
    this.registry.register("insertion", insertionSort);
    this.registry.register("quick", quickSort);
    this.registry.register("merge", mergeSort);
    this.registry.register("heap", heapSort);
    this.registry.register("counting", countingSort);
    this.registry.register("radix", radixSort);
    this.registry.register("shell", shellSort);
    this.registry.register("bucket", (arr) => bucketSort(arr as readonly number[]));
  }

  /** Registers (or overrides) a sorting strategy by name. */
  register(name: string, strategy: AnySort): this {
    this.registry.register(name, strategy);
    return this;
  }

  /** Sorts using the named algorithm, returning a new array. */
  sort<T>(
    algorithm: SortAlgorithm | string,
    arr: readonly T[],
    comparator: Comparator<T> = naturalOrder
  ): T[] {
    return this.registry.get(algorithm)(arr, comparator) as T[];
  }

  /** Names of all registered algorithms. */
  available(): string[] {
    return [...this.registry.getAll().keys()];
  }
}

/** Ready-to-use shared sorter instance. */
export const sorter = new Sorter();
