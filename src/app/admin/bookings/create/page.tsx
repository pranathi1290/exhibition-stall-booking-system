import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUsers, getExhibitions, getStallsByExhibition } from "@/lib/admin";
import { getAdminSession } from "@/lib/auth";
import ManualBookingForm from "@/components/ManualBookingForm";

export default async function ManualBookingPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [users, exhibitions] = await Promise.all([getAdminUsers(), getExhibitions()]);
  const stallGroups = await Promise.all(exhibitions.map(async (exhibition) => ({ exhibitionId: exhibition.id, stalls: await getStallsByExhibition(exhibition.id) })));
  const stalls = stallGroups.flatMap((group) => group.stalls.map((stall) => ({
    id: stall.id,
    exhibitionId: group.exhibitionId,
    stallNumber: stall.stallNumber,
    price: Number(stall.price),
    status: stall.status,
  })));

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin/bookings" className="text-sm font-semibold text-violet-700">Back to bookings</Link>
        <h1 className="mt-3 text-3xl font-bold">Create manual booking</h1>
        <p className="mt-2 mb-6 text-slate-600">Reserve an available stall for a registered customer. Payment can be recorded now or later.</p>
        {users.length === 0 ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">There are no registered customers yet.</div> : <ManualBookingForm users={users} exhibitions={exhibitions.map((exhibition) => ({ id: exhibition.id, name: exhibition.name }))} stalls={stalls} />}
      </div>
    </main>
  );
}
