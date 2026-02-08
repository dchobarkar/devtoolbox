interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

type RegexTestResult =
  | { valid: true; matches: RegexMatch[] }
  | { valid: false; error: string };

type RegexReplaceResult =
  | { valid: true; result: string }
  | { valid: false; error: string };

const testRegex = (
  pattern: string,
  flags: string,
  text: string,
): RegexTestResult => {
  if (!pattern.trim()) {
    return { valid: false, error: "Pattern is empty" };
  }
  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];
    if (flags.includes("g")) {
      const iterator = text.matchAll(regex);
      for (const m of iterator) {
        matches.push({
          match: m[0],
          index: m.index ?? 0,
          groups: m.length > 1 ? Array.from(m).slice(1) : [],
        });
      }
    } else {
      const m = text.match(regex);
      if (m) {
        matches.push({
          match: m[0],
          index: m.index ?? 0,
          groups: m.length > 1 ? Array.from(m).slice(1) : [],
        });
      }
    }
    return { valid: true, matches };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid regex";
    return { valid: false, error: message };
  }
};

const replaceWithRegex = (
  pattern: string,
  flags: string,
  text: string,
  replacement: string,
): RegexReplaceResult => {
  if (!pattern.trim()) {
    return { valid: false, error: "Pattern is empty" };
  }
  try {
    const regex = new RegExp(pattern, flags);
    const result = text.replace(regex, replacement);
    return { valid: true, result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid regex";
    return { valid: false, error: message };
  }
};

export type { RegexMatch, RegexTestResult, RegexReplaceResult };
export { testRegex, replaceWithRegex };
