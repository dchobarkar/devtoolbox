import { notFound } from "next/navigation";

import { getToolBySlug, getToolMetadata } from "@/lib/tools";
import ToolPageHeader from "@/components/tool/ToolPageHeader";
import Base64Client from "./_components/tool-client";

const slug = "base64";

export const metadata = (() => {
  const meta = getToolMetadata(slug);
  if (!meta) notFound();
  return { title: meta.title, description: meta.description };
})();

const Base64Page = () => {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return (
    <>
      <ToolPageHeader
        category={tool.category}
        title={tool.name}
        description={tool.description}
      />
      <Base64Client />
    </>
  );
};

export default Base64Page;
