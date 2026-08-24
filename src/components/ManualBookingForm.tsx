"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createManualBooking } from "@/lib/admin";

type Option = { id: string; name: string; email?: string; company?: string | null };
type StallOption = { id: string; exhibitionId: string; stallNumber: string; price: number; status: string };

type Props = { users: Option[]; exhibitions: Option[]; stalls: StallOption[] };

export default function ManualBookingForm({ users, exhibitions, stalls }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [exhibitionId, setExhibitionId] = useState("");
  const [stallId, setStallId] = useState("");
  const [advancePaid, setAdvancePaid] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const availableStalls = useMemo(() => stalls.filter((stall) => stall.exhibitionId === exhibitionId && stall.status === "AVAILABLE"), [stalls, exhibitionId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await createManualBooking({ userId, exhibitionId, stallId, advancePaid });
      router.push("/admin/bookings");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create booking");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-semibold">Customer</label>
        <select value={userId} onChange={(event) => setUserId(event.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2">
          <option value="">Select a registered customer</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.email}{user.company ? ` · ${user.company}` : ""}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">Exhibition</label>
        <select value={exhibitionId} onChange={(event) => { setExhibitionId(event.target.value); setStallId(""); }} required className="w-full rounded-lg border border-slate-300 px-3 py-2">
          <option value="">Select an exhibition</option>
          {exhibitions.map((exhibition) => <option key={exhibition.id} value={exhibition.id}>{exhibition.name}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">Available stall</label>
        <select value={stallId} onChange={(event) => setStallId(event.target.value)} required disabled={!exhibitionId} className="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100">
          <option value="">Select a stall</option>
          {availableStalls.map((stall) => <option key={stall.id} value={stall.id}>{stall.stallNumber} · ₹{stall.price.toFixed(2)}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input type="checkbox" checked={advancePaid} onChange={(event) => setAdvancePaid(event.target.checked)} className="h-4 w-4" />
        Record the 50% advance as paid now
      </label>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button disabled={isLoading} className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{isLoading ? "Creating..." : "Create booking"}</button>
        <button type="button" onClick={() => router.push("/admin/bookings")} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold">Cancel</button>
      </div>
    </form>
  );
}
