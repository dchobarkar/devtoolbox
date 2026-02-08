/**
 * Encode a UTF-8 string to Base64.
 * Uses unescape(encodeURIComponent(s)) for Unicode support in all browsers.
 */
export function encodeBase64(text: string, urlSafe = false): string {
  if (text.length === 0) return "";
  try {
    const base64 = btoa(unescape(encodeURIComponent(text)));
    if (urlSafe) {
      return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    return base64;
  } catch {
    return "";
  }
}

export type DecodeResult =
  | { success: true; value: string }
  | { success: false; error: string };

/**
 * Decode Base64 to a UTF-8 string.
 * Supports URL-safe Base64 (-_ instead of +/).
 */
export function decodeBase64(encoded: string, urlSafe = false): DecodeResult {
  const trimmed = encoded.trim().replace(/\s/g, "");
  if (trimmed.length === 0) {
    return { success: true, value: "" };
  }

  let base64 = trimmed;
  if (urlSafe) {
    base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
  }
  // Add padding (Base64 length must be multiple of 4)
  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }

  // Validate Base64 alphabet (after URL-safe normalization)
  if (!/^[A-Za-z0-9+/=]+$/.test(base64)) {
    return {
      success: false,
      error: "Invalid Base64: contains invalid characters",
    };
  }

  try {
    const binary = atob(base64);
    try {
      const value = decodeURIComponent(escape(binary));
      return { success: true, value };
    } catch {
      // Binary or Latin1: return as-is
      return { success: true, value: binary };
    }
  } catch {
    return { success: false, error: "Invalid Base64: decoding failed" };
  }
}

/**
 * Encode raw bytes (e.g. from a file) to Base64.
 */
export function encodeBase64FromBytes(
  bytes: Uint8Array,
  urlSafe = false,
): string {
  if (bytes.length === 0) return "";
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64 = btoa(binary);
  if (urlSafe) {
    base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return base64;
}

/**
 * Wrap Base64 string into lines of the given length (MIME standard is 76).
 */
export function wrapBase64Lines(base64: string, lineLength = 76): string {
  if (lineLength < 1 || base64.length <= lineLength) return base64;
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += lineLength) {
    lines.push(base64.slice(i, i + lineLength));
  }
  return lines.join("\n");
}
