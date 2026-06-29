/**
 * String helpers for casing, slugification, truncation and accent handling.
 * None of these mutate their inputs.
 */
export const strings = {
  /**
   * Uppercase the first character and lowercase the rest.
   *
   * @param s - Source string.
   * @returns The capitalized string.
   *
   * @example
   * strings.capitalize("hELLO"); // "Hello"
   */
  capitalize(s: string): string {
    if (s.length === 0) {
      return s;
    }
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  },

  /**
   * Capitalize each whitespace-separated word.
   *
   * @param s - Source string.
   * @returns The string with every word capitalized.
   *
   * @example
   * strings.capitalizeWords("hello world"); // "Hello World"
   */
  capitalizeWords(s: string): string {
    return s.replace(/\S+/g, (word) => strings.capitalize(word));
  },

  /**
   * Convert a string to `camelCase`.
   *
   * @param s - Source string.
   * @returns The camelCased string.
   *
   * @example
   * strings.camelCase("hello world-foo"); // "helloWorldFoo"
   */
  camelCase(s: string): string {
    const parts = strings.words(s);
    if (parts.length === 0) {
      return "";
    }
    return parts
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join("");
  },

  /**
   * Convert a string to `snake_case`.
   *
   * @param s - Source string.
   * @returns The snake_cased string.
   *
   * @example
   * strings.snakeCase("helloWorld foo"); // "hello_world_foo"
   */
  snakeCase(s: string): string {
    return strings
      .words(s)
      .map((word) => word.toLowerCase())
      .join("_");
  },

  /**
   * Convert a string to `kebab-case`.
   *
   * @param s - Source string.
   * @returns The kebab-cased string.
   *
   * @example
   * strings.kebabCase("helloWorld foo"); // "hello-world-foo"
   */
  kebabCase(s: string): string {
    return strings
      .words(s)
      .map((word) => word.toLowerCase())
      .join("-");
  },

  /**
   * Convert a string to `PascalCase`.
   *
   * @param s - Source string.
   * @returns The PascalCased string.
   *
   * @example
   * strings.pascalCase("hello world-foo"); // "HelloWorldFoo"
   */
  pascalCase(s: string): string {
    return strings
      .words(s)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  },

  /**
   * Convert a string into a URL-friendly slug: lowercase, accent-free, with
   * runs of non-alphanumeric characters collapsed to single hyphens and no
   * leading or trailing hyphen.
   *
   * @param s - Source string.
   * @returns The slugified string containing only `[a-z0-9-]`.
   *
   * @example
   * strings.slugify("Crème Brûlée & Co."); // "creme-brulee-co"
   */
  slugify(s: string): string {
    return strings
      .stripAccents(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  /**
   * Truncate a string to a maximum length, appending a suffix when shortened.
   * The result (including the suffix) never exceeds `maxLength`.
   *
   * @param s - Source string.
   * @param maxLength - Maximum length of the returned string.
   * @param suffix - Appended when truncation occurs. Defaults to `"..."`.
   * @returns The original string when short enough, otherwise the truncated
   * string ending with `suffix`.
   *
   * @example
   * strings.truncate("Hello, world", 8); // "Hello..."
   */
  truncate(s: string, maxLength: number, suffix = "..."): string {
    if (s.length <= maxLength) {
      return s;
    }
    if (maxLength <= suffix.length) {
      return suffix.slice(0, maxLength);
    }
    return s.slice(0, maxLength - suffix.length) + suffix;
  },

  /**
   * Reverse the characters of a string (by UTF-16 code units).
   *
   * @param s - Source string.
   * @returns The reversed string.
   *
   * @example
   * strings.reverse("abc"); // "cba"
   */
  reverse(s: string): string {
    return s.split("").reverse().join("");
  },

  /**
   * Report whether a string is empty or contains only whitespace.
   *
   * @param s - Source string.
   * @returns `true` when the string has no non-whitespace characters.
   *
   * @example
   * strings.isBlank("   "); // true
   */
  isBlank(s: string): boolean {
    return s.trim().length === 0;
  },

  /**
   * Remove diacritical marks from a string using Unicode NFD normalization.
   *
   * @param s - Source string.
   * @returns The string with accents stripped.
   *
   * @example
   * strings.stripAccents("àéîõü"); // "aeiou"
   */
  stripAccents(s: string): string {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  },

  /**
   * Split a string into its constituent words, treating camelCase boundaries,
   * digits, and non-alphanumeric separators as word breaks.
   *
   * @param s - Source string.
   * @returns A new array of word tokens (empty when there are none).
   *
   * @example
   * strings.words("helloWorld-foo_bar 42"); // ["hello", "World", "foo", "bar", "42"]
   */
  words(s: string): string[] {
    return s.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|[A-Z]|[0-9]+/g) ?? [];
  },

  /** Count non-overlapping occurrences of a substring. */
  count(s: string, substring: string): number {
    if (substring === "") return 0;
    return s.split(substring).length - 1;
  },

  /** Count occurrences of a single character (alias of count). */
  countChar(s: string, char: string): number {
    return this.count(s, char);
  },

  /** Frequency map of each character. */
  charFrequency(s: string): Map<string, number> {
    const map = new Map<string, number>();
    for (const ch of s) map.set(ch, (map.get(ch) ?? 0) + 1);
    return map;
  },

  /** Start indices of every non-overlapping occurrence of a substring. */
  occurrences(s: string, substring: string): number[] {
    if (substring === "") return [];
    const result: number[] = [];
    let i = s.indexOf(substring);
    while (i !== -1) {
      result.push(i);
      i = s.indexOf(substring, i + substring.length);
    }
    return result;
  },

  /** Truncates the middle of a string, keeping both ends. */
  truncateMiddle(s: string, maxLength: number, separator = "…"): string {
    if (s.length <= maxLength) return s;
    if (maxLength <= separator.length) return separator;
    const keep = maxLength - separator.length;
    const front = Math.ceil(keep / 2);
    const back = Math.floor(keep / 2);
    return s.slice(0, front) + separator + s.slice(s.length - back);
  },

  /** English-style pluralization (pass `plural` to override). */
  pluralize(word: string, count: number, plural?: string): string {
    if (count === 1) return word;
    if (plural !== undefined) return plural;
    if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + "ies";
    if (/(s|x|z|ch|sh)$/i.test(word)) return word + "es";
    return word + "s";
  },

  /** English-style singularization (best effort). */
  singularize(word: string): string {
    if (/ies$/i.test(word)) return word.slice(0, -3) + "y";
    if (/(ses|xes|zes|ches|shes)$/i.test(word)) return word.slice(0, -2);
    if (/s$/i.test(word) && !/ss$/i.test(word)) return word.slice(0, -1);
    return word;
  },

  /** Masks characters, leaving some visible at the ends (default: last 4). */
  mask(
    s: string,
    options: { visibleStart?: number; visibleEnd?: number; maskChar?: string } = {},
  ): string {
    const { visibleStart = 0, visibleEnd = 4, maskChar = "*" } = options;
    if (s.length <= visibleStart + visibleEnd) return s;
    const start = s.slice(0, visibleStart);
    const end = visibleEnd > 0 ? s.slice(s.length - visibleEnd) : "";
    return start + maskChar.repeat(s.length - visibleStart - visibleEnd) + end;
  },

  /** Escapes HTML-special characters. */
  escapeHtml(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  /** Reverses {@link escapeHtml}. */
  unescapeHtml(s: string): string {
    return s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  },
};
