"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Trash2,
  Key,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Info,
} from "lucide-react";

import { TextArea, CopyButton } from "@/components/shared";
import { decodeJwt, jwtPartToJson } from "@/lib/parsers";

// Classic jwt.io example token (header.payload.signature) — decodes to readable header/payload
const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const nowSec = () => Math.floor(Date.now() / 1000);

function formatTimestamp(ts: unknown): string | null {
  if (typeof ts !== "number") return null;
  const d = new Date(ts * 1000);
  return d.toISOString();
}

function formatAud(aud: unknown): string | null {
  if (aud == null) return null;
  if (typeof aud === "string") return aud;
  if (Array.isArray(aud)) return aud.map(String).join(", ");
  return String(aud);
}

function formatLifetime(iat: number, exp: number): string {
  const sec = exp - iat;
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)}h`;
  const days = (sec / 86400).toFixed(1);
  return `${days} day${days === "1.0" ? "" : "s"}`;
}

function timeUntilOrSince(ts: number): string {
  const sec = ts - nowSec();
  const abs = Math.abs(sec);
  if (abs < 60)
    return sec >= 0 ? "in less than a minute" : "less than a minute ago";
  if (abs < 3600) {
    const m = Math.round(abs / 60);
    return sec >= 0 ? `in ${m}m` : `${m}m ago`;
  }
  if (abs < 86400) {
    const h = (abs / 3600).toFixed(1);
    return sec >= 0 ? `in ${h}h` : `${h}h ago`;
  }
  const d = Math.round(abs / 86400);
  return sec >= 0
    ? `in ${d} day${d === 1 ? "" : "s"}`
    : `${d} day${d === 1 ? "" : "s"} ago`;
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
  const nbf = result.valid ? result.jwt.payload.nbf : null;
  const sub = result.valid ? result.jwt.payload.sub : null;
  const iss = result.valid ? result.jwt.payload.iss : null;
  const aud = result.valid ? formatAud(result.jwt.payload.aud) : null;

  const expFormatted = formatTimestamp(exp);
  const iatFormatted = formatTimestamp(iat);
  const nbfFormatted = formatTimestamp(nbf);

  const now = nowSec();
  const isExpired = typeof exp === "number" && exp < now;
  const isNotYetValid = typeof nbf === "number" && nbf > now;
  const hasNoExp = result.valid && (exp == null || typeof exp !== "number");
  const algNone = typeof alg === "string" && alg.toLowerCase() === "none";
  const lifetime =
    result.valid &&
    typeof iat === "number" &&
    typeof exp === "number" &&
    exp > iat
      ? formatLifetime(iat, exp)
      : null;
  const expRelative = typeof exp === "number" ? timeUntilOrSince(exp) : null;
  const nbfRelative = typeof nbf === "number" ? timeUntilOrSince(nbf) : null;

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
          className="min-h-30 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={!result.valid && input.trim().length > 0}
        />
      </section>

      {/* Decoded output */}
      {result.valid && (
        <div className="space-y-6">
          {/* Status warnings: expired, not yet valid, alg none, missing exp */}
          {(isExpired || isNotYetValid || algNone || hasNoExp) && (
            <div className="space-y-2">
              {isExpired && (
                <div
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
                  role="alert"
                >
                  <Clock className="h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    <strong>This token has expired.</strong>
                    {expRelative && ` (${expRelative})`}
                  </span>
                </div>
              )}
              {isNotYetValid && (
                <div
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
                  role="alert"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    <strong>This token is not yet valid (nbf).</strong>
                    {nbfRelative && ` ${nbfRelative}`}
                  </span>
                </div>
              )}
              {algNone && (
                <div
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
                  role="alert"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    <strong>Insecure:</strong> Algorithm &quot;none&quot; means
                    no signature verification. Do not trust this token.
                  </span>
                </div>
              )}
              {hasNoExp && !algNone && (
                <div
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground"
                  role="status"
                >
                  <Info className="h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    Token has no expiration claim (exp). It will not expire
                    automatically.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Summary: alg, standard claims, times, lifetime */}
          <section className="flex flex-wrap gap-x-6 gap-y-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            {alg && (
              <span>
                <span className="font-medium text-muted-foreground">
                  Algorithm:{" "}
                </span>
                <span className="font-mono text-foreground">{alg}</span>
              </span>
            )}
            {sub != null && (
              <span>
                <span className="font-medium text-muted-foreground">
                  Subject (sub):{" "}
                </span>
                <span className="font-mono text-foreground">{String(sub)}</span>
              </span>
            )}
            {iss != null && (
              <span>
                <span className="font-medium text-muted-foreground">
                  Issuer (iss):{" "}
                </span>
                <span className="font-mono text-foreground">{String(iss)}</span>
              </span>
            )}
            {aud != null && (
              <span>
                <span className="font-medium text-muted-foreground">
                  Audience (aud):{" "}
                </span>
                <span className="font-mono text-foreground break-all">
                  {aud}
                </span>
              </span>
            )}
            {iatFormatted && (
              <span>
                <span className="font-medium text-muted-foreground">
                  Issued at (iat):{" "}
                </span>
                <span className="font-mono text-foreground">
                  {iatFormatted}
                </span>
              </span>
            )}
            {nbfFormatted && (
              <span>
                <span className="font-medium text-muted-foreground">
                  Not before (nbf):{" "}
                </span>
                <span className="font-mono text-foreground">
                  {nbfFormatted}
                </span>
              </span>
            )}
            {expFormatted && (
              <span>
                <span className="font-medium text-muted-foreground">
                  Expires (exp):{" "}
                </span>
                <span className="font-mono text-foreground">
                  {expFormatted}
                </span>
                {expRelative && (
                  <span className="ml-1 text-muted-foreground">
                    ({expRelative})
                  </span>
                )}
              </span>
            )}
            {lifetime && (
              <span>
                <span className="font-medium text-muted-foreground">
                  Lifetime:{" "}
                </span>
                <span className="font-mono text-foreground">{lifetime}</span>
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
            <pre className="max-h-50 overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm text-foreground">
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
            <pre className="max-h-70 overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm text-foreground">
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
