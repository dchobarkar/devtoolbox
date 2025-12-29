interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export function CodeBlock({ children, className = "", label }: CodeBlockProps) {
  return (
    <div className="space-y-1">
      {label && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <pre
        className={`overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm text-foreground ${className}`}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}
