import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      aria-busy="true"
      aria-live="polite"
    >
      <Loader2 className="h-10 w-10 animate-spin text-accent" aria-hidden />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
