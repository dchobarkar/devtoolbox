import { tools } from "@/lib/tools";
import { ToolLayout } from "@/components/tool/ToolLayout";
import { JsonFormatterClient } from "./tool-client";

const tool = tools.find((t) => t.slug === "json-formatter")!;

export const metadata = {
  title: `${tool.name} — DevToolbox`,
  description: tool.description,
};

export default function JsonFormatterPage() {
  return (
    <ToolLayout
      title={tool.name}
      description={tool.description}
      category={tool.category}
    >
      <JsonFormatterClient />
    </ToolLayout>
  );
}
