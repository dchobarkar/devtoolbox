import { Loader2 } from "lucide-react";

export default function ToolsLoading() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center"
      aria-busy="true"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
      <span className="sr-only">Loading tool…</span>
    </div>
  );
}
