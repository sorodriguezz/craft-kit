interface TrieNode {
  readonly children: Map<string, TrieNode>;
  isWord: boolean;
}

function createNode(): TrieNode {
  return { children: new Map<string, TrieNode>(), isWord: false };
}

/**
 * Prefix tree (trie) for storing and querying a set of strings, with efficient
 * prefix lookups. Stores each word once; duplicate inserts are no-ops.
 */
export class Trie {
  private readonly root: TrieNode = createNode();
  private count = 0;

  /** Inserts `word`. Inserting an existing word leaves the trie unchanged. */
  insert(word: string): this {
    let node = this.root;
    for (const char of word) {
      let next = node.children.get(char);
      if (!next) {
        next = createNode();
        node.children.set(char, next);
      }
      node = next;
    }
    if (!node.isWord) {
      node.isWord = true;
      this.count++;
    }
    return this;
  }

  /** Returns true if the exact `word` was inserted. */
  has(word: string): boolean {
    const node = this.findNode(word);
    return node !== undefined && node.isWord;
  }

  /** Returns true if any stored word starts with `prefix`. */
  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== undefined;
  }

  /** Removes `word`. Returns true if it existed and was removed. */
  remove(word: string): boolean {
    const path: Array<{ parent: TrieNode; char: string; child: TrieNode }> = [];
    let node = this.root;
    for (const char of word) {
      const next = node.children.get(char);
      if (!next) return false;
      path.push({ parent: node, char, child: next });
      node = next;
    }
    if (!node.isWord) return false;

    node.isWord = false;
    this.count--;

    // Prune now-empty, non-terminal nodes from the leaf upward.
    for (let i = path.length - 1; i >= 0; i--) {
      const step = path[i];
      if (step.child.isWord || step.child.children.size > 0) {
        break;
      }
      step.parent.children.delete(step.char);
    }
    return true;
  }

  /** Returns all stored words beginning with `prefix`, in DFS order. */
  wordsWithPrefix(prefix: string): string[] {
    const start = this.findNode(prefix);
    if (!start) return [];
    const results: string[] = [];
    this.collect(start, prefix, results);
    return results;
  }

  /** Number of distinct words stored. */
  get size(): number {
    return this.count;
  }

  /** Removes every word. */
  clear(): void {
    this.root.children.clear();
    this.root.isWord = false;
    this.count = 0;
  }

  private findNode(key: string): TrieNode | undefined {
    let node = this.root;
    for (const char of key) {
      const next = node.children.get(char);
      if (!next) return undefined;
      node = next;
    }
    return node;
  }

  private collect(node: TrieNode, prefix: string, out: string[]): void {
    if (node.isWord) {
      out.push(prefix);
    }
    for (const [char, child] of node.children) {
      this.collect(child, prefix + char, out);
    }
  }
}
