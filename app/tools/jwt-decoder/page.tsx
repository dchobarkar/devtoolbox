import { tools } from "@/lib/tools";
import { ToolLayout } from "@/components/tool/ToolLayout";
import { JwtDecoderClient } from "./tool-client";

const tool = tools.find((t) => t.slug === "jwt-decoder")!;

export const metadata = {
  title: `${tool.name} — DevToolbox`,
  description: tool.description,
};

export default function JwtDecoderPage() {
  return (
    <ToolLayout
      title={tool.name}
      description={tool.description}
      category={tool.category}
    >
      <JwtDecoderClient />
    </ToolLayout>
  );
}
