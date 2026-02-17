# DevToolbox

A privacy-first browser-based platform offering essential developer utilities — built to simplify everyday development workflows.

All tools run locally in your browser. No data is uploaded to any server.

---

## 🚀 Overview

DevToolbox is a multi-tool developer utility platform designed to provide fast, reliable, and privacy-friendly tools for common engineering tasks.

Instead of relying on multiple scattered websites, DevToolbox centralizes essential utilities into one clean workspace.

---

## 🧰 Available Tools

• JSON Formatter — Format and validate JSON instantly  
• JWT Decoder — Decode token payloads in real time  
• Base64 Encoder / Decoder — Encode or decode text  
• Regex Tester — Test and debug regular expressions  
• Timestamp Converter — Convert Unix and human dates  
• .env Formatter — Parse and structure environment files

---

## 🔒 Privacy First

All tools process data locally within your browser.

No files, tokens, or text inputs are uploaded or stored on any server.

---

## 🛠️ Tech Stack

• Next.js (App Router)  
• TypeScript  
• TailwindCSS  
• shadcn/ui  
• Lucide Icons

---

## 🧱 Architecture

The platform follows Next.js App Router conventions and a modular structure:

```structure
/app                    # App Router (layout, page, error, loading, not-found)
  /tools/               # layout.tsx (ToolNavbar + main + ToolFooter)
  /tools/[slug]         # One route per tool; page.tsx + _components/ (colocated, private)
/components             # Shared UI (import from direct files)
  /layout               # Header.tsx, Footer.tsx
  /shared               # TextArea.tsx, CopyButton.tsx, ToolCard.tsx, CodeBlock.tsx
  /tool                 # ToolNavbar.tsx, ToolFooter.tsx, ToolPageHeader.tsx
/lib                    # Business logic (import from direct files)
  /formatters/json.ts   # JSON formatter
  /encoders/base64.ts   # Base64 encoder/decoder
  /parsers/jwt.ts       # JWT parser
  tools.ts              # Tool list, getToolBySlug(), getToolMetadata()
```

- **Colocation:** Tool-specific client components live in `app/tools/<slug>/_components/` (underscore = private, not a route).
- **Imports:** Use direct file paths (e.g. `@/components/tool/ToolNavbar`, `@/lib/formatters/json`). No index/barrel files.
- **Tool pages:** Each tool page uses `getToolBySlug(slug)` and `getToolMetadata(slug)` from `@/lib/tools` and calls `notFound()` when missing.

Each tool runs as an isolated client-side module.

---

## 📦 Installation

```bash
git clone https://github.com/dchobarkar/devtoolbox.git

cd devtoolbox

pnpm install

pnpm run dev
```

---

## 🌐 Deployment

The platform is optimized for deployment on Vercel with zero backend configuration.

---

## 🗺️ Roadmap

• Image utilities  
• API testing tools  
• JWT signer  
• SQL formatter  
• Cron parser  
• Local storage inspector  
• Favorites & history

---

## 🤝 Contributing

Contributions, feature suggestions, and improvements are welcome.

---

## 📜 License

MIT License
