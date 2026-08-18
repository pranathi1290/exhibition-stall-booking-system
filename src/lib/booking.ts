import { z } from "zod";

export type StallStatus = "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED";

export const stallStatusStyles: Record<StallStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-800 border-green-200",
  HELD: "bg-yellow-100 text-yellow-800 border-yellow-200",
  BOOKED: "bg-red-100 text-red-800 border-red-200",
  BLOCKED: "bg-gray-200 text-gray-700 border-gray-300",
};

export const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required"),
  companyName: z.string().trim().min(2, "Company name is required"),
  email: z.email("A valid email is required"),
  phone: z.string().trim().min(7, "Phone number must be at least 7 digits"),
  exhibitionId: z.string().min(1),
  stallId: z.string().min(1),
  notes: z.string().trim().max(400).optional().or(z.literal("")),
});

export function calculateBookingAmounts(price: number, advancePercentage = 50) {
  const validAdvancePercentage = Math.min(Math.max(advancePercentage, 0), 100);
  const advanceAmount = Number(((price * validAdvancePercentage) / 100).toFixed(2));
  const remainingAmount = Number((price - advanceAmount).toFixed(2));

  return {
    totalAmount: Number(price.toFixed(2)),
    advanceAmount,
    remainingAmount,
  };
}

export function getHoldExpiryTime(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function normalizeCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}
