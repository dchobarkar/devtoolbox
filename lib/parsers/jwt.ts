interface JwtDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  headerRaw: string;
  payloadRaw: string;
}

type JwtDecodeResult =
  | { valid: true; jwt: JwtDecoded }
  | { valid: false; error: string };

const base64UrlDecode = (str: string): string => {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }
  return atob(base64);
};

const decodeJwt = (token: string): JwtDecodeResult => {
  const trimmed = token.trim();
  if (!trimmed) {
    return { valid: false, error: "Empty token" };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      valid: false,
      error: "Invalid JWT format: expected 3 parts separated by dots",
    };
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  if (!headerB64 || !payloadB64 || !signatureB64) {
    return {
      valid: false,
      error: "Invalid JWT: missing header, payload, or signature",
    };
  }

  try {
    const headerRaw = base64UrlDecode(headerB64);
    const payloadRaw = base64UrlDecode(payloadB64);
    const header = JSON.parse(headerRaw) as Record<string, unknown>;
    const payload = JSON.parse(payloadRaw) as Record<string, unknown>;

    if (typeof header !== "object" || header === null) {
      return {
        valid: false,
        error: "Invalid JWT: header is not a JSON object",
      };
    }
    if (typeof payload !== "object" || payload === null) {
      return {
        valid: false,
        error: "Invalid JWT: payload is not a JSON object",
      };
    }

    return {
      valid: true,
      jwt: {
        header,
        payload,
        signature: signatureB64,
        headerRaw,
        payloadRaw,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Decode failed";
    return {
      valid: false,
      error: `Invalid JWT: ${message}`,
    };
  }
};

const jwtPartToJson = (obj: Record<string, unknown>, indent = 2): string => {
  return JSON.stringify(obj, null, indent);
};

export type { JwtDecoded, JwtDecodeResult };
export { decodeJwt, jwtPartToJson };
