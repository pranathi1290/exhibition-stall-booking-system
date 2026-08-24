"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startRazorpayCheckout, verifyRazorpayPayment } from "@/lib/razorpay";
import { releaseStallHold } from "@/lib/public";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type Props = { exhibitionId: string; stallId: string; amountLabel: string };

export default function RazorpayCheckout({ exhibitionId, stallId, amountLabel }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheckout() {
    setMessage("");
    setIsLoading(true);
    try {
      const order = await startRazorpayCheckout(exhibitionId, stallId);
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Razorpay checkout could not load"));
          document.body.appendChild(script);
        });
      }
      if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable");
      const Checkout = window.Razorpay;
      const checkout = new Checkout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Exhibition Stall Booking",
        description: `50% advance for stall booking`,
        order_id: order.orderId,
        handler: async (response: Record<string, string>) => {
          const result = await verifyRazorpayPayment({
            bookingId: order.bookingId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          if (!result.success) {
            setMessage(result.error || "Payment verification failed");
            return;
          }
          router.push("/dashboard");
          router.refresh();
        },
        modal: { ondismiss: () => setMessage("Payment was not completed. Your hold remains active for 10 minutes.") },
      });
      checkout.open();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start payment");
      await releaseStallHold(stallId).catch(() => undefined);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleCheckout} disabled={isLoading} className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:bg-slate-300">
        {isLoading ? "Preparing secure checkout..." : `Pay ${amountLabel} advance`}
      </button>
      {message && <p className="mt-3 text-sm text-amber-700">{message}</p>}
    </div>
  );
}