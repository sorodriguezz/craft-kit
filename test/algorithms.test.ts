import { describe, it, expect } from "vitest";
import {
  quickSort, mergeSort, heapSort, countingSort, radixSort, reverseOrder,
  binarySearch, jumpSearch, interpolationSearch,
  fibonacci, knapsack01, longestCommonSubsequence,
  countNQueens, solveSudoku, solveMaze,
  Graph, shortestPath, aStar, bellmanFord, topologicalSort, stronglyConnectedComponents, isBipartite, maxFlow, bridges,
  levenshtein, kmpSearch, fuzzyMatch, stats, convexHull, pointInPolygon, gcd, isPrime, primesUpTo, factorial,
} from "../src/index";

describe("sorting", () => {
  it("comparison sorts", () => {
    for (const s of [quickSort, mergeSort, heapSort]) expect(s([5, 3, 8, 1])).toEqual([1, 3, 5, 8]);
    expect(mergeSort([1, 2, 3], reverseOrder)).toEqual([3, 2, 1]);
  });
  it("numeric sorts", () => {
    expect(countingSort([3, -1, 2, 0])).toEqual([-1, 0, 2, 3]);
    expect(radixSort([170, 45, 75, 2])).toEqual([2, 45, 75, 170]);
  });
});

describe("searching", () => {
  it("finds indices", () => {
    expect(binarySearch([1, 2, 3, 4, 5], 4)).toBe(3);
    expect(jumpSearch([1, 2, 3, 4, 5], 5)).toBe(4);
    expect(interpolationSearch([1, 2, 3, 4, 5], 3)).toBe(2);
    expect(binarySearch([1, 2, 3], 9)).toBe(-1);
  });
});

describe("dynamic programming", () => {
  it("fibonacci / knapsack / lcs", () => {
    expect(fibonacci(10)).toBe(55);
    expect(knapsack01([1, 2, 3], [6, 10, 12], 5)).toEqual({ maxValue: 22, selectedIndices: [1, 2] });
    expect(longestCommonSubsequence("ABCBDAB", "BDCAB").length).toBe(4);
  });
});

describe("backtracking", () => {
  it("n-queens / sudoku / maze", () => {
    expect(countNQueens(8)).toBe(92);
    expect(solveMaze([[0, 1], [1, 0]], [0, 0], [1, 1])).toBeNull();
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    expect(solveSudoku(board)).not.toBeNull();
  });
});

describe("graph", () => {
  it("traversal & shortest paths", () => {
    const g = new Graph();
    g.addEdge("A", "B", 1).addEdge("B", "C", 2).addEdge("A", "C", 4);
    expect(shortestPath(g, "A", "C")).toEqual({ path: ["A", "B", "C"], distance: 3 });
    expect(aStar(g, "A", "C", () => 0)!.cost).toBe(3);
  });
  it("scc / bipartite / maxflow / bridges", () => {
    const dg = new Graph(true);
    dg.addEdge("A", "B").addEdge("B", "C").addEdge("C", "A").addNode("D");
    expect(stronglyConnectedComponents(dg).length).toBe(2);
    const fg = new Graph(true);
    fg.addEdge("S", "A", 3).addEdge("S", "B", 2).addEdge("A", "T", 2).addEdge("B", "T", 3);
    expect(maxFlow(fg, "S", "T")).toBe(4);
    const ug = new Graph(); ug.addEdge("A", "B").addEdge("B", "C");
    expect(bridges(ug).length).toBe(2);
    const tri = new Graph(); tri.addEdge("A", "B").addEdge("B", "C").addEdge("C", "A");
    expect(isBipartite(tri)).toBe(false);
  });
  it("bellmanFord / topo", () => {
    const dg = new Graph(true); dg.addEdge("A", "B", 4).addEdge("A", "C", 1).addEdge("C", "B", 2);
    expect(bellmanFord(dg, "A").distances.get("B")).toBe(3);
    expect(topologicalSort(dg)).not.toBeNull();
  });
});

describe("strings & math", () => {
  it("string algorithms", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(kmpSearch("ababcabab", "abc")).toBe(2);
    expect(fuzzyMatch("abc", "aXbXc")).toBe(true);
  });
  it("math", () => {
    expect(gcd(12, 18)).toBe(6);
    expect(isPrime(13)).toBe(true);
    expect(primesUpTo(11)).toEqual([2, 3, 5, 7, 11]);
    expect(factorial(5)).toBe(120n);
    expect(stats.median([1, 2, 3, 4])).toBe(2.5);
    expect(convexHull([[0, 0], [2, 0], [2, 2], [0, 2], [1, 1]]).length).toBe(4);
    expect(pointInPolygon([2, 2], [[0, 0], [4, 0], [4, 4], [0, 4]])).toBe(true);
  });
});
