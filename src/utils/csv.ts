/**
 * Minimal RFC 4180-style CSV parsing and serialization. Handles quoted fields,
 * escaped quotes (`""`), and embedded delimiters and newlines. None of these
 * functions mutate their inputs.
 */

interface ParseOptions {
  /** Field delimiter. Defaults to `","`. */
  delimiter?: string;
  /** When `true`, the first row is treated as a header and each subsequent row
   * is returned as a record keyed by the header columns. */
  header?: boolean;
}

interface StringifyOptions {
  /** Field delimiter. Defaults to `","`. */
  delimiter?: string;
  /** Whether to emit a header row. Defaults to `true` for record input and
   * `false` for array-of-arrays input. */
  header?: boolean;
  /** Explicit column order/selection. Inferred from the records when omitted. */
  columns?: string[];
}

/**
 * Parse the raw CSV text into a matrix of string cells, honoring quoted
 * fields, escaped quotes and embedded delimiters/newlines.
 */
function parseMatrix(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let started = false;
  const delim = delimiter.length > 0 ? delimiter[0] : ",";

  const pushField = (): void => {
    row.push(field);
    field = "";
  };
  const pushRow = (): void => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    started = true;
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === delim) {
      pushField();
      continue;
    }
    if (char === "\r") {
      if (text[i + 1] === "\n") {
        i++;
      }
      pushRow();
      continue;
    }
    if (char === "\n") {
      pushRow();
      continue;
    }
    field += char;
  }

  if (started && (field.length > 0 || row.length > 0 || inQuotes)) {
    pushRow();
  }

  return rows;
}

/**
 * Convert a parsed matrix into header-keyed records.
 */
function matrixToRecords(matrix: string[][]): Record<string, string>[] {
  if (matrix.length === 0) {
    return [];
  }
  const header = matrix[0];
  const records: Record<string, string>[] = [];
  for (let r = 1; r < matrix.length; r++) {
    const cells = matrix[r];
    const record: Record<string, string> = {};
    for (let c = 0; c < header.length; c++) {
      record[header[c]] = c < cells.length ? cells[c] : "";
    }
    records.push(record);
  }
  return records;
}

/**
 * Escape a single field, wrapping it in quotes when it contains the delimiter,
 * a quote or a line break.
 */
function escapeField(value: string, delimiter: string): string {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Parse CSV text into a matrix of cells, or into header-keyed records.
 *
 * Honors quoted fields, escaped quotes (`""`) and embedded delimiters and line
 * breaks. When `options.header` is `true`, the first row is consumed as the
 * header and each remaining row is returned as a `Record<string, string>`;
 * otherwise a `string[][]` matrix is returned.
 *
 * @param text - The raw CSV text.
 * @param options - Parsing options (`delimiter`, `header`).
 * @returns A `string[][]` matrix, or `Record<string, string>[]` when
 * `header` is `true`.
 *
 * @example
 * csv.parse("a,b\n1,2"); // [["a", "b"], ["1", "2"]]
 * csv.parse("a,b\n1,2", { header: true }); // [{ a: "1", b: "2" }]
 * csv.parse('x\n"a,b"'); // [["x"], ["a,b"]]
 */
function parse(
  text: string,
  options: { delimiter?: string; header: true },
): Record<string, string>[];
function parse(
  text: string,
  options?: { delimiter?: string; header?: false },
): string[][];
function parse(
  text: string,
  options?: ParseOptions,
): string[][] | Record<string, string>[];
function parse(
  text: string,
  options: ParseOptions = {},
): string[][] | Record<string, string>[] {
  const { delimiter = ",", header = false } = options;
  const matrix = parseMatrix(text, delimiter);
  return header ? matrixToRecords(matrix) : matrix;
}

/**
 * Serialize rows into CSV text, escaping any field that contains the
 * delimiter, a quote or a line break.
 *
 * @param rows - Either an array of records or an array of arrays.
 * @param options - Serialization options (delimiter, header, columns).
 * @returns The CSV text with `\n`-separated rows.
 *
 * @example
 * csv.stringify([{ a: 1, b: "x,y" }]); // 'a,b\n1,"x,y"'
 */
function stringify(
  rows: Record<string, unknown>[] | unknown[][],
  options: StringifyOptions = {},
): string {
  const { delimiter = "," } = options;
  if (rows.length === 0) {
    return "";
  }

  const cell = (value: unknown): string =>
    value === null || value === undefined ? "" : String(value);

  const isArrayInput = Array.isArray(rows[0]);

  if (isArrayInput) {
    const matrix = rows as unknown[][];
    const includeHeader = options.header === true && options.columns !== undefined;
    const lines: string[] = [];
    if (includeHeader && options.columns !== undefined) {
      lines.push(
        options.columns.map((c) => escapeField(c, delimiter)).join(delimiter),
      );
    }
    for (const record of matrix) {
      lines.push(
        record.map((value) => escapeField(cell(value), delimiter)).join(delimiter),
      );
    }
    return lines.join("\n");
  }

  const records = rows as Record<string, unknown>[];
  let columns = options.columns;
  if (columns === undefined) {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const record of records) {
      for (const key of Object.keys(record)) {
        if (!seen.has(key)) {
          seen.add(key);
          ordered.push(key);
        }
      }
    }
    columns = ordered;
  }

  const includeHeader = options.header !== false;
  const lines: string[] = [];
  if (includeHeader) {
    lines.push(columns.map((c) => escapeField(c, delimiter)).join(delimiter));
  }
  for (const record of records) {
    lines.push(
      columns
        .map((column) => escapeField(cell(record[column]), delimiter))
        .join(delimiter),
    );
  }
  return lines.join("\n");
}

/**
 * CSV parsing and serialization helpers.
 */
export const csv = {
  parse,
  stringify,
} as const;
