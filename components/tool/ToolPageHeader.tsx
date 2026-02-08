interface ToolPageHeaderProps {
  category: string;
  title: string;
  description: string;
}

export function ToolPageHeader({
  category,
  title,
  description,
}: ToolPageHeaderProps) {
  return (
    <div className="mb-6">
      <p className="mb-1 text-sm font-medium text-accent">{category}</p>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
