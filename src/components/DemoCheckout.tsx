"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startDemoCheckout, confirmDemoPayment } from "@/lib/demo-payment";
import { releaseStallHold } from "@/lib/public";

type Props = { exhibitionId: string; stallId: string; amountLabel: string };

export default function DemoCheckout({ exhibitionId, stallId, amountLabel }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  async function handleStart() {
    setMessage("");
    setIsLoading(true);
    try {
      const order = await startDemoCheckout(exhibitionId, stallId);
      setPendingBookingId(order.bookingId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start payment");
      await releaseStallHold(stallId).catch(() => undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirm() {
    if (!pendingBookingId) return;
    setMessage("");
    setIsLoading(true);
    try {
      const result = await confirmDemoPayment(pendingBookingId);
      if (!result.success) {
        setMessage(result.error || "Payment verification failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setMessage("Could not confirm payment");
    } finally {
      setIsLoading(false);
    }
  }

  if (pendingBookingId) {
    return (
      <div>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Demo payment gateway</p>
          <p className="mt-1">No real payment provider is configured. Click below to simulate a successful advance payment of {amountLabel}.</p>
        </div>
        <button onClick={handleConfirm} disabled={isLoading} className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:bg-slate-300">
          {isLoading ? "Confirming..." : `Simulate payment of ${amountLabel}`}
        </button>
        {message && <p className="mt-3 text-sm text-amber-700">{message}</p>}
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleStart} disabled={isLoading} className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:bg-slate-300">
        {isLoading ? "Preparing checkout..." : `Pay ${amountLabel} advance (demo)`}
      </button>
      {message && <p className="mt-3 text-sm text-amber-700">{message}</p>}
    </div>
  );
}
