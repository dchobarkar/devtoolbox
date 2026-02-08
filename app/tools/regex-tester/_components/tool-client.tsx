"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Trash2,
  Regex as RegexIcon,
  CheckCircle2,
  XCircle,
  BookOpen,
  ChevronRight,
} from "lucide-react";

import TextArea from "@/components/shared/TextArea";
import CopyButton from "@/components/shared/CopyButton";
import { testRegex, replaceWithRegex } from "@/lib/parsers/regex";

const SAMPLE_PATTERN = "\\w+@\\w+\\.\\w+";
const SAMPLE_TEXT = `Contact us at support@example.com or sales@company.org.
Invalid: notanemail, missing@.com, @nodomain.com`;

const COMMON_PATTERNS = [
  {
    name: "Email",
    pattern: "\\w+@\\w+\\.\\w+",
    sample: "Email: test@example.com and admin@site.org",
  },
  {
    name: "URL",
    pattern: "https?://[\\w.-]+(?:/\\S*)?",
    sample: "Visit https://example.com/path and http://test.org",
  },
  {
    name: "Phone (US)",
    pattern: "\\d{3}[-.]?\\d{3}[-.]?\\d{4}",
    sample: "Call 555-123-4567 or 555.987.6543",
  },
  {
    name: "IPv4",
    pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b",
    sample: "Server 192.168.1.1 and 10.0.0.1",
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "\\d{4}-\\d{2}-\\d{2}",
    sample: "Dates: 2024-01-15 and 2023-12-31",
  },
  {
    name: "Hex color",
    pattern: "#[0-9a-fA-F]{6}",
    sample: "Colors: #ff0000 #00ff00 #0000ff",
  },
] as const;

const FLAGS = [
  { id: "g", label: "g", title: "Global (all matches)" },
  { id: "i", label: "i", title: "Case insensitive" },
  { id: "m", label: "m", title: "Multiline (^ $ per line)" },
  { id: "s", label: "s", title: "Dotall (. matches newline)" },
  { id: "u", label: "u", title: "Unicode" },
  { id: "y", label: "y", title: "Sticky" },
] as const;

type Mode = "match" | "replace";

