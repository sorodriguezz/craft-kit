import { HashSet } from "./hash-set";

/**
 * HashSet variant guaranteeing insertion-order iteration, mirroring
 * java.util.LinkedHashSet. (The native Set backing already preserves order.)
 */
export class LinkedHashSet<T> extends HashSet<T> {}
