"use client";

import { useState } from "react";
import { updateStallLayout } from "@/lib/admin";

type Stall = { id: string; stallNumber: string; positionX: number; positionY: number; status: string };

export default function LayoutEditor({ stalls }: { stalls: Stall[] }) {
  const [items, setItems] = useState(stalls);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  async function save(stall: Stall) {
    setSaving(stall.id);
    setMessage("");
    try {
      await updateStallLayout(stall.id, stall.positionX, stall.positionY);
      setMessage(`Position saved for ${stall.stallNumber}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save position");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="relative h-[34rem] overflow-hidden rounded-2xl border border-slate-300 bg-slate-950/95">
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 text-center text-xs font-bold uppercase tracking-[0.25em] text-white/80">
          <p>Entrance</p>
          <p className="mt-1 text-2xl leading-none text-emerald-300">↓</p>
        </div>
        <div className="absolute inset-4 rounded-xl border border-dashed border-white/30 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:40px_40px]">
          <div className="absolute left-1/2 top-[60%] w-52 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/30 bg-white/10 px-6 py-4 text-center text-sm font-bold tracking-[0.3em] text-white/80">
            STAGE
          </div>
          {items.map((stall) => (
            <div key={stall.id} className={`absolute flex h-20 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-lg border-2 px-3 py-2 text-xs font-bold shadow-lg ${stall.status === "AVAILABLE" ? "border-green-200 bg-green-400 text-green-950" : stall.status === "BOOKED" ? "border-red-200 bg-red-400 text-red-950" : stall.status === "HELD" ? "border-yellow-200 bg-yellow-300 text-yellow-950" : "border-slate-200 bg-slate-300 text-slate-950"}`} style={{ left: `${Math.max(7, Math.min(93, stall.positionX))}%`, top: `${Math.max(14, Math.min(88, stall.positionY))}%` }}>
              <span>{stall.stallNumber}</span>
              <span className="mt-1 text-base leading-none">{stall.status === "AVAILABLE" ? "●" : stall.status === "BOOKED" ? "●" : stall.status === "HELD" ? "●" : "●"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((stall, index) => (
          <div key={stall.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
            <span className="w-16 font-semibold">{stall.stallNumber}</span>
            <label className="text-xs text-slate-500">X<input type="number" value={stall.positionX} onChange={(event) => setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, positionX: Number(event.target.value) } : item))} className="ml-1 w-16 rounded border border-slate-300 px-2 py-1 text-sm text-slate-900" /></label>
            <label className="text-xs text-slate-500">Y<input type="number" value={stall.positionY} onChange={(event) => setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, positionY: Number(event.target.value) } : item))} className="ml-1 w-16 rounded border border-slate-300 px-2 py-1 text-sm text-slate-900" /></label>
            <button onClick={() => save(stall)} disabled={saving === stall.id} className="ml-auto rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">{saving === stall.id ? "Saving..." : "Save"}</button>
          </div>
        ))}
      </div>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
