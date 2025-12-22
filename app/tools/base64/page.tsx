import { notFound } from "next/navigation";
import { getToolBySlug, getToolMetadata } from "@/lib/tools";
import { ToolLayout } from "@/components/tool";
import { Base64Client } from "./_components/tool-client";

const slug = "base64";

export const metadata = (() => {
  const meta = getToolMetadata(slug);
  if (!meta) notFound();
  return { title: meta.title, description: meta.description };
})();

export default function Base64Page() {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return (
    <ToolLayout
      title={tool.name}
      description={tool.description}
      category={tool.category}
    >
      <Base64Client />
    </ToolLayout>
  );
}
