/**
 * Space-efficient probabilistic set membership test.
 *
 * A Bloom filter never reports a false negative: if `has` returns false the
 * item was definitely never added. It may report a false positive, with an
 * approximate rate controlled by the constructor. Items cannot be removed.
 *
 * The bit array is stored in a Uint8Array and `k` hash functions are simulated
 * via double hashing (Kirsch-Mitzenmacher): `h_i = h1 + i * h2`.
 */
export class BloomFilter {
  private readonly bits: Uint8Array;
  private readonly bitCount: number;
  private readonly hashCount: number;
  private count = 0;

  /**
   * Sizes the filter for `expectedItems` while targeting `falsePositiveRate`.
   * @param expectedItems anticipated number of inserted items (>= 1)
   * @param falsePositiveRate desired false-positive probability in (0, 1)
   */
  constructor(expectedItems: number, falsePositiveRate = 0.01) {
    if (!Number.isFinite(expectedItems) || expectedItems < 1) {
      throw new RangeError("expectedItems must be a number >= 1");
    }
    if (!(falsePositiveRate > 0 && falsePositiveRate < 1)) {
      throw new RangeError("falsePositiveRate must be in the open interval (0, 1)");
    }

    // m = -(n * ln p) / (ln 2)^2 ; k = (m / n) * ln 2
    const ln2 = Math.LN2;
    const m = Math.ceil((-expectedItems * Math.log(falsePositiveRate)) / (ln2 * ln2));
    this.bitCount = Math.max(1, m);
    this.hashCount = Math.max(1, Math.round((this.bitCount / expectedItems) * ln2));
    this.bits = new Uint8Array(Math.ceil(this.bitCount / 8));
  }

  /** Adds `item` to the filter. */
  add(item: string): void {
    const [h1, h2] = this.hashPair(item);
    for (let i = 0; i < this.hashCount; i++) {
      this.setBit(this.indexFor(h1, h2, i));
    }
    this.count++;
  }

  /**
   * Returns true if `item` is possibly present, false if it is definitely
   * absent. A true result may be a false positive.
   */
  has(item: string): boolean {
    const [h1, h2] = this.hashPair(item);
    for (let i = 0; i < this.hashCount; i++) {
      if (!this.getBit(this.indexFor(h1, h2, i))) {
        return false;
      }
    }
    return true;
  }

  /** Number of items added (including duplicates). */
  get size(): number {
    return this.count;
  }

  private indexFor(h1: number, h2: number, i: number): number {
    // Combine the two base hashes; >>> 0 keeps the value an unsigned 32-bit int.
    const combined = (h1 + Math.imul(i, h2)) >>> 0;
    return combined % this.bitCount;
  }

  private setBit(index: number): void {
    this.bits[index >>> 3] |= 1 << (index & 7);
  }

  private getBit(index: number): boolean {
    return (this.bits[index >>> 3] & (1 << (index & 7))) !== 0;
  }

  /** Derives two independent 32-bit hashes (FNV-1a + DJB2 variant). */
  private hashPair(item: string): [number, number] {
    let h1 = 0x811c9dc5; // FNV offset basis
    let h2 = 5381; // DJB2 seed
    for (let i = 0; i < item.length; i++) {
      const code = item.charCodeAt(i);
      h1 ^= code;
      h1 = Math.imul(h1, 0x01000193); // FNV prime
      h2 = (Math.imul(h2, 33) ^ code) >>> 0;
    }
    h1 >>>= 0;
    h2 >>>= 0;
    // Ensure the step is non-zero so distinct probe positions are produced.
    if (h2 === 0) h2 = 1;
    return [h1, h2];
  }
}
