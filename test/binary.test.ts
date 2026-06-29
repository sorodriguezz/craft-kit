import { describe, it, expect } from "vitest";
import { ByteBuffer, bytes, BitSet, bits } from "../src/index";

describe("binary", () => {
  it("ByteBuffer read/write + endianness", () => {
    const buf = new ByteBuffer();
    buf.writeUint32(0x01020304);
    buf.writeFloat64(3.14);
    buf.writeString("hi");
    buf.position = 0;
    expect(buf.readUint32()).toBe(0x01020304);
    expect(buf.readFloat64()).toBe(3.14);
    expect(buf.readString(2)).toBe("hi");
    const le = new ByteBuffer(undefined, { littleEndian: true });
    le.writeUint16(0x0102);
    le.position = 0;
    expect(le.readUint16()).toBe(0x0102);
  });
  it("bytes hex/base64/utf8/concat", () => {
    expect(bytes.toHex(bytes.fromHex("0a0b"))).toBe("0a0b");
    expect(bytes.toUtf8(bytes.fromUtf8("héllo"))).toBe("héllo");
    expect(bytes.toUtf8(bytes.fromBase64(bytes.toBase64(bytes.fromUtf8("hi"))))).toBe("hi");
    expect(bytes.equals(bytes.concat(Uint8Array.of(1), Uint8Array.of(2, 3)), Uint8Array.of(1, 2, 3))).toBe(true);
  });
  it("BitSet + bits", () => {
    const bs = new BitSet();
    bs.set(1).set(65);
    expect([bs.get(1), bs.get(65), bs.get(2), bs.count()]).toEqual([true, true, false, 2]);
    expect(bits.popcount(7)).toBe(3);
    expect(bits.isPowerOfTwo(8)).toBe(true);
    expect(bits.nextPowerOfTwo(5)).toBe(8);
    expect(bits.toBinaryString(5, 4)).toBe("0101");
  });
});
