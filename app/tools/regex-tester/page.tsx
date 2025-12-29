import { tools } from "@/lib/tools";
import { ToolLayout } from "@/components/tool/ToolLayout";
import { RegexTesterClient } from "./tool-client";

const tool = tools.find((t) => t.slug === "regex-tester")!;

export const metadata = {
  title: `${tool.name} — DevToolbox`,
  description: tool.description,
};

export default function RegexTesterPage() {
  return (
    <ToolLayout
      title={tool.name}
      description={tool.description}
      category={tool.category}
    >
      <RegexTesterClient />
    </ToolLayout>
  );
}
