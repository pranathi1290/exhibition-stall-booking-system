import Link from "next/link";
import { getPublicStallById, holdStall } from "@/lib/public";
import { normalizeCurrency } from "@/lib/booking";
import { getUserSession } from "@/lib/user-auth";
import { getHoldConflictMessage, isHoldExpired } from "@/lib/booking-workflow";
import RazorpayCheckout from "@/components/RazorpayCheckout";
import HoldCountdown from "@/components/HoldCountdown";

const STATUS_TEXT_COLOR: Record<string, string> = {
  AVAILABLE: "text-green-700",
  HELD: "text-yellow-700",
  BOOKED: "text-red-700",
  BLOCKED: "text-gray-700",
};

export default async function BookStallPage({
  params,
}: {
  params: Promise<{ stallId: string }>;
}) {
  const { stallId } = await params;
  const session = await getUserSession();

  let stall = await getPublicStallById(stallId);
  let holdError: string | undefined;

  // Claim a 10-minute hold as soon as a logged-in user opens an available stall
  if (session && stall?.status === "AVAILABLE") {
    const hold = await holdStall(stallId);
    if (hold.success) {
      stall = await getPublicStallById(stallId);
    } else {
      holdError = hold.error;
    }
  }

  if (!stall) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Stall not available</h1>
          <Link href="/exhibitions" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Back to exhibitions
          </Link>
        </div>
      </main>
    );
  }

  const isOwnerHold = Boolean(
    session &&
    stall.status === "HELD" &&
    stall.heldByUserId === session.userId &&
    stall.heldUntil &&
    !isHoldExpired(stall.status, stall.heldUntil)
  );

  // Message shown to anyone who doesn't own the current hold, e.g. "Stall is currently held by another user"
  const conflictMessage = isOwnerHold
    ? undefined
    : holdError ?? (stall.status !== "AVAILABLE" ? getHoldConflictMessage(stall.status, stall.heldUntil) : undefined);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link href={`/exhibitions/${stall.exhibitionId}`} className="mb-5 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium">← Back to exhibition</Link>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Booking Details</p>
            <h1 className="mt-3 text-3xl font-bold">Book stall {stall.stallNumber}</h1>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stall</p>
                <p className="mt-2 text-xl font-bold">{stall.stallNumber}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Price</p>
                <p className="mt-2 text-xl font-bold">{normalizeCurrency(Number(stall.price))}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Size</p>
                <p className="mt-2 text-xl font-bold">{String(stall.width)}m × {String(stall.length)}m</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                <p className={`mt-2 text-xl font-bold ${STATUS_TEXT_COLOR[stall.status] ?? "text-slate-700"}`}>{stall.status}</p>
              </div>
            </div>

            {isOwnerHold ? (
              <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="font-semibold text-emerald-900">Stall reserved for you</p>
                <p className="mt-2 text-sm text-emerald-800">Complete payment before the hold expires, or it will be released for other users.</p>
                <HoldCountdown stallId={stall.id} heldUntil={stall.heldUntil!.toISOString()} />
              </div>
            ) : conflictMessage ? (
              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-900">{stall.status === "BOOKED" ? "Stall already booked" : "Unable to reserve this stall"}</p>
                <p className="mt-2 text-sm text-red-800">{conflictMessage}</p>
              </div>
            ) : null}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Payment summary</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Total amount</span><strong className="text-slate-900">{normalizeCurrency(Number(stall.price))}</strong></div>
              <div className="flex justify-between"><span>Advance ({stall.advancePercentage}%)</span><strong className="text-slate-900">{normalizeCurrency(Number(stall.advanceAmount))}</strong></div>
              <div className="flex justify-between"><span>Remaining</span><strong className="text-slate-900">{normalizeCurrency(Number(stall.price.minus(stall.advanceAmount)))}</strong></div>
            </div>
            {isOwnerHold ? (
              <RazorpayCheckout exhibitionId={stall.exhibitionId} stallId={stall.id} amountLabel={normalizeCurrency(Number(stall.advanceAmount))} />
            ) : !session ? (
              <Link href={`/login?redirect=${encodeURIComponent(`/book/${stall.id}`)}`} className="mt-6 block rounded-xl bg-slate-900 px-4 py-3 text-center font-semibold text-white">Login to continue</Link>
            ) : (
              <p className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-600">
                {conflictMessage ?? `This stall is ${stall.status.toLowerCase()}.`}
              </p>
            )}
          </aside>
        </div>
      </div>

    </main>
  );
}
