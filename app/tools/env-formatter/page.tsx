import { tools } from "@/lib/tools";
import { ToolLayout } from "@/components/tool/ToolLayout";
import { EnvFormatterClient } from "./tool-client";

const tool = tools.find((t) => t.slug === "env-formatter")!;

export const metadata = {
  title: `${tool.name} — DevToolbox`,
  description: tool.description,
};

export default function EnvFormatterPage() {
  return (
    <ToolLayout
      title={tool.name}
      description={tool.description}
      category={tool.category}
    >
      <EnvFormatterClient />
    </ToolLayout>
  );
}
