import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getAdminUsers } from "@/lib/auth-actions";
import AdminTeamManager from "@/components/AdminTeamManager";

export default async function AdminTeamPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "SUPER_ADMIN") redirect("/admin");

  const admins = await getAdminUsers();
  return (
    <main className="site-shell min-h-screen p-6 text-[#17211f] sm:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5 rounded-[1.75rem] bg-[#17211f] p-7 text-white shadow-2xl">
          <div><Link href="/admin" className="eyebrow text-[#f7b2a4]">Back to dashboard</Link><h1 className="display-title mt-4 text-5xl font-bold">Team access</h1><p className="mt-3 max-w-xl text-white/60">Decide who can run the workspace and give every teammate the right level of access.</p></div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm"><span className="block text-white/50">Signed in as</span><strong>{session.email}</strong></div>
        </header>
        <AdminTeamManager admins={admins} currentAdminId={session.adminId} />
      </div>
    </main>
  );
}
