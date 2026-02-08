import { ToolNavbar, ToolFooter } from "@/components/tool";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolNavbar />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8">{children}</main>
      <ToolFooter />
    </>
  );
}
