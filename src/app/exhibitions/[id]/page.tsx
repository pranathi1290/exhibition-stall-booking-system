import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import StallMap from "@/components/StallMap";
import { getPublicExhibitionById, getPublicStallsByExhibition, getUserBookingHistory } from "@/lib/public";
import { getUserSession } from "@/lib/user-auth";

export default async function ExhibitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exhibition = await getPublicExhibitionById(id);

  if (!exhibition) {
    notFound();
  }

  const stalls = await getPublicStallsByExhibition(id);
  const session = await getUserSession();

  let userBookedStallId: string | undefined;
  if (session) {
    const bookings = await getUserBookingHistory();
    const exhibitionBooking = bookings.find(
      (b) => b.exhibitionId === id && b.bookingStatus === "CONFIRMED"
    );
    userBookedStallId = exhibitionBooking?.stallId;
  }

  const availableCount = stalls.filter((s) => s.status === "AVAILABLE").length;
  const bookedCount = stalls.filter((s) => s.status === "BOOKED").length;
  const heldCount = stalls.filter((s) => s.status === "HELD").length;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <Link
          href="/exhibitions"
          className="mb-6 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium"
        >
          ← Back to exhibitions
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Exhibition Details</p>
          <h1 className="mt-3 text-4xl font-bold">{exhibition.name}</h1>
          <p className="mt-4 text-slate-600">{exhibition.description}</p>

          {/* Key Info Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-600 uppercase tracking-wide">Venue</p>
              <p className="mt-2 font-semibold">{exhibition.venue}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-600 uppercase tracking-wide">Dates</p>
              <p className="mt-2 font-semibold">
                {new Date(exhibition.startDate).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {new Date(exhibition.endDate).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-600 uppercase tracking-wide">Total Stalls</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">{stalls.length}</p>
            </div>
          </div>
        </div>

        {/* Stall Map Section */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Stall Map</p>
          <h2 className="mt-3 text-2xl font-bold">Browse available stalls</h2>
          <p className="mt-2 text-slate-600">Click on an available stall (green) to view details and place a booking.</p>

          <div className="mt-8">
            <StallMap stalls={stalls} userBookedStallId={userBookedStallId} />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-600 uppercase tracking-wide">Available</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{availableCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-600 uppercase tracking-wide">On Hold</p>
            <p className="mt-1 text-2xl font-bold text-yellow-700">{heldCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-600 uppercase tracking-wide">Booked</p>
            <p className="mt-1 text-2xl font-bold text-red-700">{bookedCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-600 uppercase tracking-wide">Occupancy</p>
            <p className="mt-1 text-2xl font-bold">
              {stalls.length > 0 ? Math.round((bookedCount / stalls.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* CTA */}
        {availableCount > 0 && !session ? (
          <div className="mt-8 rounded-3xl border border-emerald-300 bg-emerald-50 p-6 text-center">
            <h3 className="text-lg font-bold text-emerald-900">Ready to book?</h3>
            <p className="mt-2 text-emerald-800">Sign in to your account to start booking stalls</p>
            <div className="mt-4 flex gap-4 justify-center">
              <Link
                href="/login"
                className="inline-block rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white hover:bg-emerald-800"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-block rounded-lg border border-emerald-700 bg-white px-5 py-2 font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Register
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
