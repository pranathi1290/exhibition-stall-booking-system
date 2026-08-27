import AdminSidebar from "@/components/AdminSidebar";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f9ff] lg:flex-row">
      <AdminSidebar role={session?.role} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
