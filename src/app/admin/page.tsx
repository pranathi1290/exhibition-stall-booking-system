import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getGlobalStats } from "@/lib/admin";

export default async function AdminPage() {
  // Check if user is authenticated
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Get statistics
  const stats = await getGlobalStats();

  return (
    <main className="site-shell min-h-screen p-6 text-[#0a2348] sm:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5 rounded-[1.75rem] bg-[#0a2348] p-6 text-white shadow-2xl shadow-[#0a2348]/20">
          <div>
            <p className="eyebrow text-[#76aef2]">ExpoStall control room</p>
            <h1 className="display-title mt-3 text-5xl font-bold">Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-full border border-white/25 px-4 py-2 text-sm font-medium hover:bg-white/10">
              Public Site
            </Link>
            <Link
              href="/admin/logout"
              className="rounded-full bg-[#0867d9] px-4 py-2 text-sm font-bold text-white hover:bg-[#2d83ed]"
            >
              Logout
            </Link>
          </div>
        </header>

        {/* Statistics */}
        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Total Exhibitions", stats.totalExhibitions.toString()],
            ["Total Stalls", stats.totalStalls.toString()],
            ["Available Stalls", stats.availableStalls.toString()],
            ["Confirmed Bookings", stats.totalBookings.toString()],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1.5rem] border border-[#0a2348]/10 bg-white p-6 shadow-[0_16px_50px_rgba(10,35,72,.07)]">
              <p className="eyebrow text-[#0a2348]/50">{label}</p>
              <p className="mt-4 text-4xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 border-t border-[#0a2348]/10 pt-7">
          <p className="eyebrow text-[#0867d9]">Workspace overview</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#0a2348]/60">Use the admin sidebar to manage exhibitions, bookings, team access, and workspace tools.</p>
        </section>
      </div>
    </main>
  );
}
