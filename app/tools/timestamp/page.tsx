import { tools } from "@/lib/tools";
import { ToolLayout } from "@/components/tool/ToolLayout";
import { TimestampClient } from "./tool-client";

const tool = tools.find((t) => t.slug === "timestamp")!;

export const metadata = {
  title: `${tool.name} — DevToolbox`,
  description: tool.description,
};

export default function TimestampPage() {
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
