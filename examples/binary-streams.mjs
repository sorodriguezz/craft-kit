// Binary + Web Streams. Run: npm run build && node examples/binary-streams.mjs  (Node 18+)
import { ByteBuffer, bytes, streams } from "../dist/index.js";

const buf = new ByteBuffer();
buf.writeUint32(0xdeadbeef);
buf.writeString("hi");
buf.position = 0;
console.log("u32:", buf.readUint32().toString(16), "str:", buf.readString(2));
console.log("hex:", bytes.toHex(bytes.fromUtf8("hi")));

const doubled = await streams.toArray(streams.map(streams.fromIterable([1, 2, 3]), (x) => x * 10));
console.log("stream:", doubled);
