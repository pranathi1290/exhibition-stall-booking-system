import Link from "next/link";
import { getPublicStallById } from "@/lib/public";
import { normalizeCurrency } from "@/lib/booking";
import { getUserSession } from "@/lib/user-auth";
import RazorpayCheckout from "@/components/RazorpayCheckout";

export default async function BookStallPage({
  params,
}: {
  params: Promise<{ stallId: string }>;
}) {
  const { stallId } = await params;
  const stall = await getPublicStallById(stallId);
  const session = await getUserSession();

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
                <p className="mt-2 text-xl font-bold text-green-700">{stall.status}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-900">Online booking is coming soon</p>
              <p className="mt-2 text-sm text-amber-800">Payment is not enabled yet. Your selected stall remains available until booking opens.</p>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Payment summary</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Total amount</span><strong className="text-slate-900">{normalizeCurrency(Number(stall.price))}</strong></div>
              <div className="flex justify-between"><span>Advance ({stall.advancePercentage}%)</span><strong className="text-slate-900">{normalizeCurrency(Number(stall.advanceAmount))}</strong></div>
              <div className="flex justify-between"><span>Remaining</span><strong className="text-slate-900">{normalizeCurrency(Number(stall.price.minus(stall.advanceAmount)))}</strong></div>
            </div>
            {stall.status === "AVAILABLE" && session ? (
              <RazorpayCheckout exhibitionId={stall.exhibitionId} stallId={stall.id} amountLabel={normalizeCurrency(Number(stall.advanceAmount))} />
            ) : stall.status !== "AVAILABLE" ? (
              <p className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-600">This stall is {stall.status.toLowerCase()}.</p>
            ) : (
              <Link href="/login" className="mt-6 block rounded-xl bg-slate-900 px-4 py-3 text-center font-semibold text-white">Login to continue</Link>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
