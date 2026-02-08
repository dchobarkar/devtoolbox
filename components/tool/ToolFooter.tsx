import Link from "next/link";

export function ToolFooter() {
  return (
    <footer
      className="border-t border-border py-4 text-center text-sm text-muted-foreground"
      role="contentinfo"
    >
      <div className="mx-auto max-w-4xl px-4">
        <Link
          href="/"
          className="underline transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded"
        >
          Back to all tools
        </Link>
        <span className="mx-2">·</span>
        <span>DevToolbox — privacy-first developer utilities</span>
      </div>
    </footer>
  );
}
