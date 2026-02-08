import ToolNavbar from "@/components/layout/ToolNavbar";

const ToolsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ToolNavbar />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8">{children}</main>
    </>
  );
};

export default ToolsLayout;