const RegexTesterClient = () => {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("match");
  const [replacement, setReplacement] = useState("");

  const testResult = useMemo(
    () => (pattern.trim() ? testRegex(pattern, flags, text) : null),
    [pattern, flags, text],
  );

  const replaceResult = useMemo(() => {
    if (mode !== "replace" || !pattern.trim()) return null;
    return replaceWithRegex(pattern, flags, text, replacement);
  }, [mode, pattern, flags, text, replacement]);

  const isValidPattern = useMemo(() => {
    if (!pattern.trim()) return null;
    try {
      new RegExp(pattern, flags);
      return true;
    } catch {
      return false;
    }
  }, [pattern, flags]);

  const outputString =
    mode === "replace" && replaceResult?.valid
      ? replaceResult.result
      : mode === "match" && testResult?.valid
        ? testResult.matches.length === 0
          ? "No matches"
          : testResult.matches
              .map(
                (m, i) =>
                  `Match ${i + 1}: "${m.match}" at index ${m.index}${
                    m.groups.length
                      ? ` [groups: ${m.groups.map((g) => `"${g}"`).join(", ")}]`
                      : ""
                  }`,
              )
              .join("\n")
        : "";

  const jsSnippet = useMemo(() => {
    if (!pattern.trim()) return "";
    const escaped = pattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `const regex = new RegExp("${escaped}", "${flags}");`;
  }, [pattern, flags]);

  const handleClear = useCallback(() => {
    setPattern("");
    setText("");
    setReplacement("");
  }, []);

  const handleLoadSample = useCallback(() => {
    setPattern(SAMPLE_PATTERN);
    setText(SAMPLE_TEXT);
    setFlags("g");
    setReplacement("");
  }, []);

  const handleCommonPattern = useCallback(
    (preset: (typeof COMMON_PATTERNS)[number]) => {
      setPattern(preset.pattern);
      setText(preset.sample);
      setFlags("g");
    },
    [],
  );

  const toggleFlag = useCallback((flag: string) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, "") : prev + flag,
    );
  }, []);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-foreground">
              Regular expression
            </label>
            {pattern.trim() && isValidPattern !== null && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isValidPattern
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : "bg-red-500/10 text-red-700 dark:text-red-400"
                }`}
                role="status"
                aria-live="polite"
              >
                {isValidPattern ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Valid regex
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" aria-hidden />
                    Invalid regex
                  </>
                )}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              <RegexIcon className="h-3.5 w-3.5" aria-hidden />
              Load sample
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Clear
            </button>
            {pattern.trim() && jsSnippet && (
              <CopyButton
                text={jsSnippet}
                label="Copy as JavaScript"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Presets:
          </span>
          {COMMON_PATTERNS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleCommonPattern(preset)}
              title={preset.pattern}
              className="rounded border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              {preset.name}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="e.g. \w+ or \d{3}-\d{3}-\d{4}"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          spellCheck={false}
          aria-invalid={pattern.trim() ? !isValidPattern : undefined}
        />
        {pattern.trim() && testResult && !testResult.valid && (
          <p className="text-sm text-red-500" role="alert">
            {testResult.error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Flags:
          </span>
          {FLAGS.map(({ id, label, title }) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleFlag(id)}
              title={title}
              className={`rounded px-2 py-1 font-mono text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                flags.includes(id)
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      <section className="flex flex-wrap items-center gap-4 border-y border-border py-3">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
          <ModeButton
            active={mode === "match"}
            onClick={() => setMode("match")}
          >
            Match
          </ModeButton>
          <ModeButton
            active={mode === "replace"}
            onClick={() => setMode("replace")}
          >
            Replace
          </ModeButton>
        </div>
      </section>
      <section className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Test string
        </label>
        <TextArea
          placeholder="Enter or paste text to test against…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-30 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </section>
      {/* Replacement (Replace mode only) */}
      {mode === "replace" && (
        <section className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Replacement ($1, $2 for groups, $& for full match)
          </label>
          <input
            type="text"
            placeholder="e.g. [$&] or $1"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            spellCheck={false}
          />
        </section>
      )}
      ß{" "}
      {mode === "match" &&
        testResult?.valid &&
        testResult.matches.length > 0 &&
        text && (
          <section className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Preview (matches highlighted)
            </span>
            <div className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm text-foreground whitespace-pre-wrap wrap-break-word">
              <HighlightedText text={text} matches={testResult.matches} />
            </div>
          </section>
        )}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {mode === "match"
              ? testResult?.valid && testResult.matches.length > 0
                ? `${testResult.matches.length} match${testResult.matches.length === 1 ? "" : "es"}`
                : "Matches"
              : "Result"}
          </span>
          {outputString ? (
            <CopyButton
              text={outputString}
              label="Copy result"
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            />
          ) : null}
        </div>
        {mode === "match" && testResult?.valid && (
          <div className="space-y-2">
            {testResult.matches.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No matches found.
              </div>
            ) : (
              <ul className="space-y-2">
                {testResult.matches.map((m, i) => (
                  <li
                    key={`${i}-${m.index}`}
                    className="rounded-lg border border-border bg-muted/50 px-4 py-3 font-mono text-sm"
                  >
                    <span className="font-medium text-foreground">
                      Match {i + 1}
                    </span>
                    : &quot;{m.match}&quot; at index {m.index}
                    {m.groups.length > 0 && (
                      <span className="ml-2 text-muted-foreground">
                        [groups: {m.groups.map((g) => `"${g}"`).join(", ")}]
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {mode === "replace" && replaceResult && (
          <>
            {replaceResult.valid ? (
              <pre className="max-h-75 overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm text-foreground whitespace-pre-wrap wrap-break-word">
                <code>{replaceResult.result}</code>
              </pre>
            ) : (
              <div
                className="rounded-lg border border-red-500/50 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {replaceResult.error}
              </div>
            )}
          </>
        )}
        {!pattern.trim() && (
          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Enter a pattern and test string to see matches or replacement
            result.
          </div>
        )}
      </section>
      <details className="group rounded-lg border border-border bg-muted/30">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <ChevronRight
            className="h-4 w-4 transition-transform group-open:rotate-90"
            aria-hidden
          />
          <BookOpen className="h-4 w-4 text-accent" aria-hidden />
          Quick reference
        </summary>
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 font-medium text-foreground">
                Character classes
              </p>
              <p>
                . any · \d digit · \w word · \s space · [abc] set · [^abc]
                negated
              </p>
            </div>
            <div>
              <p className="mb-1 font-medium text-foreground">Quantifiers</p>
              <p>
                * 0+ · + 1+ · ? 0 or 1 · &#123;n&#125; n · &#123;n,m&#125; n to
                m · *? +? lazy
              </p>
            </div>
            <div>
              <p className="mb-1 font-medium text-foreground">Anchors</p>
              <p>^ start · $ end · \b word boundary · \B non-boundary</p>
            </div>
            <div>
              <p className="mb-1 font-medium text-foreground">Groups</p>
              <p>
                (x) capture · (?:x) non-capture · \1 backref · (?=x) lookahead ·
                (?!x) neg lookahead
              </p>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};

const HighlightedText = ({
  text,
  matches,
}: {
  text: string;
  matches: { match: string; index: number }[];
}) => {
  const sorted = [...matches].sort((a, b) => a.index - b.index);
  const segments: { type: "text" | "match"; value: string }[] = [];
  let last = 0;
  for (const m of sorted) {
    if (m.index > last) {
      segments.push({ type: "text", value: text.slice(last, m.index) });
    }
    segments.push({ type: "match", value: m.match });
    last = m.index + m.match.length;
  }
  if (last < text.length) {
    segments.push({ type: "text", value: text.slice(last) });
  }
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "match" ? (
          <mark
            key={i}
            className="rounded bg-amber-400/50 text-foreground dark:bg-amber-500/30"
          >
            {seg.value}
          </mark>
        ) : (
          <span key={i}>{seg.value}</span>
        ),
      )}
    </>
  );
};

const ModeButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
};

export default RegexTesterClient;
