"use client";

import { useMemo, useState } from "react";
import {
  Braces,
  Key,
  Binary,
  Regex,
  Clock,
  FileCode,
  Shield,
  Search,
} from "lucide-react";

import ToolCard from "@/components/shared/ToolCard";
import { tools } from "@/lib/tools";

const toolIcons: Record<string, React.ReactNode> = {
  "json-formatter": <Braces className="h-5 w-5" />,
  "jwt-decoder": <Key className="h-5 w-5" />,
  base64: <Binary className="h-5 w-5" />,
  "regex-tester": <Regex className="h-5 w-5" />,
  timestamp: <Clock className="h-5 w-5" />,
  "env-formatter": <FileCode className="h-5 w-5" />,
};

const HomePage = () => {
  const [query, setQuery] = useState("");

  const filteredTools = useMemo(() => {
    if (!query.trim()) return tools;
    const q = query.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Developer Utility Hub
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Essential utilities for developers — JSON, JWT, Base64, Regex,
          timestamps, and more. All tools run locally in your browser. No data
          is uploaded.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-muted-foreground shadow-sm">
          <Search className="h-4 w-4 shrink-0" aria-hidden />
          <input
            type="search"
            placeholder="Search tools…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full min-w-50 max-w-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Search tools"
          />
        </div>
      </section>

      <section className="mt-8 flex flex-wrap items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <Shield className="h-4 w-4 shrink-0 text-accent" aria-hidden />
        <span>
          All tools run locally in your browser. No data is uploaded to any
          server.
        </span>
      </section>

      <section className="mt-12" aria-label="Available tools">
        <h2 className="sr-only">Available tools</h2>
        {filteredTools.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No tools match &quot;{query}&quot;. Try a different search.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <li key={tool.slug}>
                <ToolCard
                  tool={tool}
                  icon={toolIcons[tool.slug] ?? undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default HomePage;
