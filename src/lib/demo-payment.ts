/**
 * Demo payment gateway used when Razorpay credentials are not configured.
 * Simulates a successful payment without contacting a real payment provider.
 */

"use server";

import { prisma } from "./prisma";
import { requireUserAuth } from "./user-auth";
import { isHoldExpired } from "./booking-workflow";
import { createBooking, holdStall } from "./public";

export async function startDemoCheckout(
  exhibitionId: string,
  stallId: string
): Promise<{ bookingId: string; amount: number }> {
  const hold = await holdStall(stallId);
  if (!hold.success) throw new Error(hold.error || "Could not hold stall");

  const booking = await createBooking({ exhibitionId, stallId, companyName: "", phone: "", address: "" });
  if (!booking.success || !booking.bookingId) throw new Error(booking.error || "Could not create booking");

  const record = await prisma.booking.findUnique({ where: { id: booking.bookingId } });
  if (!record) throw new Error("Booking not found");

  const orderId = `DEMO-ORDER-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
  await prisma.payment.upsert({
    where: { bookingId_paymentType: { bookingId: record.id, paymentType: "ADVANCE" } },
    create: { bookingId: record.id, amount: record.advanceAmount, paymentType: "ADVANCE", paymentStatus: "PENDING", razorpayOrderId: orderId },
    update: { amount: record.advanceAmount, paymentStatus: "PENDING", razorpayOrderId: orderId, razorpayPaymentId: null, paymentGatewayTransactionId: null, paymentDate: new Date() },
  });

  return { bookingId: record.id, amount: Number(record.advanceAmount) };
}

export async function confirmDemoPayment(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireUserAuth();

  try {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({ where: { id: bookingId, userId: session.userId }, include: { stall: true } });
      if (!booking) return { success: false as const, error: "Booking not found" };
      if (booking.bookingStatus === "CONFIRMED") return { success: true as const };

      const now = new Date();
      if (
        booking.stall.status !== "HELD" ||
        booking.stall.heldByUserId !== session.userId ||
        isHoldExpired(booking.stall.status, booking.stall.heldUntil, now)
      ) {
        return { success: false as const, error: "Stall hold has expired. Please select the stall again." };
      }

      const transactionId = `DEMO-PAY-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
      await tx.payment.update({
        where: { bookingId_paymentType: { bookingId: booking.id, paymentType: "ADVANCE" } },
        data: { paymentStatus: "SUCCESS", razorpayPaymentId: transactionId, paymentGatewayTransactionId: transactionId, paymentDate: now },
      });
      await tx.booking.update({ where: { id: booking.id }, data: { bookingStatus: "CONFIRMED", paymentStatus: "SUCCESS" } });
      await tx.stall.update({ where: { id: booking.stallId }, data: { status: "BOOKED", heldUntil: null, heldByUserId: null } });

      return { success: true as const };
    });
  } catch (error) {
    console.error("Demo payment error:", error);
    return { success: false, error: "Failed to confirm demo payment" };
  }
}
