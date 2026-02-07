import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <FileQuestion
        className="mb-4 h-16 w-16 text-muted-foreground"
        aria-hidden
      />
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      >
        <Home className="h-4 w-4" aria-hidden />
        Back to home
      </Link>
    </div>
  );
}
