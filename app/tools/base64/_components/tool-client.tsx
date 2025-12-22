"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Trash2,
  Binary,
  CheckCircle2,
  XCircle,
  Info,
  FileUp,
} from "lucide-react";

import { TextArea, CopyButton } from "@/components/shared";
import {
  encodeBase64,
  decodeBase64,
  encodeBase64FromBytes,
  wrapBase64Lines,
} from "@/lib/encoders";

const SAMPLE_PLAIN = "Hello, DevToolbox! Encode me to Base64.";
const SAMPLE_BASE64 = "SGVsbG8sIERldlRvb2xib3ghIEVuY29kZSBtZSB0byBCYXNlNjQu";
const MIME_LINE_LENGTH = 76;

type Mode = "encode" | "decode";

export function Base64Client() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [dataUri, setDataUri] = useState(false);
  const [dataUriMime, setDataUriMime] = useState("text/plain");
  const [fileEncodedResult, setFileEncodedResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const decodeResult = useMemo(
    () => (mode === "decode" ? decodeBase64(input, urlSafe) : null),
    [input, mode, urlSafe],
  );

  const rawEncoded = useMemo(() => {
    if (mode !== "encode") return "";
    if (fileEncodedResult !== null) return fileEncodedResult;
    if (!input) return "";
    return encodeBase64(input, urlSafe);
  }, [mode, input, urlSafe, fileEncodedResult]);

  const output = useMemo(() => {
    if (mode === "decode") {
      return decodeResult?.success ? decodeResult.value : "";
    }
    if (!rawEncoded) return "";
    // Data URIs use single-line base64; wrap only affects plain output
    const forDataUri = dataUri ? rawEncoded : null;
    const plainOut = wrapLines
      ? wrapBase64Lines(rawEncoded, MIME_LINE_LENGTH)
      : rawEncoded;
    if (dataUri && forDataUri !== null) {
      return `data:${dataUriMime};base64,${forDataUri}`;
    }
    return plainOut;
  }, [mode, rawEncoded, wrapLines, dataUri, dataUriMime, decodeResult]);

  const isValidDecode =
    mode === "decode" &&
    input.trim().length > 0 &&
    decodeResult !== null &&
    decodeResult.success;
  const isInvalidDecode =
    mode === "decode" &&
    input.trim().length > 0 &&
    decodeResult !== null &&
    !decodeResult.success;

  const handleClear = useCallback(() => {
    setInput("");
    setFileEncodedResult(null);
  }, []);

  const handleLoadSample = useCallback(() => {
    setInput(mode === "encode" ? SAMPLE_PLAIN : SAMPLE_BASE64);
    setFileEncodedResult(null);
  }, [mode]);

  const handleFileEncode = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const buf = reader.result;
        if (buf instanceof ArrayBuffer) {
          const base64 = encodeBase64FromBytes(new Uint8Array(buf), urlSafe);
          setFileEncodedResult(base64);
          setInput("");
        }
      };
      reader.readAsArrayBuffer(file);
      e.target.value = "";
    },
    [urlSafe],
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setFileEncodedResult(null);
  }, []);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    if (m === "decode") setFileEncodedResult(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Info: encoding vs encryption */}
      <div
        className="flex flex-wrap items-start gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
        role="status"
      >
        <Info className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
        <span>
          Base64 is encoding, not encryption. Do not use it to protect secrets.
        </span>
      </div>

      {/* Mode + options */}
      <section className="flex flex-wrap items-center gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
          <ModeButton
            active={mode === "encode"}
            onClick={() => handleModeChange("encode")}
          >
            Encode
          </ModeButton>
          <ModeButton
            active={mode === "decode"}
            onClick={() => handleModeChange("decode")}
          >
            Decode
          </ModeButton>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <span>URL-safe</span>
          <span className="text-muted-foreground">(-_ instead of +/)</span>
        </label>
        {mode === "encode" && (
          <>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={wrapLines}
                onChange={(e) => setWrapLines(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <span>Wrap lines (76 chars, MIME)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={dataUri}
                onChange={(e) => setDataUri(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <span>Data URI</span>
            </label>
            {dataUri && (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <span className="text-muted-foreground">MIME type:</span>
                <input
                  type="text"
                  value={dataUriMime}
                  onChange={(e) => setDataUriMime(e.target.value)}
                  placeholder="text/plain"
                  className="w-32 rounded border border-border bg-background px-2 py-1 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
            )}
          </>
        )}
      </section>

      {/* Input panel */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-foreground">
              {mode === "encode" ? "Text to encode" : "Base64 to decode"}
            </label>
            {mode === "decode" && input.trim() && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  decodeResult?.success
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : "bg-red-500/10 text-red-700 dark:text-red-400"
                }`}
                role="status"
                aria-live="polite"
              >
                {decodeResult?.success ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Valid Base64
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" aria-hidden />
                    Invalid Base64
                  </>
                )}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {mode === "encode" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  onChange={handleFileEncode}
                  className="sr-only"
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  <FileUp className="h-3.5 w-3.5" aria-hidden />
                  Encode from file
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              <Binary className="h-3.5 w-3.5" aria-hidden />
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
        {mode === "encode" && fileEncodedResult !== null && (
          <p className="text-xs text-muted-foreground">
            Output from uploaded file. Type text or clear to encode text instead.
          </p>
        )}
        <TextArea
          placeholder={
            mode === "encode"
              ? "Enter text to encode, or use “Encode from file”…"
              : "Paste Base64 string to decode…"
          }
          value={input}
          onChange={handleInputChange}
          error={isInvalidDecode ? decodeResult?.error : undefined}
          className="min-h-[140px] resize-y font-mono text-sm"
          spellCheck={mode === "encode"}
          aria-invalid={isInvalidDecode}
        />
      </section>

      {/* Output panel */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {mode === "encode"
              ? fileEncodedResult !== null
                ? "Base64 output (from file)"
                : "Base64 output"
              : "Decoded text"}
          </span>
          {output ? (
            <CopyButton
              text={output}
              label="Copy output"
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            />
          ) : null}
        </div>
        {output ? (
          <pre
            className="max-h-[300px] overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm text-foreground whitespace-pre-wrap break-all"
            role="region"
            aria-label={mode === "encode" ? "Base64 output" : "Decoded text"}
          >
            <code>{output}</code>
          </pre>
        ) : input.trim() && isInvalidDecode ? (
          <div
            className="rounded-lg border border-red-500/50 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {decodeResult?.error}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center font-mono text-sm text-muted-foreground">
            {input.trim() || fileEncodedResult !== null
              ? mode === "decode"
                ? "Fix the invalid Base64 above."
                : "Output will appear here."
              : mode === "encode"
                ? "Enter text to encode or use “Encode from file”."
                : "Paste Base64 to decode."}
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
