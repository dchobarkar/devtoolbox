"use client";

import { useState, useMemo, useCallback } from "react";
import { Trash2, FileJson, CheckCircle2, XCircle } from "lucide-react";

import { TextArea, CopyButton } from "@/components/shared";
import {
  validateJson,
  formatJson,
  minifyJson,
  type IndentStyle,
} from "@/lib/formatters";

const SAMPLE_JSON = `{
  "name": "DevToolbox",
  "version": "1.0.0",
  "tools": ["JSON Formatter", "JWT Decoder", "Base64"],
  "privacy": "All processing runs locally in your browser"
}`;

type Mode = "format" | "minify";

export function JsonFormatterClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState<IndentStyle>("2");

  const validation = useMemo(() => validateJson(input), [input]);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    if (!validation.valid) return "";
    return mode === "format" ? formatJson(input, indent) : minifyJson(input);
  }, [input, mode, indent, validation.valid]);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
  }, []);

  return (
    <div className="space-y-6">
      {/* Input panel */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-foreground">
              JSON input
            </label>
            {input.trim() && (
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
                    Valid JSON
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" aria-hidden />
                    Invalid JSON
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
              <FileJson className="h-3.5 w-3.5" aria-hidden />
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
          placeholder='Paste or type JSON here… e.g. {"key": "value"}'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          error={validation.valid ? undefined : validation.error?.message}
          className="min-h-45 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={!validation.valid}
          aria-describedby={!validation.valid ? "json-error" : undefined}
        />
        {!validation.valid && validation.error && (
          <p id="json-error" className="text-sm text-red-500" role="alert">
            {validation.error.line != null && validation.error.column != null
              ? `Line ${validation.error.line}, column ${validation.error.column}: ${validation.error.message}`
              : validation.error.message}
          </p>
        )}
      </section>

      {/* Toolbar: mode + indent + copy */}
      <section className="flex flex-wrap items-center gap-4 border-y border-border py-3">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
          <ModeButton
            active={mode === "format"}
            onClick={() => setMode("format")}
          >
            Format
          </ModeButton>
          <ModeButton
            active={mode === "minify"}
            onClick={() => setMode("minify")}
          >
            Minify
          </ModeButton>
        </div>
        {mode === "format" && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Indent:
            </span>
            <div className="flex gap-0.5">
              {(["2", "4", "tab"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIndent(opt)}
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                    indent === opt
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {opt === "tab" ? "Tab" : `${opt} spaces`}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <CopyButton
            text={output}
            label="Copy output"
            disabled={!output}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          />
        </div>
      </section>

      {/* Output panel */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Output
          </span>
          {output ? (
            <CopyButton
              text={output}
              label="Copy output"
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            />
          ) : null}
        </div>
        {validation.valid && output ? (
          <pre
            className="max-h-100 overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm text-foreground"
            role="region"
            aria-label="Formatted JSON output"
          >
            <code>{output}</code>
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
              ? "Valid JSON will appear here."
              : "Paste or type JSON to format or minify."}
          </div>
        )}
      </section>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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
}
