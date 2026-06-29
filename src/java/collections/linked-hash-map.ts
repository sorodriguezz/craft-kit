import { HashMap } from "./hash-map";

/**
 * HashMap variant that guarantees predictable insertion-order iteration,
 * mirroring java.util.LinkedHashMap. (The native Map backing already preserves
 * insertion order.)
 */
export class LinkedHashMap<K, V> extends HashMap<K, V> {}
