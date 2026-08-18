import Link from "next/link";
import { getBookingSummary, getStallById, normalizeCurrency } from "@/lib/demo-store";

export default async function BookStallPage({
  params,
}: {
  params: Promise<{ stallId: string }>;
}) {
  const { stallId } = await params;
  const stall = getStallById(stallId);
  const summary = stall ? getBookingSummary(stallId) : null;

  if (!stall || !summary) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Stall not available</h1>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Back to exhibition list
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-5 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium">← Back to stalls</Link>

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
                <p className="mt-2 text-xl font-bold">{normalizeCurrency(stall.price)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Size</p>
                <p className="mt-2 text-xl font-bold">{stall.width}m × {stall.length}m</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                <p className="mt-2 text-xl font-bold text-green-700">{stall.status}</p>
              </div>
            </div>

            <form className="mt-8 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <input defaultValue="Aisha Verma" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Company name</label>
                <input defaultValue="BluePeak Infra" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input type="email" defaultValue="aisha@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                <input defaultValue="+91 98765 43210" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                <textarea className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Optional requirements" />
              </div>
            </form>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Payment summary</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Total amount</span><strong className="text-slate-900">{normalizeCurrency(summary.totalAmount)}</strong></div>
              <div className="flex justify-between"><span>Advance ({stall.advancePercentage}%)</span><strong className="text-slate-900">{normalizeCurrency(summary.advanceAmount)}</strong></div>
              <div className="flex justify-between"><span>Remaining</span><strong className="text-slate-900">{normalizeCurrency(summary.remainingAmount)}</strong></div>
            </div>
            <button className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Proceed to Razorpay</button>
            <p className="mt-4 text-xs text-slate-500">A temporary hold is placed while the payment is being verified. If it expires, the stall returns to AVAILABLE.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
