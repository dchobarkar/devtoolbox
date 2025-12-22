import { notFound } from "next/navigation";
import { getToolBySlug, getToolMetadata } from "@/lib/tools";
import { ToolLayout } from "@/components/tool";
import { TimestampClient } from "./_components/tool-client";

const slug = "timestamp";

export const metadata = (() => {
  const meta = getToolMetadata(slug);
  if (!meta) notFound();
  return { title: meta.title, description: meta.description };
})();

export default function TimestampPage() {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return (
    <ToolLayout
      title={tool.name}
      description={tool.description}
      category={tool.category}
    >
      <TimestampClient />
    </ToolLayout>
  );
}
