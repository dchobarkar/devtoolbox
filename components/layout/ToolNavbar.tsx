import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";

const ToolNavbar = () => {
  return (
    <header
      className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
      role="banner"
    >
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>DevToolbox</span>
        </Link>
        <Link
          href="/"
          className="ml-auto flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          aria-label="All tools"
        >
          <Wrench className="h-4 w-4" aria-hidden />
          <span>All tools</span>
        </Link>
      </div>
    </header>
  );
};

export default ToolNavbar;
