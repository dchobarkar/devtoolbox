export interface EnvEntry {
  key: string;
  value: string;
  rawKey: string;
  lineIndex: number;
}

export interface EnvComment {
  text: string;
  lineIndex: number;
}

export interface ParsedEnv {
  entries: EnvEntry[];
  comments: EnvComment[];
  blanks: number[];
  lineOrder: { lineIndex: number; type: "entry" | "comment" | "blank" }[];
}

export interface EnvValidation {
  valid: boolean;
  errors: string[];
  duplicateKeys: string[];
}

export interface FormatEnvOptions {
  sortKeys?: boolean;
  spacing?: EnvSpacing;
  trailingNewline?: boolean;
  exportPrefix?: boolean;
  minify?: boolean;
  lineEnding?: "lf" | "crlf";
}

export type EnvSpacing = "none" | "around";

const KEY_REGEX = /^(export\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/;

const parseValue = (raw: string): { value: string; rest: string } => {
  const s = raw.trimStart();
  if (s.startsWith('"')) {
    let i = 1;
    let value = "";
    while (i < s.length) {
      if (s[i] === "\\") {
        if (i + 1 < s.length) {
          const next = s[i + 1];
          if (next === "n") value += "\n";
          else if (next === "t") value += "\t";
          else if (next === "r") value += "\r";
          else if (next === '"') value += '"';
          else if (next === "\\") value += "\\";
          else value += next;
          i += 2;
          continue;
        }
      }
      if (s[i] === '"') {
        return { value, rest: s.slice(i + 1) };
      }
      value += s[i];
      i++;
    }
    return { value, rest: "" };
  }
  if (s.startsWith("'")) {
    const end = s.indexOf("'", 1);
    if (end === -1) return { value: s.slice(1), rest: "" };
    return { value: s.slice(1, end), rest: s.slice(end + 1) };
  }
  const hashIdx = s.search(/\s#\s/);
  const unquoted = hashIdx >= 0 ? s.slice(0, hashIdx).trimEnd() : s.trimEnd();
  return { value: unquoted, rest: "" };
};

const parseEnv = (input: string): ParsedEnv => {
  const lines = input.split(/\r?\n/);
  const entries: EnvEntry[] = [];
  const comments: EnvComment[] = [];
  const blanks: number[] = [];
  const lineOrder: ParsedEnv["lineOrder"] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedStart = line.trimStart();

    if (trimmedStart.length === 0) {
      blanks.push(i);
      lineOrder.push({ lineIndex: i, type: "blank" });
      continue;
    }

    if (trimmedStart.startsWith("#")) {
      comments.push({ text: trimmedStart, lineIndex: i });
      lineOrder.push({ lineIndex: i, type: "comment" });
      continue;
    }

    const match = trimmedStart.match(KEY_REGEX);
    if (match) {
      const fullMatch = match[0];
      const keyName = match[2];
      const valuePart = match[3] ?? "";
      const { value } = parseValue(valuePart);
      const rawKey = fullMatch.slice(0, fullMatch.indexOf("=")).trimEnd();
      entries.push({
        key: keyName,
        value,
        rawKey,
        lineIndex: i,
      });
      lineOrder.push({ lineIndex: i, type: "entry" });
    } else {
      comments.push({ text: trimmedStart, lineIndex: i });
      lineOrder.push({ lineIndex: i, type: "comment" });
    }
  }

  return { entries, comments, blanks, lineOrder };
};

const getDuplicateKeys = (entries: EnvEntry[]): string[] => {
  const seen = new Map<string, number>();
  const dups = new Set<string>();
  for (const e of entries) {
    const k = e.key;
    if (seen.has(k)) dups.add(k);
    else seen.set(k, e.lineIndex);
  }
  return Array.from(dups);
};

const validateEnv = (parsed: ParsedEnv): EnvValidation => {
  const errors: string[] = [];
  const keyPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  for (const e of parsed.entries) {
    if (!e.key) {
      errors.push(`Line ${e.lineIndex + 1}: empty key`);
      continue;
    }
    if (!keyPattern.test(e.key)) {
      errors.push(
        `Line ${e.lineIndex + 1}: invalid key "${e.key}" (use letters, numbers, underscores)`,
      );
    }
  }

  const duplicateKeys = getDuplicateKeys(parsed.entries);
  return {
    valid: errors.length === 0,
    errors,
    duplicateKeys,
  };
};

const escapeValue = (value: string, preferQuotes: boolean): string => {
  const needsQuotes =
    preferQuotes ||
    /[\s#="'\\]/.test(value) ||
    value.startsWith(" ") ||
    value.endsWith(" ");
  if (!needsQuotes) return value;
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
  return `"${escaped}"`;
};

const formatEnv = (
  parsed: ParsedEnv,
  options: FormatEnvOptions = {},
): string => {
  const {
    sortKeys = false,
    spacing = "none",
    trailingNewline = true,
    exportPrefix = false,
    minify = false,
    lineEnding = "lf",
  } = options;

  const sep = spacing === "around" ? " = " : "=";
  const prefix = exportPrefix ? "export " : "";
  const newline = lineEnding === "crlf" ? "\r\n" : "\n";

  const sortedEntries = sortKeys
    ? [...parsed.entries].sort((a, b) =>
        a.key.localeCompare(b.key, undefined, { sensitivity: "base" }),
      )
    : parsed.entries;

  if (minify) {
    const lines = sortedEntries.map(
      (e) => `${prefix}${e.key}${sep}${escapeValue(e.value, false)}`,
    );
    const result = lines.join(newline);
    return trailingNewline ? result + newline : result;
  }

  const entryByLineIndex = new Map(parsed.entries.map((e) => [e.lineIndex, e]));
  const sortedOrder = [...parsed.lineOrder].sort(
    (a, b) => a.lineIndex - b.lineIndex,
  );

  const outputLines: string[] = [];
  let nextSortedIdx = 0;

  for (const { lineIndex, type } of sortedOrder) {
    if (type === "blank") {
      outputLines.push("");
    } else if (type === "comment") {
      const c = parsed.comments.find((x) => x.lineIndex === lineIndex);
      if (c) outputLines.push(c.text);
    } else {
      const e = sortKeys
        ? sortedEntries[nextSortedIdx++]
        : entryByLineIndex.get(lineIndex);
      if (e) {
        outputLines.push(
          `${prefix}${e.key}${sep}${escapeValue(e.value, false)}`,
        );
      }
    }
  }

  const result = outputLines.join(newline);
  return trailingNewline ? result + newline : result;
};

const toEnvExample = (
  parsed: ParsedEnv,
  placeholder = "",
  lineEnding: "lf" | "crlf" = "lf",
): string => {
  const newline = lineEnding === "crlf" ? "\r\n" : "\n";
  const lines: string[] = [];
  const sortedOrder = [...parsed.lineOrder].sort(
    (a, b) => a.lineIndex - b.lineIndex,
  );
  const entryByLineIndex = new Map(parsed.entries.map((e) => [e.lineIndex, e]));

  for (const { lineIndex, type } of sortedOrder) {
    if (type === "blank") {
      lines.push("");
    } else if (type === "comment") {
      const c = parsed.comments.find((x) => x.lineIndex === lineIndex);
      if (c) lines.push(c.text);
    } else {
      const e = entryByLineIndex.get(lineIndex);
      if (e) {
        const value = placeholder ? escapeValue(placeholder, false) : '""';
        lines.push(`${e.key}=${value}`);
      }
    }
  }
  return lines.join(newline) + newline;
};

const toJson = (parsed: ParsedEnv, indent = 2): string => {
  const obj: Record<string, string> = {};
  for (const e of parsed.entries) {
    obj[e.key] = e.value;
  }
  return JSON.stringify(obj, null, indent === 0 ? undefined : indent);
};

const parseJsonToEnv = (input: string): ParsedEnv | null => {
  const raw = input.trim();
  if (!raw.startsWith("{")) return null;
  try {
    const data = JSON.parse(raw);
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    const entries: EnvEntry[] = [];
    const lineOrder: ParsedEnv["lineOrder"] = [];
    let i = 0;
    for (const [key, val] of Object.entries(data)) {
      if (typeof key !== "string") continue;
      const value = val !== undefined && val !== null ? String(val) : "";
      entries.push({
        key,
        value,
        rawKey: key,
        lineIndex: i,
      });
      lineOrder.push({ lineIndex: i, type: "entry" });
      i++;
    }
    return {
      entries,
      comments: [],
      blanks: [],
      lineOrder,
    };
  } catch {
    return null;
  }
};

export {
  parseEnv,
  validateEnv,
  getDuplicateKeys,
  formatEnv,
  toEnvExample,
  toJson,
  parseJsonToEnv,
};
