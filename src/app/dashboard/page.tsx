import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserSession, clearUserSession } from "@/lib/user-auth";
import { getUserProfile, getUserBookingHistory } from "@/lib/public";

async function handleLogout() {
  "use server";
  await clearUserSession();
  redirect("/");
}

export default async function DashboardPage() {
  const session = await getUserSession();

  if (!session) {
    redirect("/login");
  }

  let profile;
  let bookings;

  try {
    [profile, bookings] = await Promise.all([
      getUserProfile(),
      getUserBookingHistory(),
    ]);
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-slate-600">Failed to load dashboard</p>
          <Link href="/" className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Welcome</p>
              <h1 className="mt-2 text-4xl font-bold">{profile?.name}</h1>
              <p className="mt-2 text-slate-600">{profile?.email}</p>
            </div>
            <form action={handleLogout}>
              <button
                type="submit"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </form>
          </div>

          {/* Profile Info */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Profile Information</p>
              <div className="mt-4 space-y-4">
                {profile?.company && (
                  <div>
                    <p className="text-xs text-slate-600">Company</p>
                    <p className="font-semibold">{profile.company}</p>
                  </div>
                )}
                {profile?.phone && (
                  <div>
                    <p className="text-xs text-slate-600">Phone</p>
                    <p className="font-semibold">{profile.phone}</p>
                  </div>
                )}
                {profile?.address && (
                  <div>
                    <p className="text-xs text-slate-600">Address</p>
                    <p className="font-semibold">{profile.address}</p>
                  </div>
                )}
                {profile?.createdAt && (
                  <div>
                    <p className="text-xs text-slate-600">Member since</p>
                    <p className="font-semibold">
                      {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Booking Summary</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-slate-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-emerald-700">{bookings?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Confirmed</p>
                  <p className="text-2xl font-bold">
                    {bookings?.filter((b) => b.bookingStatus === "CONFIRMED").length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Pending Payment</p>
                  <p className="text-2xl font-bold">
                    {bookings?.filter((b) => b.bookingStatus === "PENDING").length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Booking History</p>

            {bookings && bookings.length > 0 ? (
              <div className="mt-6 space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-semibold">{booking.exhibition.name}</p>
                      <p className="text-sm text-slate-600">
                        Stall {booking.stall.stallNumber} • {booking.bookingNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(booking.exhibition.startDate).toLocaleDateString("en-IN")} -{" "}
                        {new Date(booking.exhibition.endDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                    <p className="mb-2 text-lg font-bold">
                      ₹{typeof booking.totalAmount === 'object' ? booking.totalAmount.toString() : booking.totalAmount}
                    </p>
                      <div className="flex gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            booking.bookingStatus === "CONFIRMED"
                              ? "bg-green-100 text-green-700"
                              : booking.bookingStatus === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {booking.bookingStatus}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            booking.paymentStatus === "SUCCESS"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 text-center">
                <p className="text-slate-600">No bookings yet</p>
                <Link
                  href="/"
                  className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
                >
                  Browse exhibitions
                </Link>
              </div>
            )}
          </div>
        </div>
    </main>
  );
}
