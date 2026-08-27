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
    <main className="site-shell min-h-screen p-6 text-[#0a2348] sm:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5 rounded-[1.75rem] bg-[#0a2348] p-7 text-white shadow-2xl">
          <div><Link href="/admin" className="eyebrow text-[#76aef2]">Back to dashboard</Link><h1 className="display-title mt-4 text-5xl font-bold">Team access</h1><p className="mt-3 max-w-xl text-white/60">Decide who can run the workspace and give every teammate the right level of access.</p></div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm"><span className="block text-white/50">Signed in as</span><strong>{session.email}</strong></div>
        </header>
        <section className="mb-8 grid gap-3 md:grid-cols-3" aria-labelledby="role-guide-title">
          <h2 id="role-guide-title" className="sr-only">Admin role guide</h2>
          <div className="border border-[#0a2348]/12 bg-white p-6 shadow-[0_12px_35px_rgba(10,35,72,.06)]">
            <p className="eyebrow text-[#0867d9]">Super admin</p>
            <p className="mt-4 text-sm leading-6 text-[#0a2348]/65">Full workspace access, including team management, exhibitions, stalls, bookings, and payments.</p>
          </div>
          <div className="border border-[#0a2348]/12 bg-[#eaf3ff] p-6">
            <p className="eyebrow text-[#0867d9]">Workspace admin</p>
            <p className="mt-4 text-sm leading-6 text-[#0a2348]/65">Manage exhibitions, stalls, bookings, and payment records without managing team access.</p>
          </div>
          <div className="border border-[#0a2348]/12 bg-white p-6 shadow-[0_12px_35px_rgba(10,35,72,.06)]">
            <p className="eyebrow text-[#0867d9]">Team member</p>
            <p className="mt-4 text-sm leading-6 text-[#0a2348]/65">Access day-to-day workspace tasks assigned by an administrator.</p>
          </div>
        </section>
        <AdminTeamManager admins={admins} currentAdminId={session.adminId} />
      </div>
    </main>
  );
}
