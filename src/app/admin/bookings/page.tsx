import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminBookings } from "@/lib/admin";
import { getAdminSession } from "@/lib/auth";
import AdminBookingActions from "@/components/AdminBookingActions";

export default async function AdminBookingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const bookings = await getAdminBookings();
  const confirmed = bookings.filter((booking) => booking.bookingStatus === "CONFIRMED").length;
  const pending = bookings.filter((booking) => booking.bookingStatus === "PENDING").length;
  const cancelled = bookings.filter((booking) => booking.bookingStatus === "CANCELLED").length;
  const revenue = bookings
    .flatMap((booking) => booking.payments)
    .filter((payment) => payment.paymentStatus === "SUCCESS")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-violet-700">Back to dashboard</Link>
            <h1 className="mt-2 text-3xl font-bold">Booking management</h1>
            <p className="mt-1 text-slate-600">Review customers, payment status, and stall reservations.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/admin/bookings/export" download className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700 hover:bg-emerald-100">Export CSV</a>
            <Link href="/admin/bookings/create" className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700">Manual booking</Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-4">
          {[["Confirmed", confirmed], ["Pending", pending], ["Cancelled", cancelled], ["Collected", `₹${revenue.toFixed(2)}`]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 space-y-4">
          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">No bookings yet.</div>
          ) : bookings.map((booking) => {
            const paid = booking.payments.filter((payment) => payment.paymentStatus === "SUCCESS").reduce((sum, payment) => sum + Number(payment.amount), 0);
            const outstanding = Math.max(0, Number(booking.totalAmount) - paid);
            return (
              <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold">{booking.bookingNumber}</h2>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{booking.bookingStatus}</span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{booking.paymentStatus}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{booking.exhibition.name} · Stall {booking.stall.stallNumber}</p>
                    <p className="mt-1 text-sm text-slate-600">Created {new Date(booking.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="text-xl font-bold">₹{Number(booking.totalAmount).toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-4">
                  <div><p className="text-xs uppercase tracking-wide text-slate-500">Customer</p><p className="mt-1 font-semibold">{booking.user.name}</p><p className="text-sm text-slate-600">{booking.user.email}</p></div>
                  <div><p className="text-xs uppercase tracking-wide text-slate-500">Company</p><p className="mt-1 font-semibold">{booking.user.company || "-"}</p><p className="text-sm text-slate-600">{booking.user.phone || "No phone"}</p></div>
                  <div><p className="text-xs uppercase tracking-wide text-slate-500">Paid</p><p className="mt-1 font-semibold text-emerald-700">₹{paid.toFixed(2)}</p></div>
                  <div><p className="text-xs uppercase tracking-wide text-slate-500">Outstanding</p><p className="mt-1 font-semibold text-amber-700">₹{outstanding.toFixed(2)}</p></div>
                </div>
                <AdminBookingActions bookingId={booking.id} outstanding={outstanding} bookingStatus={booking.bookingStatus} />
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
