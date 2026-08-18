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
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Admin Portal</p>
            <h1 className="mt-1 text-3xl font-bold">Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Public Site
            </Link>
            <Link
              href="/admin/logout"
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
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
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Management</h2>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">Live</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Link
              href="/admin/exhibitions"
              className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition"
            >
              📋 Manage Exhibitions
            </Link>
            <Link
              href="/admin/exhibitions"
              className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition"
            >
              🏢 Manage Stalls
            </Link>
            <div className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-400">
              📊 View all bookings (coming soon)
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-400">
              💳 Payment records (coming soon)
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-400">
              🔒 Block stalls (coming soon)
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-400">
              📈 Analytics (coming soon)
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
