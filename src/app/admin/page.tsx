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
    <main className="site-shell min-h-screen p-6 text-[#17211f] sm:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5 rounded-[1.75rem] bg-[#17211f] p-6 text-white shadow-2xl shadow-[#17211f]/20">
          <div>
            <p className="eyebrow text-[#f7b2a4]">ExpoSpace control room</p>
            <h1 className="display-title mt-3 text-5xl font-bold">Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-full border border-white/25 px-4 py-2 text-sm font-medium hover:bg-white/10">
              Public Site
            </Link>
            <Link
              href="/admin/logout"
              className="rounded-full bg-[#f26b4f] px-4 py-2 text-sm font-bold text-white hover:bg-[#ff8065]"
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
            <div key={label} className="rounded-[1.5rem] border border-[#17211f]/10 bg-white p-6 shadow-[0_16px_50px_rgba(23,33,31,.07)]">
              <p className="eyebrow text-[#17211f]/50">{label}</p>
              <p className="mt-4 text-4xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="mt-8 rounded-[1.75rem] border border-[#17211f]/10 bg-white p-7 shadow-[0_16px_50px_rgba(23,33,31,.07)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Management</h2>
            <span className="rounded-full bg-[#b9e4d0] px-3 py-1 text-xs font-bold text-[#17211f]">Live</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Link
              href="/admin/exhibitions"
              className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition"
            >
              📋 Manage Exhibitions
            </Link>
            <Link
              href="/admin/bookings"
              className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition"
            >
              📊 Manage Bookings
            </Link>
            <Link
              href="/admin/bookings/create"
              className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition"
            >
              🧾 Manual Booking
            </Link>
            <div className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-400">
              💳 Payments are managed per booking
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
