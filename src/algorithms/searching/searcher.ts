import { type Comparator, naturalOrder } from "../../common/comparator";
import { UtilsRegistry } from "../../common/registry";
import { binarySearch } from "./binary-search";
import { linearSearch } from "./linear-search";
import { jumpSearch } from "./jump-search";
import { interpolationSearch } from "./interpolation-search";

export type SearchAlgorithm = "binary" | "linear" | "jump" | "interpolation";

type AnySearch = (
  arr: readonly any[],
  target: any,
  comparator?: Comparator<any>
) => number;

/**
 * Strategy-based searcher. Binary/jump/interpolation require a sorted array.
 * Register custom strategies with {@link Searcher.register}.
 */
export class Searcher {
  private readonly registry = new UtilsRegistry<string, AnySearch>();

  constructor() {
    this.registry.register("binary", binarySearch);
    this.registry.register("linear", (arr, target, comparator) =>
      linearSearch(
        arr,
        target,
        comparator ? (a, b) => comparator(a, b) === 0 : undefined
      )
    );
    this.registry.register("jump", jumpSearch);
    this.registry.register("interpolation", (arr, target) =>
      interpolationSearch(arr as readonly number[], target as number)
    );
  }

  register(name: string, strategy: AnySearch): this {
    this.registry.register(name, strategy);
    return this;
  }

  /** Returns the index of target or -1. */
  search<T>(
    algorithm: SearchAlgorithm | string,
    arr: readonly T[],
    target: T,
    comparator: Comparator<T> = naturalOrder
  ): number {
    return this.registry.get(algorithm)(arr, target, comparator);
  }

  available(): string[] {
    return [...this.registry.getAll().keys()];
  }
}

/** Ready-to-use shared searcher instance. */
export const searcher = new Searcher();
