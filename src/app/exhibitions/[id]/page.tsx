import Link from "next/link";
import { notFound } from "next/navigation";
import StallMap from "@/components/StallMap";
import ExhibitionImage from "@/components/ExhibitionImage";
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
    <main className="site-shell min-h-screen px-6 py-12 text-[#17211f] sm:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <Link
          href="/exhibitions"
          className="mb-8 inline-flex rounded-full border border-[#17211f]/15 bg-white/70 px-4 py-2 text-sm font-bold backdrop-blur transition hover:border-[#f26b4f] hover:text-[#c94f3d]"
        >
          ← Back to exhibitions
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-[#17211f]/10 bg-white shadow-[0_20px_70px_rgba(23,33,31,.1)]">
          {exhibition.bannerUrl && (
            <ExhibitionImage
              src={exhibition.bannerUrl}
              alt={exhibition.name}
              className="h-72 w-full object-cover sm:h-96"
            />
          )}
          <div className="p-7 sm:p-10"><p className="eyebrow text-[#c94f3d]">Exhibition details</p>
          <h1 className="display-title mt-4 max-w-4xl text-5xl font-bold sm:text-7xl">{exhibition.name}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#17211f]/65">{exhibition.description}</p>

          {/* Key Info Grid */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#b9e4d0] p-5">
              <p className="text-xs text-slate-600 uppercase tracking-wide">Venue</p>
              <p className="mt-2 font-semibold">{exhibition.venue}</p>
            </div>
            <div className="rounded-2xl bg-[#f5f1ea] p-5">
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
            <div className="rounded-2xl bg-[#17211f] p-5 text-white">
              <p className="text-xs text-slate-600 uppercase tracking-wide">Total Stalls</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">{stalls.length}</p>
            </div>
          </div>
          </div></div>

        {/* Stall Map Section */}
        <div className="mt-8 rounded-[2rem] border border-[#17211f]/10 bg-[#17211f] p-7 text-white shadow-[0_20px_70px_rgba(23,33,31,.18)] sm:p-10">
          <p className="eyebrow text-[#f7b2a4]">The floor plan</p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Find your position.</h2>
          <p className="mt-3 text-white/60">Select an available stall to see its details and begin your booking.</p>

          <div className="mt-8">
            <StallMap stalls={stalls} userBookedStallId={userBookedStallId} isAuthenticated={Boolean(session)} />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#17211f]/10 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-600 uppercase tracking-wide">Available</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{availableCount}</p>
          </div>
          <div className="rounded-2xl border border-[#17211f]/10 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-600 uppercase tracking-wide">On Hold</p>
            <p className="mt-1 text-2xl font-bold text-yellow-700">{heldCount}</p>
          </div>
          <div className="rounded-2xl border border-[#17211f]/10 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-600 uppercase tracking-wide">Booked</p>
            <p className="mt-1 text-2xl font-bold text-red-700">{bookedCount}</p>
          </div>
          <div className="rounded-2xl border border-[#17211f]/10 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-600 uppercase tracking-wide">Occupancy</p>
            <p className="mt-1 text-2xl font-bold">
              {stalls.length > 0 ? Math.round((bookedCount / stalls.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* CTA */}
        {availableCount > 0 && !session ? (
          <div className="mt-8 rounded-[2rem] bg-[#f26b4f] p-8 text-center text-white shadow-xl shadow-[#f26b4f]/20">
            <h3 className="text-2xl font-bold">Ready to book?</h3>
            <p className="mt-2 text-white/80">Sign in to your account to start booking stalls.</p>
            <div className="mt-4 flex gap-4 justify-center">
              <Link
                href="/login"
                className="inline-block rounded-full bg-[#17211f] px-5 py-2.5 font-semibold text-white hover:bg-black"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-block rounded-full border border-white/50 bg-white px-5 py-2.5 font-semibold text-[#17211f] hover:bg-[#f5f1ea]"
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
