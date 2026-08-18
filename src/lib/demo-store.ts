import { z } from "zod";

export type StallStatus = "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export type Exhibition = {
  id: string;
  name: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  bannerUrl: string;
  status: "ACTIVE" | "DRAFT" | "CLOSED";
};

export type Stall = {
  id: string;
  exhibitionId: string;
  stallNumber: string;
  width: number;
  length: number;
  area: number;
  price: number;
  advancePercentage: number;
  status: StallStatus;
  positionX: number;
  positionY: number;
  holdExpiresAt?: string | null;
};

export type BookingRecord = {
  id: string;
  bookingNumber: string;
  userId: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  exhibitionId: string;
  stallId: string;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export const exhibitions: Exhibition[] = [
  {
    id: "expo-1",
    name: "India Build Expo 2026",
    description:
      "A leading construction, architecture, and industrial innovation showcase for infrastructure leaders and investors.",
    venue: "Bengaluru International Exhibition Centre",
    startDate: "2026-09-12",
    endDate: "2026-09-15",
    bannerUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    status: "ACTIVE",
  },
  {
    id: "expo-2",
    name: "Healthcare Innovation Summit",
    description:
      "An international trade fair covering digital health, biotech, hospital infrastructure, and wellness technology.",
    venue: "Mumbai Convention Centre",
    startDate: "2026-10-02",
    endDate: "2026-10-05",
    bannerUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    status: "ACTIVE",
  },
];

export const stalls: Stall[] = [
  { id: "stall-101", exhibitionId: "expo-1", stallNumber: "A-101", width: 4, length: 5, area: 20, price: 50000, advancePercentage: 50, status: "AVAILABLE", positionX: 40, positionY: 35 },
  { id: "stall-102", exhibitionId: "expo-1", stallNumber: "A-102", width: 4, length: 5, area: 20, price: 50000, advancePercentage: 50, status: "HELD", positionX: 48, positionY: 35, holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() },
  { id: "stall-103", exhibitionId: "expo-1", stallNumber: "A-103", width: 4, length: 5, area: 20, price: 50000, advancePercentage: 50, status: "BOOKED", positionX: 56, positionY: 35 },
  { id: "stall-104", exhibitionId: "expo-1", stallNumber: "A-104", width: 6, length: 8, area: 48, price: 84500, advancePercentage: 50, status: "AVAILABLE", positionX: 64, positionY: 35 },
  { id: "stall-105", exhibitionId: "expo-1", stallNumber: "A-105", width: 6, length: 8, area: 48, price: 84500, advancePercentage: 50, status: "BLOCKED", positionX: 72, positionY: 35 },
  { id: "stall-201", exhibitionId: "expo-1", stallNumber: "B-201", width: 5, length: 8, area: 40, price: 72000, advancePercentage: 50, status: "AVAILABLE", positionX: 40, positionY: 60 },
  { id: "stall-202", exhibitionId: "expo-1", stallNumber: "B-202", width: 5, length: 8, area: 40, price: 72000, advancePercentage: 50, status: "AVAILABLE", positionX: 48, positionY: 60 },
  { id: "stall-203", exhibitionId: "expo-1", stallNumber: "B-203", width: 5, length: 8, area: 40, price: 72000, advancePercentage: 50, status: "BOOKED", positionX: 56, positionY: 60 },
  { id: "stall-301", exhibitionId: "expo-2", stallNumber: "C-301", width: 4, length: 6, area: 24, price: 62000, advancePercentage: 50, status: "AVAILABLE", positionX: 34, positionY: 42 },
  { id: "stall-302", exhibitionId: "expo-2", stallNumber: "C-302", width: 4, length: 6, area: 24, price: 62000, advancePercentage: 50, status: "HELD", positionX: 44, positionY: 42, holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() },
  { id: "stall-303", exhibitionId: "expo-2", stallNumber: "C-303", width: 4, length: 6, area: 24, price: 62000, advancePercentage: 50, status: "BOOKED", positionX: 54, positionY: 42 },
];

export const demoBookings: BookingRecord[] = [
  {
    id: "bk-1001",
    bookingNumber: "EXB-1001",
    userId: "u-demo",
    name: "Aisha Verma",
    companyName: "BluePeak Infra",
    email: "aisha@example.com",
    phone: "+91 98765 43210",
    exhibitionId: "expo-1",
    stallId: "stall-103",
    totalAmount: 50000,
    advanceAmount: 25000,
    remainingAmount: 25000,
    bookingStatus: "CONFIRMED",
    paymentStatus: "SUCCESS",
    createdAt: new Date().toISOString(),
  },
];

export const bookingInputSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  companyName: z.string().trim().min(2, "Company name is required"),
  email: z.email("Valid email is required"),
  phone: z.string().trim().min(7, "Phone number is required"),
  exhibitionId: z.string().min(1, "Exhibition is required"),
  stallId: z.string().min(1, "Stall is required"),
  notes: z.string().trim().max(400).optional().or(z.literal("")),
});

