/**
 * Query-string helpers. Both functions are pure and never mutate their input.
 */
export const query = {
  /**
   * Parse a query string into a record of decoded string values. A leading
   * `"?"` is optional. Repeated keys keep the last occurrence.
   *
   * @param queryString - The query string, with or without a leading `"?"`.
   * @returns A record of decoded key/value pairs.
   *
   * @example
   * query.parse("?a=1&b=hello%20world"); // { a: "1", b: "hello world" }
   */
  parse(queryString: string): Record<string, string> {
    const result: Record<string, string> = {};
    let input = queryString;
    if (input.startsWith("?")) input = input.slice(1);
    if (input.length === 0) return result;

    for (const pair of input.split("&")) {
      if (pair.length === 0) continue;
      const eq = pair.indexOf("=");
      const rawKey = eq === -1 ? pair : pair.slice(0, eq);
      const rawValue = eq === -1 ? "" : pair.slice(eq + 1);
      if (rawKey.length === 0) continue;
      result[safeDecode(rawKey)] = safeDecode(rawValue);
    }

    return result;
  },

  /**
   * Serialize a params object into a URL-encoded query string. `null` and
   * `undefined` values are omitted. The result has no leading `"?"`.
   *
   * @param params - Parameters to serialize.
   * @returns A URL-encoded query string (possibly empty).
   *
   * @example
   * query.stringify({ a: 1, b: "x y", c: null }); // "a=1&b=x%20y"
   */
  stringify(
    params: Record<string, string | number | boolean | null | undefined>
  ): string {
    const search = new URLSearchParams();
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value === null || value === undefined) continue;
      search.append(key, String(value));
    }
    return search.toString();
  },
};

/**
 * Decode a URI component, replacing `+` with spaces, and falling back to the
 * raw input when decoding fails (malformed percent-encoding).
 */
function safeDecode(input: string): string {
  const withSpaces = input.replace(/\+/g, " ");
  try {
    return decodeURIComponent(withSpaces);
  } catch {
    return withSpaces;
  }
}
