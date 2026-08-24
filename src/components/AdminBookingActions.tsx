"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelAdminBooking, recordAdminPayment } from "@/lib/admin";
import type { PaymentType } from "@prisma/client";

type Props = {
  bookingId: string;
  outstanding: number;
  bookingStatus: string;
};

export default function AdminBookingActions({ bookingId, outstanding, bookingStatus }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("BALANCE");
  const [transactionId, setTransactionId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submitPayment(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);
    try {
      await recordAdminPayment({
        bookingId,
        amount: Number(amount),
        paymentType,
        transactionId: transactionId || undefined,
      });
      setAmount("");
      setTransactionId("");
      setMessage("Payment recorded");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not record payment");
    } finally {
      setIsLoading(false);
    }
  }

  async function cancelBooking() {
    setMessage("");
    setIsLoading(true);
    try {
      await cancelAdminBooking(bookingId);
      setMessage("Booking cancelled");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not cancel booking");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      {bookingStatus !== "CANCELLED" && (
        <div className="flex flex-wrap gap-2">
          {outstanding > 0 && (
            <form onSubmit={submitPayment} className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={outstanding}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder={`Outstanding ${outstanding.toFixed(2)}`}
                className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
              <select
                value={paymentType}
                onChange={(event) => setPaymentType(event.target.value as PaymentType)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ADVANCE">Advance</option>
                <option value="BALANCE">Balance</option>
              </select>
              <input
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                placeholder="Transaction ID"
                className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button disabled={isLoading} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                Record payment
              </button>
            </form>
          )}
          <button onClick={cancelBooking} disabled={isLoading} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">
            Cancel booking
          </button>
        </div>
      )}
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </div>
  );
}
