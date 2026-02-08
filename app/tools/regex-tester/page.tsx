import { notFound } from "next/navigation";

import { getToolBySlug, getToolMetadata } from "@/lib/tools";
import ToolPageHeader from "@/components/tool/ToolPageHeader";
import RegexTesterClient from "./_components/tool-client";

const slug = "regex-tester";

export const metadata = (() => {
  const meta = getToolMetadata(slug);
  if (!meta) notFound();
  return { title: meta.title, description: meta.description };
})();

const RegexTesterPage = () => {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return (
    <>
      <ToolPageHeader
        category={tool.category}
        title={tool.name}
        description={tool.description}
      />
      <RegexTesterClient />
    </>
  );
};

export default RegexTesterPage;
