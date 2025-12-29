import Link from "next/link";

import type { Tool } from "@/lib/tools";

interface ToolCardProps {
  tool: Tool;
  icon?: React.ReactNode;
}

export function ToolCard({ tool, icon }: ToolCardProps) {
  return (
    <Link
      href={tool.href}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-accent/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
    >
      {icon && (
        <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          {icon}
        </span>
      )}
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {tool.category}
      </span>
      <h3 className="mt-1 font-semibold text-foreground group-hover:text-accent">
        {tool.name}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
      <span className="mt-3 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
        Open tool →
      </span>
    </Link>
  );
}
