import { describe, it, expect } from "vitest";
import {
  Optional, Stream, Collectors, Gatherers, LazyConstant, AsyncStream,
  ArrayList, HashMap, TreeMap, TreeSet, MultiMap, MultiSet, BiMap, EnumMap, EnumSet,
  AtomicInteger, AtomicLong,
} from "../src/index";

describe("Optional & Stream", () => {
  it("optional", () => {
    expect(Optional.of(5).map((x) => x * 2).get()).toBe(10);
    expect(Optional.ofNullable<number>(null).orElse(42)).toBe(42);
  });
  it("stream core + modern", () => {
    expect(Stream.range(1, 6).filter((n) => n % 2 === 1).map((n) => n * n).toArray()).toEqual([1, 9, 25]);
    expect(Object.isFrozen(Stream.of(1).toList())).toBe(true);
    expect(Stream.of(1, 2, 3, 4).mapMulti<number>((n, push) => { if (n % 2 === 0) { push(n); push(n * 10); } }).toArray()).toEqual([2, 20, 4, 40]);
    expect(Stream.of(1, 2, 3, 4, 5).gather(Gatherers.windowFixed(2)).toArray()).toEqual([[1, 2], [3, 4], [5]]);
    expect(Stream.of(1, 2, 3).gather(Gatherers.scan(() => 0, (a, b) => a + b)).toArray()).toEqual([1, 3, 6]);
  });
  it("collectors", () => {
    expect(Stream.of(10, 20, 30).collect(Collectors.teeing(Collectors.summing<number>((x) => x), Collectors.counting<number>(), (s, c) => s / c))).toBe(20);
    const g = Stream.of(1, 2, 3, 4).collect(Collectors.groupingBy((n) => (n % 2 === 0 ? "e" : "o")));
    expect(g.get("e")).toEqual([2, 4]);
  });
});

describe("AsyncStream", () => {
  it("map/filter/mapParallel", async () => {
    expect(await AsyncStream.from([1, 2, 3, 4]).filter(async (n) => n % 2 === 0).map(async (n) => n * n).toArray()).toEqual([4, 16]);
    expect(await AsyncStream.from([1, 2, 3]).mapParallel(async (x) => x * 2, 2).toArray()).toEqual([2, 4, 6]);
  });
  it("mapMulti/gather", async () => {
    expect(await AsyncStream.of(1, 2, 3, 4).mapMulti<number>((n, push) => { if (n % 2 === 0) push(n); }).toArray()).toEqual([2, 4]);
    expect(await AsyncStream.of(1, 2, 3, 4, 5).gather(Gatherers.limit(2)).toArray()).toEqual([1, 2]);
  });
});

describe("collections", () => {
  it("list/map/set", () => {
    const al = new ArrayList<number>([1, 2]); al.addFirst(0); al.addLast(3);
    expect(al.reversed().toArray()).toEqual([3, 2, 1, 0]);
    const hm = new HashMap<string, number>(); hm.put("a", 1);
    expect(hm.getOrDefault("z", 9)).toBe(9);
    const tm = new TreeMap<number, string>(); [[3, "c"], [1, "a"], [2, "b"]].forEach(([k, v]) => tm.put(k as number, v as string));
    expect(tm.keySet()).toEqual([1, 2, 3]);
    expect(new TreeSet<number>(undefined, [5, 1, 3]).toArray()).toEqual([1, 3, 5]);
  });
  it("multimap/multiset/bimap/enum", () => {
    const mm = new MultiMap<string, number>(); mm.put("a", 1).put("a", 2);
    expect(mm.get("a")).toEqual([1, 2]);
    const ms = new MultiSet<string>(); ms.add("x", 3).add("y");
    expect(ms.mostCommon(1)).toEqual([["x", 3]]);
    const bm = new BiMap<string, number>(); bm.set("a", 1);
    expect(bm.getKey(1)).toBe("a");
    expect(EnumSet.of("A", "B", "A").size).toBe(2);
    const em = new EnumMap<string, number>(); em.set("X", 1); expect(em.get("X")).toBe(1);
  });
});

describe("atomics & LazyConstant", () => {
  it("atomics", () => {
    const ai = new AtomicInteger(5);
    expect(ai.compareAndExchange(5, 10)).toBe(5);
    expect(ai.accumulateAndGet(5, (c, g) => c + g)).toBe(15);
    expect(new AtomicLong(1n).incrementAndGet()).toBe(2n);
  });
  it("lazy constant computes once", () => {
    let n = 0; const lc = LazyConstant.of(() => { n++; return 7; });
    expect([lc.get(), lc.get(), n]).toEqual([7, 7, 1]);
  });
});
