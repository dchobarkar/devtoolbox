"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import CopyButton from "@/components/shared/CopyButton";
import {
  parseTimestamp,
  nowUnixSeconds,
  nowUnixMs,
} from "@/lib/parsers/timestamp";

const SAMPLE_UNIX = "1707350400";

const TimestampClient = () => {
  const [input, setInput] = useState("");

  const result = useMemo(() => parseTimestamp(input), [input]);

  const handleClear = useCallback(() => setInput(""), []);
  const handleNow = useCallback(() => setInput(String(nowUnixSeconds())), []);
  const handleNowMs = useCallback(() => setInput(String(nowUnixMs())), []);
  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_UNIX);
  }, []);

  const outputRows = result.valid
    ? [
        { label: "Local", value: result.localString!, copyValue: result.localString! },
        { label: "UTC", value: result.utcString!, copyValue: result.utcString! },
        { label: "ISO 8601", value: result.iso!, copyValue: result.iso! },
        { label: "RFC 2822", value: result.rfc2822!, copyValue: result.rfc2822! },
        { label: "Unix (seconds)", value: String(result.unixSeconds!), copyValue: String(result.unixSeconds!) },
        { label: "Unix (ms)", value: String(result.unixMs!), copyValue: String(result.unixMs!) },
        { label: "Relative", value: result.relative!, copyValue: result.relative! },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="timestamp-input">
              Timestamp or date
            </label>
            {input.trim() && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  result.valid
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : "bg-red-500/10 text-red-700 dark:text-red-400"
                }`}
                role="status"
                aria-live="polite"
              >
                {result.valid ? (
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
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleNow}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Now (seconds)
            </button>
            <button
              type="button"
              onClick={handleNowMs}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Now (ms)
            </button>
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
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
        <input
          id="timestamp-input"
          type="text"
          placeholder="e.g. 1707350400 or 2024-02-08T12:00:00.000Z"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-invalid={input.trim() ? !result.valid : undefined}
          aria-describedby={result.valid ? undefined : "timestamp-error"}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {!result.valid && result.error && input.trim() && (
          <p id="timestamp-error" className="text-sm text-red-500" role="alert">
            {result.error}
          </p>
        )}
      </section>

      <section className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Converted formats
        </span>
        {result.valid && outputRows.length > 0 ? (
          <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
            <ul className="divide-y divide-border">
              {outputRows.map((row) => (
                <li
                  key={row.label}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:py-2.5"
                >
                  <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">
                    {row.label}
                  </span>
                  <code className="min-w-0 flex-1 break-all font-mono text-sm text-foreground">
                    {row.value}
                  </code>
                  <CopyButton
                    text={row.copyValue}
                    label={`Copy ${row.label}`}
                    className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : input.trim() && !result.valid ? (
          <div
            className="rounded-lg border border-red-500/50 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            Enter a valid Unix timestamp (seconds or milliseconds) or a date string (e.g. ISO 8601).
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Enter a timestamp or date to see converted formats. Supports Unix seconds (10 digits), milliseconds (13), and date strings like ISO 8601.
          </div>
        )}
      </section>
    </div>
  );
};

export default TimestampClient;
