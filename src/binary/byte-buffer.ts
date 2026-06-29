/**
 * Options accepted by the {@link ByteBuffer} constructor.
 */
export interface ByteBufferOptions {
  /**
   * Byte order used by all multi-byte read/write methods. When `true`, values
   * are stored least-significant-byte first; when `false` (the default), most
   * significant byte first.
   */
  littleEndian?: boolean;
}

const DEFAULT_CAPACITY = 64;

/**
 * Growable binary buffer with a single read/write cursor and configurable
 * endianness.
 *
 * A `ByteBuffer` wraps an {@link ArrayBuffer} accessed through a {@link DataView}.
 * Writes append at the current cursor position, advancing it and growing the
 * underlying storage (doubling its capacity) when more room is required. Reads
 * also advance the cursor. The reported {@link ByteBuffer.length} is the
 * high-water mark: the number of bytes that have ever been written.
 *
 * Multi-byte numeric methods honour the endianness chosen at construction time.
 *
 * @example
 * const buf = new ByteBuffer();
 * buf.writeUint32(0xdeadbeef).writeString("hi");
 * buf.position = 0;
 * buf.readUint32(); // 0xdeadbeef
 * buf.readString(2); // "hi"
 *
 * @example
 * // Little-endian round-trip:
 * const le = new ByteBuffer(8, { littleEndian: true });
 * le.writeInt16(-1234);
 * le.position = 0;
 * le.readInt16(); // -1234
 */
export class ByteBuffer {
  private buffer: ArrayBuffer;
  private view: DataView;
  private bytes: Uint8Array;
  private cursor = 0;
  private highWater = 0;
  private readonly littleEndian: boolean;

  private static readonly encoder = new TextEncoder();
  private static readonly decoder = new TextDecoder();

  /**
   * Creates a new buffer.
   *
   * @param source - Initial capacity (a non-negative integer) when a number, or
   * initial contents to copy when a `Uint8Array` or `ArrayBuffer`. Defaults to a
   * capacity of 64 bytes. Provided bytes are copied; the argument is never
   * retained or mutated. When seeded with contents, {@link ByteBuffer.length}
   * starts at the byte length of those contents.
   * @param options - Optional configuration; see {@link ByteBufferOptions}.
   */
  constructor(
    source?: number | Uint8Array | ArrayBuffer,
    options?: ByteBufferOptions
  ) {
    this.littleEndian = options?.littleEndian ?? false;

    if (typeof source === "number") {
      const capacity = Math.max(0, Math.floor(source));
      this.buffer = new ArrayBuffer(capacity);
    } else if (source instanceof Uint8Array) {
      this.buffer = new ArrayBuffer(source.byteLength);
      new Uint8Array(this.buffer).set(source);
      this.highWater = source.byteLength;
    } else if (source instanceof ArrayBuffer) {
      this.buffer = source.slice(0);
      this.highWater = source.byteLength;
    } else {
      this.buffer = new ArrayBuffer(DEFAULT_CAPACITY);
    }

    this.view = new DataView(this.buffer);
    this.bytes = new Uint8Array(this.buffer);
  }

  /** Current cursor position, in bytes, used by the next read or write. */
  get position(): number {
    return this.cursor;
  }

  /**
   * Moves the cursor. The value must be a non-negative integer not greater than
   * {@link ByteBuffer.length}.
   */
  set position(value: number) {
    if (!Number.isInteger(value) || value < 0 || value > this.highWater) {
      throw new RangeError("position out of bounds");
    }
    this.cursor = value;
  }

  /** Number of bytes written so far (the high-water mark). */
  get length(): number {
    return this.highWater;
  }

  /** Number of readable bytes between the cursor and {@link ByteBuffer.length}. */
  remaining(): number {
    return this.highWater - this.cursor;
  }

  /** Resets the cursor and length to zero without releasing storage. */
  reset(): void {
    this.cursor = 0;
    this.highWater = 0;
  }

  /** Returns a fresh copy of the written bytes (indices `0` to `length`). */
  toUint8Array(): Uint8Array {
    return this.bytes.slice(0, this.highWater);
  }

  /** Returns a fresh `ArrayBuffer` holding the written bytes. */
  toArrayBuffer(): ArrayBuffer {
    return this.buffer.slice(0, this.highWater);
  }

  /**
   * Ensures the underlying storage can hold at least `required` total bytes,
   * doubling the capacity (and copying) as needed.
   */
  private ensureCapacity(required: number): void {
    if (required <= this.buffer.byteLength) {
      return;
    }
    let capacity = Math.max(this.buffer.byteLength, 1);
    while (capacity < required) {
      capacity *= 2;
    }
    const next = new ArrayBuffer(capacity);
    new Uint8Array(next).set(this.bytes.subarray(0, this.highWater));
    this.buffer = next;
    this.view = new DataView(next);
    this.bytes = new Uint8Array(next);
  }

  /** Reserves `size` bytes at the cursor and returns the write offset. */
  private advanceWrite(size: number): number {
    const offset = this.cursor;
    this.ensureCapacity(offset + size);
    this.cursor = offset + size;
    if (this.cursor > this.highWater) {
      this.highWater = this.cursor;
    }
    return offset;
  }

  /** Validates that `size` bytes can be read and returns the read offset. */
  private advanceRead(size: number): number {
    if (size < 0 || this.cursor + size > this.highWater) {
      throw new RangeError("read past end of buffer");
    }
    const offset = this.cursor;
    this.cursor = offset + size;
    return offset;
  }

