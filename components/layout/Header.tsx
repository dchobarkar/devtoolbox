import Link from "next/link";
import { Wrench } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground transition-opacity hover:opacity-90"
          aria-label="DevToolbox home"
        >
          <Wrench className="h-6 w-6 text-accent" aria-hidden />
          <span>DevToolbox</span>
        </Link>
        <nav aria-label="Main">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Tools
          </Link>
        </nav>
      </div>
    </header>
  );
}
