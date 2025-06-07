
import Sidebar from "./sidebar";
import Navbar from "./navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[200px_1fr]">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