  /** Writes an unsigned 8-bit integer and advances the cursor by 1. */
  writeUint8(value: number): this {
    const offset = this.advanceWrite(1);
    this.view.setUint8(offset, value);
    return this;
  }

  /** Writes a signed 8-bit integer and advances the cursor by 1. */
  writeInt8(value: number): this {
    const offset = this.advanceWrite(1);
    this.view.setInt8(offset, value);
    return this;
  }

  /** Writes an unsigned 16-bit integer and advances the cursor by 2. */
  writeUint16(value: number): this {
    const offset = this.advanceWrite(2);
    this.view.setUint16(offset, value, this.littleEndian);
    return this;
  }

  /** Writes a signed 16-bit integer and advances the cursor by 2. */
  writeInt16(value: number): this {
    const offset = this.advanceWrite(2);
    this.view.setInt16(offset, value, this.littleEndian);
    return this;
  }

  /** Writes an unsigned 32-bit integer and advances the cursor by 4. */
  writeUint32(value: number): this {
    const offset = this.advanceWrite(4);
    this.view.setUint32(offset, value, this.littleEndian);
    return this;
  }

  /** Writes a signed 32-bit integer and advances the cursor by 4. */
  writeInt32(value: number): this {
    const offset = this.advanceWrite(4);
    this.view.setInt32(offset, value, this.littleEndian);
    return this;
  }

  /** Writes a 32-bit IEEE-754 float and advances the cursor by 4. */
  writeFloat32(value: number): this {
    const offset = this.advanceWrite(4);
    this.view.setFloat32(offset, value, this.littleEndian);
    return this;
  }

  /** Writes a 64-bit IEEE-754 float and advances the cursor by 8. */
  writeFloat64(value: number): this {
    const offset = this.advanceWrite(8);
    this.view.setFloat64(offset, value, this.littleEndian);
    return this;
  }

  /** Writes an unsigned 64-bit integer and advances the cursor by 8. */
  writeBigUint64(value: bigint): this {
    const offset = this.advanceWrite(8);
    this.view.setBigUint64(offset, value, this.littleEndian);
    return this;
  }

  /** Writes a signed 64-bit integer and advances the cursor by 8. */
  writeBigInt64(value: bigint): this {
    const offset = this.advanceWrite(8);
    this.view.setBigInt64(offset, value, this.littleEndian);
    return this;
  }

  /** Appends raw bytes (copied) and advances the cursor by their length. */
  writeBytes(data: Uint8Array): this {
    const offset = this.advanceWrite(data.byteLength);
    this.bytes.set(data, offset);
    return this;
  }

  /** Encodes `text` as UTF-8, appends it, and advances the cursor. */
  writeString(text: string): this {
    return this.writeBytes(ByteBuffer.encoder.encode(text));
  }

  /** Reads an unsigned 8-bit integer and advances the cursor by 1. */
  readUint8(): number {
    return this.view.getUint8(this.advanceRead(1));
  }

  /** Reads a signed 8-bit integer and advances the cursor by 1. */
  readInt8(): number {
    return this.view.getInt8(this.advanceRead(1));
  }

  /** Reads an unsigned 16-bit integer and advances the cursor by 2. */
  readUint16(): number {
    return this.view.getUint16(this.advanceRead(2), this.littleEndian);
  }

  /** Reads a signed 16-bit integer and advances the cursor by 2. */
  readInt16(): number {
    return this.view.getInt16(this.advanceRead(2), this.littleEndian);
  }

  /** Reads an unsigned 32-bit integer and advances the cursor by 4. */
  readUint32(): number {
    return this.view.getUint32(this.advanceRead(4), this.littleEndian);
  }

  /** Reads a signed 32-bit integer and advances the cursor by 4. */
  readInt32(): number {
    return this.view.getInt32(this.advanceRead(4), this.littleEndian);
  }

  /** Reads a 32-bit IEEE-754 float and advances the cursor by 4. */
  readFloat32(): number {
    return this.view.getFloat32(this.advanceRead(4), this.littleEndian);
  }

  /** Reads a 64-bit IEEE-754 float and advances the cursor by 8. */
  readFloat64(): number {
    return this.view.getFloat64(this.advanceRead(8), this.littleEndian);
  }

  /** Reads an unsigned 64-bit integer and advances the cursor by 8. */
  readBigUint64(): bigint {
    return this.view.getBigUint64(this.advanceRead(8), this.littleEndian);
  }

  /** Reads a signed 64-bit integer and advances the cursor by 8. */
  readBigInt64(): bigint {
    return this.view.getBigInt64(this.advanceRead(8), this.littleEndian);
  }

  /**
   * Reads `length` bytes and advances the cursor. Returns a fresh copy that is
   * independent of the buffer's storage.
   */
  readBytes(length: number): Uint8Array {
    if (!Number.isInteger(length) || length < 0) {
      throw new RangeError("length must be a non-negative integer");
    }
    const offset = this.advanceRead(length);
    return this.bytes.slice(offset, offset + length);
  }

  /** Reads `length` bytes as a UTF-8 string and advances the cursor. */
  readString(length: number): string {
    if (!Number.isInteger(length) || length < 0) {
      throw new RangeError("length must be a non-negative integer");
    }
    const offset = this.advanceRead(length);
    return ByteBuffer.decoder.decode(this.bytes.subarray(offset, offset + length));
  }
}
