const BITS_PER_WORD = 32;

/** Counts the set bits in a 32-bit word (Hamming weight). */
function popcount32(value: number): number {
  let v = value - ((value >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  v = (v + (v >>> 4)) & 0x0f0f0f0f;
  return (v * 0x01010101) >>> 24;
}

/**
 * Compact set of non-negative integer indices backed by a {@link Uint32Array}.
 *
 * Each bit position represents membership of the corresponding index. The
 * backing storage grows automatically as higher indices are touched, so the
 * set never needs an explicit capacity.
 *
 * @example
 * const set = new BitSet();
 * set.set(1).set(4).set(63);
 * set.get(4); // true
 * set.count(); // 3
 * set.toArray(); // [1, 4, 63]
 */
export class BitSet {
  private words: Uint32Array;

  /**
   * Creates a bit set large enough to hold the given number of bits.
   *
   * @param size - Initial bit capacity (a non-negative integer). Defaults to 0;
   * the set still grows on demand regardless of this hint.
   */
  constructor(size = 0) {
    if (!Number.isInteger(size) || size < 0) {
      throw new RangeError("size must be a non-negative integer");
    }
    const wordCount = Math.ceil(size / BITS_PER_WORD);
    this.words = new Uint32Array(wordCount);
  }

  /** Validates an index argument and returns it. */
  private checkIndex(index: number): number {
    if (!Number.isInteger(index) || index < 0) {
      throw new RangeError("index must be a non-negative integer");
    }
    return index;
  }

  /** Grows the backing array so that `wordCount` words are available. */
  private ensureWords(wordCount: number): void {
    if (wordCount <= this.words.length) {
      return;
    }
    const next = new Uint32Array(wordCount);
    next.set(this.words);
    this.words = next;
  }

  /** Number of bits the set can currently address without growing. */
  get size(): number {
    return this.words.length * BITS_PER_WORD;
  }

  /** Sets the bit at `index` to 1, growing the set if needed. */
  set(index: number): this {
    this.checkIndex(index);
    const word = Math.floor(index / BITS_PER_WORD);
    this.ensureWords(word + 1);
    this.words[word] |= 1 << (index % BITS_PER_WORD);
    return this;
  }

  /** Clears the bit at `index` to 0. */
  clear(index: number): this {
    this.checkIndex(index);
    const word = Math.floor(index / BITS_PER_WORD);
    if (word < this.words.length) {
      this.words[word] &= ~(1 << (index % BITS_PER_WORD));
    }
    return this;
  }

  /** Flips the bit at `index`, growing the set if needed. */
  toggle(index: number): this {
    this.checkIndex(index);
    const word = Math.floor(index / BITS_PER_WORD);
    this.ensureWords(word + 1);
    this.words[word] ^= 1 << (index % BITS_PER_WORD);
    return this;
  }

  /** Returns `true` when the bit at `index` is set. */
  get(index: number): boolean {
    this.checkIndex(index);
    const word = Math.floor(index / BITS_PER_WORD);
    if (word >= this.words.length) {
      return false;
    }
    return (this.words[word] & (1 << (index % BITS_PER_WORD))) !== 0;
  }

  /** Alias of {@link BitSet.get}: returns `true` when the bit is set. */
  test(index: number): boolean {
    return this.get(index);
  }

  /** Total number of set bits. */
  count(): number {
    let total = 0;
    for (let i = 0; i < this.words.length; i++) {
      total += popcount32(this.words[i]);
    }
    return total;
  }

  /** Clears every bit, leaving the set empty (capacity is retained). */
  reset(): void {
    this.words.fill(0);
  }

  /**
   * Returns a new set holding the bits present in both this set and `other`
   * (bit-wise AND). Neither operand is modified.
   */
  and(other: BitSet): BitSet {
    const length = Math.min(this.words.length, other.words.length);
    const result = new BitSet();
    result.words = new Uint32Array(length);
    for (let i = 0; i < length; i++) {
      result.words[i] = this.words[i] & other.words[i];
    }
    return result;
  }

  /**
   * Returns a new set holding the bits present in either this set or `other`
   * (bit-wise OR). Neither operand is modified.
   */
  or(other: BitSet): BitSet {
    const length = Math.max(this.words.length, other.words.length);
    const result = new BitSet();
    result.words = new Uint32Array(length);
    for (let i = 0; i < length; i++) {
      const a = i < this.words.length ? this.words[i] : 0;
      const b = i < other.words.length ? other.words[i] : 0;
      result.words[i] = a | b;
    }
    return result;
  }

  /**
   * Returns a new set holding the bits present in exactly one of this set and
   * `other` (bit-wise XOR). Neither operand is modified.
   */
  xor(other: BitSet): BitSet {
    const length = Math.max(this.words.length, other.words.length);
    const result = new BitSet();
    result.words = new Uint32Array(length);
    for (let i = 0; i < length; i++) {
      const a = i < this.words.length ? this.words[i] : 0;
      const b = i < other.words.length ? other.words[i] : 0;
      result.words[i] = a ^ b;
    }
    return result;
  }

  /** Returns the indices of all set bits, in ascending order. */
  toArray(): number[] {
    const indices: number[] = [];
    for (let w = 0; w < this.words.length; w++) {
      let word = this.words[w];
      const base = w * BITS_PER_WORD;
      while (word !== 0) {
        const bit = word & -word; // lowest set bit
        const offset = popcount32(bit - 1); // index of that bit within the word
        indices.push(base + offset);
        word ^= bit;
      }
    }
    return indices;
  }
}