export const stallStatusStyles: Record<StallStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-800 border-green-200",
  HELD: "bg-yellow-100 text-yellow-800 border-yellow-200",
  BOOKED: "bg-red-100 text-red-800 border-red-200",
  BLOCKED: "bg-gray-200 text-gray-700 border-gray-300",
};

export function calculateBookingAmounts(price: number, advancePercentage = 50) {
  const percentage = Math.min(100, Math.max(0, advancePercentage));
  const advanceAmount = Number(((price * percentage) / 100).toFixed(2));
  const remainingAmount = Number((price - advanceAmount).toFixed(2));

  return {
    totalAmount: Number(price.toFixed(2)),
    advanceAmount,
    remainingAmount,
  };
}

export function getExhibitionById(exhibitionId: string) {
  return exhibitions.find((exhibition) => exhibition.id === exhibitionId) ?? null;
}

export function getStallById(stallId: string) {
  return stalls.find((stall) => stall.id === stallId) ?? null;
}

export function getStallsForExhibition(exhibitionId: string) {
  return stalls.filter((stall) => stall.exhibitionId === exhibitionId);
}

export function getBookingSummary(stallId: string) {
  const stall = getStallById(stallId);
  if (!stall) return null;
  return calculateBookingAmounts(stall.price, stall.advancePercentage);
}

export function setStallStatus(stallId: string, status: StallStatus, expiry?: string | null) {
  const stall = getStallById(stallId);
  if (!stall) return null;

  const updated = {
    ...stall,
    status,
    holdExpiresAt: status === "HELD" ? expiry ?? new Date(Date.now() + 10 * 60 * 1000).toISOString() : null,
  };

  const existingIndex = stalls.findIndex((item) => item.id === stallId);
  stalls[existingIndex] = updated;

  return updated;
}

export function attemptHold(stallId: string) {
  const stall = getStallById(stallId);
  if (!stall) return { ok: false, message: "Stall was not found." };
  if (stall.status === "BOOKED" || stall.status === "BLOCKED") {
    return { ok: false, message: "This stall is no longer available." };
  }

  const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const updated = setStallStatus(stallId, "HELD", holdExpiresAt);
  return {
    ok: true,
    message: "Stall placed on hold for 10 minutes.",
    stall: updated,
  };
}

export function releaseHold(stallId: string) {
  const stall = getStallById(stallId);
  if (!stall) return { ok: false, message: "Stall not found." };

  const updated = setStallStatus(stallId, "AVAILABLE", null);
  return {
    ok: true,
    message: "Hold released and stall returned to available status.",
    stall: updated,
  };
}

export function confirmBookingRecord(input: z.infer<typeof bookingInputSchema>) {
  const stall = getStallById(input.stallId);
  if (!stall) {
    return { ok: false, message: "Stall no longer exists." };
  }

  if (stall.status === "BOOKED" || stall.status === "BLOCKED") {
    return { ok: false, message: "This stall cannot be booked." };
  }

  const summary = calculateBookingAmounts(stall.price, stall.advancePercentage);
  const bookingId = `bk-${Date.now()}`;

  const booking: BookingRecord = {
    id: bookingId,
    bookingNumber: `EXB-${Date.now().toString().slice(-6)}`,
    userId: "user-demo",
    name: input.fullName,
    companyName: input.companyName,
    email: input.email,
    phone: input.phone,
    exhibitionId: input.exhibitionId,
    stallId: input.stallId,
    totalAmount: summary.totalAmount,
    advanceAmount: summary.advanceAmount,
    remainingAmount: summary.remainingAmount,
    bookingStatus: "CONFIRMED",
    paymentStatus: "SUCCESS",
    createdAt: new Date().toISOString(),
  };

  demoBookings.unshift(booking);
  setStallStatus(input.stallId, "BOOKED");

  return {
    ok: true,
    booking,
    message: "Booking created successfully.",
  };
}

export function getUserBookingHistory() {
  return demoBookings;
}

export function getStatusCount(exhibitionId: string, status: StallStatus) {
  return getStallsForExhibition(exhibitionId).filter((stall) => stall.status === status).length;
}

export function normalizeCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}
