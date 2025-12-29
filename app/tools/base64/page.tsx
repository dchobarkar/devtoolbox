import { tools } from "@/lib/tools";
import { ToolLayout } from "@/components/tool/ToolLayout";
import { Base64Client } from "./tool-client";

const tool = tools.find((t) => t.slug === "base64")!;

export const metadata = {
  title: `${tool.name} — DevToolbox`,
  description: tool.description,
};

export default function Base64Page() {
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
