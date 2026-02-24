"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Plus,
  Minus,
  Code2,
} from "lucide-react";

import CopyButton from "@/components/shared/CopyButton";
import {
  parseTimestamp,
  nowUnixSeconds,
  nowUnixMs,
  addSubtractMs,
  getCodeSnippets,
} from "@/lib/parsers/timestamp";

const SEC = 1000;
const HOUR = 60 * 60 * SEC;
const DAY = 24 * HOUR;

const SAMPLE_UNIX = "1707350400";

const toDateTimeLocal = (timestampMs: number): string => {
  const d = new Date(timestampMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
};

const fromDateTimeLocal = (value: string): number | null => {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : Math.floor(ms / SEC);
};

const TimestampClient = () => {
  const [input, setInput] = useState("");
  const [use24Hour, setUse24Hour] = useState(true);
  const [dateTimeLocal, setDateTimeLocal] = useState("");

  const result = useMemo(() => parseTimestamp(input), [input]);

  useEffect(() => {
    if (!input.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDateTimeLocal("");
      return;
    }
    if (result.valid && result.timestampMs != null) {
      setDateTimeLocal(toDateTimeLocal(result.timestampMs));
    } else {
      setDateTimeLocal("");
    }
  }, [input, result.valid, result.timestampMs]);

  const handleClear = useCallback(() => {
    setInput("");
    setDateTimeLocal("");
  }, []);
  const handleNow = useCallback(() => setInput(String(nowUnixSeconds())), []);
  const handleNowMs = useCallback(() => setInput(String(nowUnixMs())), []);
  const handleLoadSample = useCallback(() => setInput(SAMPLE_UNIX), []);

  const handlePickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setDateTimeLocal(v);
      const sec = fromDateTimeLocal(v);
      if (sec !== null) setInput(String(sec));
    },
    [],
  );

  const adjustTime = useCallback(
    (deltaMs: number) => {
      if (!result.valid || result.timestampMs == null) return;
      const next = addSubtractMs(result.timestampMs, deltaMs);
      setInput(String(Math.floor(next / SEC)));
    },
    [result.valid, result.timestampMs],
  );

  const outputRows = result.valid
    ? [
        {
          label: use24Hour ? "Local (24h)" : "Local (12h)",
          value: use24Hour ? result.localString24! : result.localString!,
          copyValue: use24Hour ? result.localString24! : result.localString!,
        },
        {
          label: "UTC",
          value: result.utcString!,
          copyValue: result.utcString!,
        },
        {
          label: "ISO 8601",
          value: result.iso!,
          copyValue: result.iso!,
        },
        {
          label: "RFC 2822",
          value: result.rfc2822!,
          copyValue: result.rfc2822!,
        },
        {
          label: "Unix (seconds)",
          value: String(result.unixSeconds!),
          copyValue: String(result.unixSeconds!),
        },
        {
          label: "Unix (ms)",
          value: String(result.unixMs!),
          copyValue: String(result.unixMs!),
        },
        {
          label: "Relative",
          value: result.relative!,
          copyValue: result.relative!,
        },
        {
          label: "Weekday",
          value: result.weekday!,
          copyValue: result.weekday!,
        },
        {
          label: "Day of year",
          value: result.dayOfYear!,
          copyValue: result.dayOfYear!,
        },
        {
          label: "Week number",
          value: result.weekNumber!,
          copyValue: result.weekNumber!,
        },
      ]
    : [];

  const snippets =
    result.valid && result.unixSeconds != null && result.unixMs != null
      ? getCodeSnippets(result.unixSeconds, result.unixMs)
      : null;

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="timestamp-input"
            >
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
              Now (s)
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
              Sample
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            id="timestamp-input"
            type="text"
            placeholder="e.g. 1707350400 or 2024-02-08T12:00:00.000Z"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-invalid={input.trim() ? !result.valid : undefined}
            aria-describedby={result.valid ? undefined : "timestamp-error"}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground sm:shrink-0">
            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="datetime-local"
              value={dateTimeLocal}
              onChange={handlePickerChange}
              className="bg-transparent font-mono text-sm text-foreground focus:outline-none focus:ring-0"
              aria-label="Pick date and time"
            />
          </label>
        </div>
        {!result.valid && result.error && input.trim() && (
          <p id="timestamp-error" className="text-sm text-red-500" role="alert">
            {result.error}
          </p>
        )}
      </section>

      {result.valid && result.timestampMs != null && (
        <section className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            Adjust:
          </span>
          <button
            type="button"
            onClick={() => adjustTime(-HOUR)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            title="Subtract 1 hour"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden /> 1h
          </button>
          <button
            type="button"
            onClick={() => adjustTime(HOUR)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            title="Add 1 hour"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> 1h
          </button>
          <button
            type="button"
            onClick={() => adjustTime(-DAY)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            title="Subtract 1 day"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden /> 1d
          </button>
          <button
            type="button"
            onClick={() => adjustTime(DAY)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            title="Add 1 day"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> 1d
          </button>
        </section>
      )}

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Converted formats
          </span>
          {result.valid && (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={use24Hour}
                onChange={(e) => setUse24Hour(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border text-accent focus:ring-accent"
              />
              24-hour
            </label>
          )}
        </div>
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
            Enter a valid Unix timestamp (seconds or milliseconds) or a date
            string (e.g. ISO 8601).
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Enter a timestamp or date to see converted formats. Supports Unix
            seconds (10 digits), milliseconds (13), and date strings like ISO
            8601.
          </div>
        )}
      </section>

      {snippets && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium text-muted-foreground">
              Code snippets
            </span>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
            <ul className="divide-y divide-border">
              <li className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">
                  JavaScript
                </span>
                <code className="min-w-0 flex-1 font-mono text-sm text-foreground">
                  {snippets.jsTimestamp}
                </code>
                <CopyButton
                  text={snippets.jsTimestamp}
                  label="Copy JavaScript"
                  className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                />
              </li>
              <li className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">
                  JS (current)
                </span>
                <code className="min-w-0 flex-1 font-mono text-sm text-foreground">
                  {snippets.jsCurrentSeconds}
                </code>
                <CopyButton
                  text={snippets.jsCurrentSeconds}
                  label="Copy JS current"
                  className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                />
              </li>
              <li className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">
                  Python
                </span>
                <code className="min-w-0 flex-1 font-mono text-sm text-foreground">
                  {snippets.pythonTimestamp}
                </code>
                <CopyButton
                  text={snippets.pythonTimestamp}
                  label="Copy Python"
                  className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                />
              </li>
              <li className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">
                  Python (current)
                </span>
                <code className="min-w-0 flex-1 font-mono text-sm text-foreground">
                  {snippets.pythonCurrent}
                </code>
                <CopyButton
                  text={snippets.pythonCurrent}
                  label="Copy Python current"
                  className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                />
              </li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            Python: use{" "}
            <code className="rounded bg-muted/50 px-1">
              from datetime import datetime
            </code>{" "}
            or <code className="rounded bg-muted/50 px-1">import time</code> as
            needed.
          </p>
        </section>
      )}
    </div>
  );
};

export default TimestampClient;
