import { notFound } from "next/navigation";
import { getToolBySlug, getToolMetadata } from "@/lib/tools";
import { ToolPageHeader } from "@/components/tool";
import { JwtDecoderClient } from "./_components/tool-client";

const slug = "jwt-decoder";

export const metadata = (() => {
  const meta = getToolMetadata(slug);
  if (!meta) notFound();
  return { title: meta.title, description: meta.description };
})();

export default function JwtDecoderPage() {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return (
    <>
      <ToolPageHeader
        category={tool.category}
        title={tool.name}
        description={tool.description}
      />
      <JwtDecoderClient />
    </>
  );
}
