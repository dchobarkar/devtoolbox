export interface Tool {
  name: string;
  slug: string;
  category: string;
  description: string;
  href: string;
}

export const tools: Tool[] = [
  {
    name: "JSON Formatter",
    slug: "json-formatter",
    category: "Formatter",
    description: "Format, minify, and validate JSON with syntax highlighting.",
    href: "/tools/json-formatter",
  },
  {
    name: "JWT Decoder",
    slug: "jwt-decoder",
    category: "Decoder",
    description: "Decode JWT header and payload with pretty-printed JSON.",
    href: "/tools/jwt-decoder",
  },
  {
    name: "Base64",
    slug: "base64",
    category: "Encoder",
    description: "Encode and decode text to and from Base64.",
    href: "/tools/base64",
  },
  {
    name: "Regex Tester",
    slug: "regex-tester",
    category: "Tester",
    description: "Test and debug regular expressions with live matches.",
    href: "/tools/regex-tester",
  },
  {
    name: "Timestamp Converter",
    slug: "timestamp",
    category: "Converter",
    description: "Convert Unix timestamps and human-readable dates.",
    href: "/tools/timestamp",
  },
  {
    name: ".env Formatter",
    slug: "env-formatter",
    category: "Formatter",
    description: "Parse and structure environment variable files.",
    href: "/tools/env-formatter",
  },
];
