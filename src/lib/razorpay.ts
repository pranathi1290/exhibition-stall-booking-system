"use server";

import Razorpay from "razorpay";
import { z } from "zod";
import { prisma } from "./prisma";
import { requireUserAuth } from "./user-auth";
import { isHoldExpired } from "./booking-workflow";
import { createBooking, holdStall } from "./public";
import { verifyRazorpaySignature } from "./razorpay-signature";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

function getRazorpay() {
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error("Razorpay is not configured");
  }
  return new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
}

export async function isRazorpayConfigured(): Promise<boolean> {
  return Boolean(razorpayKeyId && razorpayKeySecret);
}

function toPaise(amount: number | { toNumber: () => number }) {
  const numericAmount = typeof amount === "number" ? amount : amount.toNumber();
  const paise = Math.round(numericAmount * 100);
  if (paise <= 0) throw new Error("Invalid payment amount");
  return paise;
}

export async function startRazorpayCheckout(exhibitionId: string, stallId: string) {
  const hold = await holdStall(stallId);
  if (!hold.success) throw new Error(hold.error || "Could not hold stall");
  const booking = await createBooking({ exhibitionId, stallId, companyName: "", phone: "", address: "" });
  if (!booking.success || !booking.bookingId) throw new Error(booking.error || "Could not create booking");
  return createRazorpayOrder(booking.bookingId);
}

export async function createRazorpayOrder(bookingId: string): Promise<{
  keyId: string;
  orderId: string;
  amount: number;
  currency: "INR";
  bookingId: string;
}> {
  const session = await requireUserAuth();
  const parsed = z.string().min(1).safeParse(bookingId);
  if (!parsed.success) throw new Error("Booking is required");

  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data, userId: session.userId },
    include: { stall: true },
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.bookingStatus !== "PENDING") throw new Error("Booking cannot accept payment");
  if (booking.stall.status !== "HELD" || booking.stall.heldByUserId !== session.userId || isHoldExpired(booking.stall.status, booking.stall.heldUntil)) {
    throw new Error("Stall hold has expired. Please select the stall again.");
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId_paymentType: { bookingId: booking.id, paymentType: "ADVANCE" } },
  });
  if (existingPayment?.paymentStatus === "PENDING" && existingPayment.razorpayOrderId) {
    return { keyId: razorpayKeyId!, orderId: existingPayment.razorpayOrderId, amount: toPaise(booking.advanceAmount), currency: "INR", bookingId: booking.id };
  }

  const amount = toPaise(booking.advanceAmount);
  const order = await getRazorpay().orders.create({
    amount,
    currency: "INR",
    receipt: booking.bookingNumber,
    notes: { bookingId: booking.id, userId: session.userId },
  });

  await prisma.payment.upsert({
    where: { bookingId_paymentType: { bookingId: booking.id, paymentType: "ADVANCE" } },
    create: { bookingId: booking.id, amount: booking.advanceAmount, paymentType: "ADVANCE", paymentStatus: "PENDING", razorpayOrderId: order.id },
    update: { amount: booking.advanceAmount, paymentStatus: "PENDING", razorpayOrderId: order.id, razorpayPaymentId: null, paymentGatewayTransactionId: null, paymentDate: new Date() },
  });

  return { keyId: razorpayKeyId!, orderId: order.id, amount, currency: "INR", bookingId: booking.id };
}

export async function verifyRazorpayPayment(input: {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ success: boolean; alreadyProcessed?: boolean; error?: string }> {
  const session = await requireUserAuth();
  const parsed = z.object({
    bookingId: z.string().min(1),
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  }).safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid payment response" };
  if (!razorpayKeySecret) return { success: false, error: "Razorpay is not configured" };

  const payment = await prisma.payment.findFirst({
    where: { bookingId: parsed.data.bookingId, razorpayOrderId: parsed.data.razorpayOrderId, paymentType: "ADVANCE" },
    include: { booking: { include: { stall: true } } },
  });
  if (!payment || payment.booking.userId !== session.userId) return { success: false, error: "Payment order not found" };
  const duplicatePayment = await prisma.payment.findUnique({ where: { razorpayPaymentId: parsed.data.razorpayPaymentId } });
  if (duplicatePayment && duplicatePayment.id !== payment.id) return { success: false, error: "Payment has already been processed" };
  if (payment.paymentStatus === "SUCCESS" && payment.razorpayPaymentId === parsed.data.razorpayPaymentId) return { success: true, alreadyProcessed: true };

  if (!verifyRazorpaySignature(parsed.data.razorpayOrderId, parsed.data.razorpayPaymentId, parsed.data.razorpaySignature, razorpayKeySecret)) {
    return { success: false, error: "Payment signature verification failed" };
  }

  try {
    const gatewayPayment = await getRazorpay().payments.fetch(parsed.data.razorpayPaymentId);
    if (gatewayPayment.order_id !== parsed.data.razorpayOrderId || gatewayPayment.amount !== toPaise(payment.amount) || gatewayPayment.status !== "captured") {
      return { success: false, error: "Payment amount or order could not be verified" };
    }
  } catch (error) {
    console.error("Razorpay payment lookup error:", error);
    return { success: false, error: "Payment could not be verified" };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.payment.findUnique({ where: { id: payment.id }, include: { booking: { include: { stall: true } } } });
      if (!current) return { success: false as const, error: "Payment record not found" };
      if (current.paymentStatus === "SUCCESS" && current.razorpayPaymentId === parsed.data.razorpayPaymentId) return { success: true as const, alreadyProcessed: true };
      if (current.booking.bookingStatus === "CONFIRMED") return { success: true as const, alreadyProcessed: true };
      const now = new Date();
      if (current.booking.stall.status !== "HELD" || current.booking.stall.heldByUserId !== session.userId || isHoldExpired(current.booking.stall.status, current.booking.stall.heldUntil, now)) {
        await tx.payment.update({ where: { id: current.id }, data: { paymentStatus: "FAILED", razorpayPaymentId: parsed.data.razorpayPaymentId, paymentGatewayTransactionId: parsed.data.razorpayPaymentId } });
        await tx.stall.updateMany({ where: { id: current.booking.stallId, status: "HELD", heldByUserId: session.userId }, data: { status: "AVAILABLE", heldUntil: null, heldByUserId: null } });
        return { success: false as const, error: "Payment received after the stall hold expired" };
      }
      await tx.payment.update({ where: { id: current.id }, data: { paymentStatus: "SUCCESS", razorpayPaymentId: parsed.data.razorpayPaymentId, paymentGatewayTransactionId: parsed.data.razorpayPaymentId, paymentDate: now } });
      await tx.booking.update({ where: { id: current.bookingId }, data: { bookingStatus: "CONFIRMED", paymentStatus: "SUCCESS" } });
      await tx.stall.update({ where: { id: current.booking.stallId }, data: { status: "BOOKED", heldUntil: null, heldByUserId: null } });
      return { success: true as const };
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return { success: false, error: "Payment could not be finalized" };
  }
}
