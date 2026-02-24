"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Trash2,
  FileCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import TextArea from "@/components/shared/TextArea";
import CopyButton from "@/components/shared/CopyButton";
import {
  parseEnv,
  validateEnv,
  formatEnv,
  toEnvExample,
  toJson,
  parseJsonToEnv,
  type FormatEnvOptions,
  type EnvSpacing,
} from "@/lib/formatters/env";

const SAMPLE_ENV = `# App config
NODE_ENV=development
API_URL=https://api.example.com

# Database (duplicate key for demo)
DATABASE_URL=postgres://localhost/mydb
DATABASE_URL=postgres://other

# Secrets - use .env.example for template
API_KEY=sk-1234567890
`;

type OutputFormat = "formatted" | "minified" | "example" | "json";

const EnvFormatterClient = () => {
  const [input, setInput] = useState("");
  const [sortKeys, setSortKeys] = useState(false);
  const [spacing, setSpacing] = useState<EnvSpacing>("none");
  const [exportPrefix, setExportPrefix] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("formatted");
  const [lineEnding, setLineEnding] = useState<"lf" | "crlf">("lf");

  const parsed = useMemo(() => {
    const fromJson = parseJsonToEnv(input);
    if (fromJson) return fromJson;
    return parseEnv(input);
  }, [input]);

  const validation = useMemo(() => validateEnv(parsed), [parsed]);
  const isJsonInput = useMemo(() => {
    const raw = input.trim();
    if (!raw.startsWith("{")) return false;
    try {
      const data = JSON.parse(raw);
      return data !== null && typeof data === "object" && !Array.isArray(data);
    } catch {
      return false;
    }
  }, [input]);

  const formatOptions: FormatEnvOptions = useMemo(
    () => ({
      sortKeys,
      spacing,
      trailingNewline: true,
      exportPrefix,
      minify: outputFormat === "minified",
      lineEnding,
    }),
    [sortKeys, spacing, exportPrefix, outputFormat, lineEnding],
  );

  const output = useMemo(() => {
    if (!input.trim()) return "";
    if (outputFormat === "json") return toJson(parsed, 2);
    if (outputFormat === "example") {
      return toEnvExample(parsed, "<value>", lineEnding);
    }
    return formatEnv(parsed, formatOptions);
  }, [input, parsed, outputFormat, formatOptions, lineEnding]);

  const displayOutput = output;
  const hasEntries = parsed.entries.length > 0;

  const handleClear = useCallback(() => setInput(""), []);
  const handleLoadSample = useCallback(() => setInput(SAMPLE_ENV), []);

  const hasDuplicates = validation.duplicateKeys.length > 0;

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-foreground">
              {isJsonInput ? "JSON input (as env)" : ".env input"}
            </label>
            {input.trim() && (
              <>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    validation.valid
                      ? "bg-green-500/10 text-green-700 dark:text-green-400"
                      : "bg-red-500/10 text-red-700 dark:text-red-400"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {validation.valid ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      Valid
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" aria-hidden />
                      Invalid
                    </>
                  )}
                </span>
                {hasDuplicates && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
                    role="status"
                    title={`Duplicate keys: ${validation.duplicateKeys.join(", ")}`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                    {validation.duplicateKeys.length} duplicate key
                    {validation.duplicateKeys.length > 1 ? "s" : ""}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              <FileCode className="h-3.5 w-3.5" aria-hidden />
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
          </div>
        </div>
        <TextArea
          placeholder={'Paste .env (KEY=value) or JSON ({ "KEY": "value" })…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          error={
            !validation.valid && validation.errors.length > 0
              ? validation.errors[0]
              : undefined
          }
          className="min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={!validation.valid}
        />
        {validation.errors.length > 1 && (
          <ul
            className="text-sm text-red-500 list-disc list-inside"
            role="list"
          >
            {validation.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
        {hasDuplicates && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Duplicate keys (last value wins):{" "}
            {validation.duplicateKeys.join(", ")}
          </p>
        )}
      </section>

      <section className="flex flex-wrap items-center gap-4 border-y border-border py-3">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
          <OptionToggle
            active={sortKeys}
            onClick={() => setSortKeys((v) => !v)}
            label="Sort keys"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Spacing:
          </span>
          {(["none", "around"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSpacing(opt)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                spacing === opt
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {opt === "around" ? "KEY = value" : "KEY=value"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Output:
          </span>
          {(
            [
              { id: "formatted" as const, label: ".env" },
              { id: "minified" as const, label: "Minified" },
              { id: "example" as const, label: ".env.example" },
              { id: "json" as const, label: "JSON" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setOutputFormat(id)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                outputFormat === id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {outputFormat !== "json" && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Line ending:
            </span>
            {(["lf", "crlf"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setLineEnding(opt)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                  lineEnding === opt
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {opt === "crlf" ? "CRLF" : "LF"}
              </button>
            ))}
          </div>
        )}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={exportPrefix}
            onChange={(e) => setExportPrefix(e.target.checked)}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <span>
            Add <code className="rounded bg-muted/50 px-1">export</code> prefix
          </span>
        </label>
        {hasEntries && outputFormat === "example" && (
          <span className="text-xs text-muted-foreground">
            Values →{" "}
            <code className="rounded bg-muted/50 px-1">&lt;value&gt;</code>
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <CopyButton
            text={displayOutput}
            label="Copy output"
            disabled={!displayOutput}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          />
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {outputFormat === "json"
              ? "JSON output"
              : outputFormat === "example"
                ? ".env.example output"
                : outputFormat === "minified"
                  ? "Minified .env output"
                  : "Formatted output"}
          </span>
          {displayOutput ? (
            <CopyButton
              text={displayOutput}
              label="Copy output"
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            />
          ) : null}
        </div>
        {displayOutput ? (
          <pre
            className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm text-foreground whitespace-pre-wrap break-all"
            role="region"
            aria-label={
              outputFormat === "json"
                ? "JSON output"
                : outputFormat === "example"
                  ? ".env.example output"
                  : "Formatted .env output"
            }
          >
            <code>{displayOutput}</code>
          </pre>
        ) : input.trim() && !validation.valid ? (
          <div
            className="rounded-lg border border-red-500/50 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            Fix the errors above to see formatted output.
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center font-mono text-sm text-muted-foreground">
            {input.trim()
              ? "Formatted output will appear here."
              : "Paste .env or JSON to format. Comments and blank lines are preserved for .env."}
          </div>
        )}
      </section>
    </div>
  );
};

const OptionToggle = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
      active
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {label}
  </button>
);

export default EnvFormatterClient;
