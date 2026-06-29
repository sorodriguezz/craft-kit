import { type Comparator, naturalOrder } from "../common/comparator";
import { Stack } from "./stack";
import { Queue } from "./queue";
import { Deque } from "./deque";
import { SinglyLinkedList } from "./singly-linked-list";
import { DoublyLinkedList } from "./doubly-linked-list";
import { HashTable, type HashTableOptions } from "./hash-table";
import { BinarySearchTree } from "./binary-search-tree";
import { MinHeap, MaxHeap } from "./binary-heap";
import { PriorityQueue } from "./priority-queue";

/**
 * Factory of data structures (Factory pattern). A convenient single entry
 * point for creating any structure without importing each class.
 */
export const StructureFactory = {
  stack<T>(): Stack<T> {
    return new Stack<T>();
  },
  queue<T>(): Queue<T> {
    return new Queue<T>();
  },
  deque<T>(): Deque<T> {
    return new Deque<T>();
  },
  singlyLinkedList<T>(): SinglyLinkedList<T> {
    return new SinglyLinkedList<T>();
  },
  doublyLinkedList<T>(): DoublyLinkedList<T> {
    return new DoublyLinkedList<T>();
  },
  hashTable<K, V>(options?: HashTableOptions<K>): HashTable<K, V> {
    return new HashTable<K, V>(options);
  },
  binarySearchTree<T>(comparator: Comparator<T> = naturalOrder): BinarySearchTree<T> {
    return new BinarySearchTree<T>(comparator);
  },
  minHeap<T>(comparator: Comparator<T> = naturalOrder): MinHeap<T> {
    return new MinHeap<T>(comparator);
  },
  maxHeap<T>(comparator: Comparator<T> = naturalOrder): MaxHeap<T> {
    return new MaxHeap<T>(comparator);
  },
  priorityQueue<T>(comparator: Comparator<T> = naturalOrder): PriorityQueue<T> {
    return new PriorityQueue<T>(comparator);
  },
} as const;
