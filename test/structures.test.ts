import { describe, it, expect } from "vitest";
import {
  Stack, Queue, Deque, SinglyLinkedList, DoublyLinkedList, HashTable, BinarySearchTree,
  MinHeap, MaxHeap, PriorityQueue, AVLTree, SkipList, SegmentTree, FenwickTree, LRUCache, Trie, BloomFilter, CircularBuffer, UnionFind,
} from "../src/index";

describe("linear structures", () => {
  it("stack/queue/deque", () => {
    expect(new Stack<number>().push(1).push(2).pop()).toBe(2);
    const q = new Queue<number>(); q.enqueue(1).enqueue(2);
    expect(q.dequeue()).toBe(1);
    const d = new Deque<number>(); d.addFirst(1); d.addLast(2);
    expect([d.peekFirst(), d.peekLast()]).toEqual([1, 2]);
  });
  it("linked lists", () => {
    const s = new SinglyLinkedList<number>(); s.addLast(1).addLast(2).reverse();
    expect(s.toArray()).toEqual([2, 1]);
    const d = new DoublyLinkedList<number>(); d.addLast(1).addLast(2).addLast(3);
    expect(d.reversed().toArray()).toEqual([3, 2, 1]);
  });
});

describe("trees & heaps", () => {
  it("bst & avl ordered", () => {
    const bst = new BinarySearchTree<number>(); [5, 3, 8, 1].forEach((v) => bst.insert(v));
    expect(bst.inOrder()).toEqual([1, 3, 5, 8]);
    const avl = new AVLTree<number>(); for (let i = 1; i <= 15; i++) avl.insert(i);
    expect(avl.height()).toBeLessThanOrEqual(5);
    expect(avl.inOrder()).toEqual([...Array(15)].map((_, i) => i + 1));
  });
  it("heaps & pq", () => {
    const mh = new MinHeap<number>(); [5, 1, 3].forEach((v) => mh.push(v));
    expect(mh.pop()).toBe(1);
    const xh = new MaxHeap<number>(); [5, 1, 3].forEach((v) => xh.push(v));
    expect(xh.pop()).toBe(5);
    const pq = new PriorityQueue<number>((a, b) => a - b); pq.enqueue(3).enqueue(1);
    expect(pq.dequeue()).toBe(1);
  });
});

describe("maps/sets/caches", () => {
  it("hashtable & skiplist & range structures", () => {
    const ht = new HashTable<string, number>(); for (let i = 0; i < 40; i++) ht.set("k" + i, i);
    expect(ht.get("k20")).toBe(20); expect(ht.size).toBe(40);
    const sl = new SkipList<number>(); [5, 1, 3, 2, 4].forEach((v) => sl.insert(v));
    expect(sl.toArray()).toEqual([1, 2, 3, 4, 5]);
    const seg = new SegmentTree([1, 2, 3, 4, 5]); expect(seg.query(1, 3)).toBe(9);
    const fen = new FenwickTree([1, 2, 3, 4, 5]); expect(fen.rangeSum(1, 3)).toBe(9);
  });
  it("lru / trie / bloom / circular / union-find", () => {
    const lru = new LRUCache<string, number>(2); lru.set("a", 1).set("b", 2); lru.get("a"); lru.set("c", 3);
    expect(lru.has("b")).toBe(false);
    const trie = new Trie(); trie.insert("cat").insert("car");
    expect(trie.wordsWithPrefix("ca").sort()).toEqual(["car", "cat"]);
    const bf = new BloomFilter(100); bf.add("x"); expect(bf.has("x")).toBe(true);
    const cb = new CircularBuffer<number>(2); cb.push(1); cb.push(2); expect(cb.push(3)).toBe(1);
    const uf = new UnionFind([1, 2, 3]); uf.union(1, 2); expect(uf.connected(1, 2)).toBe(true);
  });
});
