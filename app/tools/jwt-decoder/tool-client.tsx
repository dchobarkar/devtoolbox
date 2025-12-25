"use client";

import { useState, useMemo, useCallback } from "react";
import { Trash2, Key, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

import { TextArea } from "@/components/shared/TextArea";
import { CopyButton } from "@/components/shared/CopyButton";
import { decodeJwt, jwtPartToJson } from "@/lib/parsers/jwt";

// Classic jwt.io example token (header.payload.signature) — decodes to readable header/payload
const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function formatTimestamp(ts: unknown): string | null {
  if (typeof ts !== "number") return null;
  const d = new Date(ts * 1000);
  return d.toISOString();
}

export function JwtDecoderClient() {
  const [input, setInput] = useState("");

  const result = useMemo(() => decodeJwt(input), [input]);

  const headerJson = useMemo(() => {
    if (!result.valid) return "";
    return jwtPartToJson(result.jwt.header);
  }, [result]);

  const payloadJson = useMemo(() => {
    if (!result.valid) return "";
    return jwtPartToJson(result.jwt.payload);
  }, [result]);

  const handleClear = useCallback(() => setInput(""), []);
  const handleLoadSample = useCallback(() => setInput(SAMPLE_JWT), []);

  const alg = result.valid ? (result.jwt.header.alg as string) : null;
  const exp = result.valid ? result.jwt.payload.exp : null;
  const iat = result.valid ? result.jwt.payload.iat : null;
  const expFormatted = formatTimestamp(exp);
  const iatFormatted = formatTimestamp(iat);

  return (
    <div className="space-y-6">
      {/* Security notice */}
      <div
        className="flex flex-wrap items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
        role="status"
      >
        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
        <span>
          Decoding only — this does not verify the signature. Do not use for
          security decisions. Always verify JWTs on the server.
        </span>
      </div>

      {/* Input panel */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-foreground">
              JWT token
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
                    Valid JWT
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" aria-hidden />
                    Invalid JWT
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
              <Key className="h-3.5 w-3.5" aria-hidden />
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
          placeholder="Paste your JWT token here (header.payload.signature)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          error={result.valid ? undefined : result.error}
          className="min-h-[120px] resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={!result.valid && input.trim().length > 0}
        />
      </section>

      {/* Decoded output */}
      {result.valid && (
        <div className="space-y-6">
          {/* Summary: alg, exp, iat */}
          <section className="flex flex-wrap gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            {alg && (
              <span>
                <span className="font-medium text-muted-foreground">
                  Algorithm:{" "}
                </span>
                <span className="font-mono text-foreground">{alg}</span>
              </span>
            )}
            {iatFormatted && (
              <span>
                <span className="font-medium text-muted-foreground">
                  Issued at:{" "}
                </span>
                <span className="font-mono text-foreground">{iatFormatted}</span>
              </span>
            )}
            {expFormatted && (
              <span>
                <span className="font-medium text-muted-foreground">
                  Expires:{" "}
                </span>
                <span className="font-mono text-foreground">{expFormatted}</span>
              </span>
            )}
          </section>

          {/* Header */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Header
              </span>
              <CopyButton
                text={headerJson}
                label="Copy header"
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              />
            </div>
            <pre className="max-h-[200px] overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm text-foreground">
              <code>{headerJson}</code>
            </pre>
          </section>

          {/* Payload */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Payload
              </span>
              <CopyButton
                text={payloadJson}
                label="Copy payload"
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              />
            </div>
            <pre className="max-h-[280px] overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm text-foreground">
              <code>{payloadJson}</code>
            </pre>
          </section>

          {/* Signature (informational) */}
          <section className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Signature (not verified)
            </span>
            <p className="rounded-lg border border-border bg-muted/30 px-4 py-2 font-mono text-xs text-muted-foreground break-all">
              {result.jwt.signature}
            </p>
          </section>
        </div>
      )}

      {input.trim() && !result.valid && (
        <div
          className="rounded-lg border border-red-500/50 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {result.error}
        </div>
      )}

      {!input.trim() && (
        <div className="rounded-lg border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Paste a JWT token above to decode its header and payload.
        </div>
      )}
    </div>
  );
}
