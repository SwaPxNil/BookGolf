import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function AdminLayout({ sidebarItems, children, role }) {
  return (
    <div className="min-h-screen bg-mist lg:flex">
      <Sidebar items={sidebarItems} role={role} />
      <main className="flex-1 p-4 sm:p-6">
        <TopNavbar role={role} />
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
