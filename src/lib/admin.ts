/**
 * Server actions for admin operations
 * All operations include admin auth verification and validation
 */

"use server";

import { z } from "zod";
import { prisma } from "./prisma";
import { requireAdminAuth, requireAdminRole } from "./auth";
import type { ExhibitionStatus, StallStatus, PaymentType } from "./domain-types";

type ExhibitionRecord = NonNullable<Awaited<ReturnType<typeof prisma.exhibition.findUnique>>>;
type StallRecord = NonNullable<Awaited<ReturnType<typeof prisma.stall.findUnique>>>;

const exhibitionFields = {
  name: z.string().trim().min(1, "Exhibition name is required"),
  description: z.string().trim().min(1, "Description is required"),
  venue: z.string().trim().min(1, "Venue is required"),
  startDate: z.date().refine((date) => !Number.isNaN(date.getTime()), "Invalid start date"),
  endDate: z.date().refine((date) => !Number.isNaN(date.getTime()), "Invalid end date"),
  bannerUrl: z.string().trim().url("Banner URL must be valid").optional(),
  locationUrl: z.string().trim().url("Location link must be valid").optional(),
};

const stallFields = {
  stallNumber: z.string().trim().min(1, "Stall number is required"),
  width: z.number().finite().positive("Width must be a positive number"),
  length: z.number().finite().positive("Length must be a positive number"),
  price: z.number().finite().positive("Price must be a positive number"),
  advancePercentage: z.number().int().min(1).max(100),
  positionX: z.number().int(),
  positionY: z.number().int(),
};

const exhibitionSchema = z.object(exhibitionFields);

function validationMessage(error: z.ZodError) {
  return error.issues[0]?.message || "Invalid admin input";
}

// ============================================================================
// EXHIBITION OPERATIONS
// ============================================================================

export async function getExhibitions(): Promise<ExhibitionRecord[]> {
  await requireAdminAuth();
  return prisma.exhibition.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getExhibitionById(id: string): Promise<ExhibitionRecord | null> {
  await requireAdminAuth();
  return prisma.exhibition.findUnique({
    where: { id },
  });
}

export async function createExhibition(data: {
  name: string;
  description: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  bannerUrl?: string;
  locationUrl?: string;
  status?: ExhibitionStatus;
}): Promise<ExhibitionRecord> {
  await requireAdminRole(["SUPER_ADMIN", "WORKSPACE_ADMIN"]);

  const parsed = exhibitionSchema.extend({ status: z.enum(["DRAFT", "ACTIVE", "ENDED", "CANCELLED"]).optional() })
    .superRefine((value, context) => {
      if (value.startDate >= value.endDate) {
        context.addIssue({ code: "custom", path: ["endDate"], message: "Start date must be before end date" });
      }
    })
    .safeParse(data);
  if (!parsed.success) throw new Error(validationMessage(parsed.error));

  return prisma.exhibition.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      venue: parsed.data.venue,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      bannerUrl: parsed.data.bannerUrl || null,
      locationUrl: parsed.data.locationUrl || null,
      status: parsed.data.status || "ACTIVE",
    },
  });
}

export async function updateExhibition(
  id: string,
  data: {
    name?: string;
    description?: string;
    venue?: string;
    startDate?: Date;
    endDate?: Date;
    bannerUrl?: string;
    locationUrl?: string;
    status?: ExhibitionStatus;
  }
): Promise<ExhibitionRecord> {
  await requireAdminRole(["SUPER_ADMIN", "WORKSPACE_ADMIN"]);

  const existing = await prisma.exhibition.findUnique({ where: { id } });
  if (!existing) throw new Error("Exhibition not found");

  const parsed = exhibitionSchema.partial().extend({ status: z.enum(["DRAFT", "ACTIVE", "ENDED", "CANCELLED"]).optional() })
    .safeParse(data);
  if (!parsed.success) throw new Error(validationMessage(parsed.error));

  const startDate = parsed.data.startDate ?? existing.startDate;
  const endDate = parsed.data.endDate ?? existing.endDate;
  if (startDate >= endDate) throw new Error("Start date must be before end date");

  return prisma.exhibition.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      venue: parsed.data.venue,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      bannerUrl: parsed.data.bannerUrl || null,
      locationUrl: parsed.data.locationUrl || null,
      status: parsed.data.status,
    },
  });
}

export async function deleteExhibition(id: string): Promise<void> {
  await requireAdminRole(["SUPER_ADMIN", "WORKSPACE_ADMIN"]);

  const exhibition = await prisma.exhibition.findUnique({
    where: { id },
    include: { bookings: true },
  });

  if (!exhibition) throw new Error("Exhibition not found");
  if (exhibition.bookings.length > 0) {
    throw new Error("Cannot delete exhibition with active bookings");
  }

  await prisma.exhibition.delete({ where: { id } });
}

// ============================================================================
// STALL OPERATIONS
// ============================================================================

export async function getStallsByExhibition(exhibitionId: string): Promise<StallRecord[]> {
  await requireAdminAuth();

  return prisma.stall.findMany({
    where: { exhibitionId },
    orderBy: { stallNumber: "asc" },
  });
}

export async function getStallById(id: string): Promise<(Omit<StallRecord, "width" | "length" | "area" | "price" | "advanceAmount"> & {
  width: number;
  length: number;
  area: number;
  price: number;
  advanceAmount: number;
}) | null> {
  await requireAdminAuth();
  const stall = await prisma.stall.findUnique({ where: { id } });
  if (!stall) return null;

  // Decimal fields must be serialized before crossing the client-component boundary.
  return {
    ...stall,
    width: stall.width.toNumber(),
    length: stall.length.toNumber(),
    area: stall.area.toNumber(),
    price: stall.price.toNumber(),
    advanceAmount: stall.advanceAmount.toNumber(),
  };
}

export async function createStall(data: {
  exhibitionId: string;
  stallNumber: string;
  width: number;
  length: number;
  price: number;
  advancePercentage?: number;
  positionX: number;
  positionY: number;
  status?: StallStatus;
}): Promise<StallRecord> {
  await requireAdminRole(["SUPER_ADMIN", "WORKSPACE_ADMIN"]);

  const parsed = z.object({
    exhibitionId: z.string().trim().min(1, "Exhibition is required"),
    ...stallFields,
    status: z.enum(["AVAILABLE", "HELD", "BOOKED", "BLOCKED"]).optional(),
  }).safeParse({ ...data, advancePercentage: data.advancePercentage ?? 50 });
  if (!parsed.success) throw new Error(validationMessage(parsed.error));

  // Check exhibition exists
  const exhibition = await prisma.exhibition.findUnique({
    where: { id: parsed.data.exhibitionId },
  });
  if (!exhibition) throw new Error("Exhibition not found");

  // Check stall number is unique per exhibition
  const existing = await prisma.stall.findFirst({
    where: {
      exhibitionId: parsed.data.exhibitionId,
      stallNumber: parsed.data.stallNumber,
    },
  });
  if (existing) throw new Error("Stall number already exists for this exhibition");

  const area = parsed.data.width * parsed.data.length;
  const advanceAmount = (parsed.data.price * parsed.data.advancePercentage) / 100;

  return prisma.stall.create({
    data: {
      stallNumber: parsed.data.stallNumber,
      exhibitionId: parsed.data.exhibitionId,
      width: parsed.data.width,
      length: parsed.data.length,
      area,
      price: parsed.data.price,
      advancePercentage: parsed.data.advancePercentage,
      advanceAmount,
      positionX: parsed.data.positionX,
      positionY: parsed.data.positionY,
      status: parsed.data.status || "AVAILABLE",
    },
  });
}

export async function updateStall(
  id: string,
  data: {
    stallNumber?: string;
    width?: number;
    length?: number;
    price?: number;
    advancePercentage?: number;
    positionX?: number;
    positionY?: number;
    status?: StallStatus;
  }
): Promise<StallRecord> {
  await requireAdminAuth();

  const existing = await prisma.stall.findUnique({ where: { id } });
  if (!existing) throw new Error("Stall not found");

  const parsed = z.object(stallFields)
    .partial()
    .extend({ status: z.enum(["AVAILABLE", "HELD", "BOOKED", "BLOCKED"]).optional() })
    .safeParse(data);
  if (!parsed.success) throw new Error(validationMessage(parsed.error));

  // Check stall number uniqueness if changing
  if (parsed.data.stallNumber && parsed.data.stallNumber !== existing.stallNumber) {
    const duplicate = await prisma.stall.findFirst({
      where: {
        exhibitionId: existing.exhibitionId,
        stallNumber: parsed.data.stallNumber,
      },
    });
    if (duplicate) throw new Error("Stall number already exists for this exhibition");
  }

  // Recalculate area and advance if needed
  const updateData: {
    stallNumber?: string;
    area?: number;
    advanceAmount?: number;
    width?: number;
    length?: number;
    price?: number;
    advancePercentage?: number;
    positionX?: number;
    positionY?: number;
    status?: StallStatus;
  } = {};
  if (parsed.data.stallNumber !== undefined) updateData.stallNumber = parsed.data.stallNumber;
  if (parsed.data.width !== undefined || parsed.data.length !== undefined) {
    const width = parsed.data.width ?? Number(existing.width);
    const length = parsed.data.length ?? Number(existing.length);
    updateData.area = width * length;
  }
  if (parsed.data.price !== undefined || parsed.data.advancePercentage !== undefined) {
    const price = parsed.data.price ?? Number(existing.price);
    const advancePercentage = parsed.data.advancePercentage ?? existing.advancePercentage;
    updateData.advanceAmount = (price * advancePercentage) / 100;
  }

  // Convert numbers to Decimal
  if (parsed.data.width !== undefined) updateData.width = parsed.data.width;
  if (parsed.data.length !== undefined) updateData.length = parsed.data.length;
  if (parsed.data.price !== undefined) updateData.price = parsed.data.price;
  if (parsed.data.advancePercentage !== undefined) updateData.advancePercentage = parsed.data.advancePercentage;
  if (parsed.data.positionX !== undefined) updateData.positionX = parsed.data.positionX;
  if (parsed.data.positionY !== undefined) updateData.positionY = parsed.data.positionY;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

  return prisma.stall.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteStall(id: string): Promise<void> {
  await requireAdminRole(["SUPER_ADMIN", "WORKSPACE_ADMIN"]);

  const stall = await prisma.stall.findUnique({
    where: { id },
    include: { booking: true },
  });

  if (!stall) throw new Error("Stall not found");
  if (stall.booking && stall.booking.bookingStatus !== "CANCELLED") {
    throw new Error("Cannot delete stall with active booking");
  }

  await prisma.stall.delete({ where: { id } });
}

// ============================================================================
// STATISTICS & QUERIES
// ============================================================================

export async function getExhibitionStats(exhibitionId: string): Promise<{
  totalStalls: number;
  available: number;
  held: number;
  booked: number;
  blocked: number;
}> {
  await requireAdminAuth();

  const stalls = await prisma.stall.findMany({
    where: { exhibitionId },
  });

  return {
    totalStalls: stalls.length,
    available: stalls.filter((s) => s.status === "AVAILABLE").length,
    held: stalls.filter((s) => s.status === "HELD").length,
    booked: stalls.filter((s) => s.status === "BOOKED").length,
    blocked: stalls.filter((s) => s.status === "BLOCKED").length,
  };
}

export async function getGlobalStats(): Promise<{
  totalExhibitions: number;
  totalStalls: number;
  totalBookings: number;
  availableStalls: number;
}> {
  await requireAdminAuth();

  const [exhibitions, stalls, bookings] = await Promise.all([
    prisma.exhibition.findMany(),
    prisma.stall.findMany(),
    prisma.booking.findMany({ where: { bookingStatus: "CONFIRMED" } }),
  ]);

  return {
    totalExhibitions: exhibitions.length,
    totalStalls: stalls.length,
    totalBookings: bookings.length,
    availableStalls: stalls.filter((s) => s.status === "AVAILABLE").length,
  };
}

export async function getAdminBookings() {
  await requireAdminAuth();
  return prisma.booking.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, company: true, phone: true, address: true } },
      exhibition: true,
      stall: true,
      payments: { orderBy: { paymentDate: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminUsers() {
  await requireAdminAuth();
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, company: true },
    orderBy: { name: "asc" },
  });
}

export async function createManualBooking(data: {
  userId: string;
  exhibitionId: string;
  stallId: string;
  advancePaid: boolean;
}) {
  await requireAdminRole(["SUPER_ADMIN", "WORKSPACE_ADMIN"]);

  const parsed = z.object({
    userId: z.string().min(1),
    exhibitionId: z.string().min(1),
    stallId: z.string().min(1),
    advancePaid: z.boolean(),
  }).safeParse(data);
  if (!parsed.success) throw new Error(validationMessage(parsed.error));

  return prisma.$transaction(async (tx) => {
    const [user, exhibition, stall] = await Promise.all([
      tx.user.findUnique({ where: { id: parsed.data.userId } }),
      tx.exhibition.findUnique({ where: { id: parsed.data.exhibitionId } }),
      tx.stall.findUnique({ where: { id: parsed.data.stallId } }),
    ]);
    if (!user) throw new Error("Customer not found");
    if (!exhibition) throw new Error("Exhibition not found");
    if (!stall || stall.exhibitionId !== exhibition.id) throw new Error("Stall does not belong to this exhibition");
    if (stall.status !== "AVAILABLE") throw new Error("Stall is not available");

    const bookingNumber = `BK-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const booking = await tx.booking.create({
      data: {
        bookingNumber,
        userId: user.id,
        exhibitionId: exhibition.id,
        stallId: stall.id,
        totalAmount: stall.price,
        advanceAmount: stall.advanceAmount,
        remainingAmount: Number(stall.price) - Number(stall.advanceAmount),
        bookingStatus: "CONFIRMED",
        paymentStatus: parsed.data.advancePaid && Number(stall.price) === Number(stall.advanceAmount) ? "SUCCESS" : "PENDING",
      },
    });

    await tx.stall.update({ where: { id: stall.id }, data: { status: "BOOKED", heldUntil: null } });
    if (parsed.data.advancePaid) {
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: stall.advanceAmount,
          paymentType: "ADVANCE",
          paymentStatus: "SUCCESS",
          paymentDate: new Date(),
        },
      });
    }
    return booking;
  });
}

export async function cancelAdminBooking(bookingId: string): Promise<void> {
  await requireAdminRole(["SUPER_ADMIN", "WORKSPACE_ADMIN"]);
  if (!z.string().min(1).safeParse(bookingId).success) throw new Error("Booking is required");

  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");
    if (booking.bookingStatus === "CANCELLED") throw new Error("Booking is already cancelled");

    await tx.booking.update({ where: { id: booking.id }, data: { bookingStatus: "CANCELLED", paymentStatus: "REFUNDED" } });
    await tx.stall.updateMany({
      where: { id: booking.stallId, status: { in: ["BOOKED", "HELD"] } },
      data: { status: "AVAILABLE", heldUntil: null },
    });
  });
}

export async function recordAdminPayment(data: {
  bookingId: string;
  amount: number;
  paymentType: PaymentType;
  transactionId?: string;
}): Promise<void> {
  await requireAdminRole(["SUPER_ADMIN", "WORKSPACE_ADMIN"]);
  const parsed = z.object({
    bookingId: z.string().min(1),
    amount: z.number().finite().positive(),
    paymentType: z.enum(["ADVANCE", "BALANCE"]),
    transactionId: z.string().trim().max(200).optional(),
  }).safeParse(data);
  if (!parsed.success) throw new Error(validationMessage(parsed.error));

  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: parsed.data.bookingId }, include: { payments: true } });
    if (!booking) throw new Error("Booking not found");
    if (booking.bookingStatus === "CANCELLED") throw new Error("Cannot record payment for a cancelled booking");

    const paid = booking.payments
      .filter((payment) => payment.paymentStatus === "SUCCESS")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const totalAmount = Number(booking.totalAmount);
    const outstanding = totalAmount - paid;
    const amount = parsed.data.amount;
    if (amount > outstanding + 1e-9) throw new Error("Payment exceeds the outstanding balance");

    await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount,
        paymentType: parsed.data.paymentType,
        paymentGatewayTransactionId: parsed.data.transactionId?.trim() || null,
        paymentStatus: "SUCCESS",
        paymentDate: new Date(),
      },
    });
    if (paid + amount >= totalAmount - 1e-9) {
      await tx.booking.update({ where: { id: booking.id }, data: { paymentStatus: "SUCCESS" } });
    }
  });
}

export async function updateStallLayout(stallId: string, positionX: number, positionY: number): Promise<void> {
  await requireAdminRole(["SUPER_ADMIN", "WORKSPACE_ADMIN"]);
  const parsed = z.object({ stallId: z.string().min(1), positionX: z.number().int(), positionY: z.number().int() })
    .safeParse({ stallId, positionX, positionY });
  if (!parsed.success) throw new Error(validationMessage(parsed.error));
  const result = await prisma.stall.updateMany({
    where: { id: parsed.data.stallId },
    data: { positionX: parsed.data.positionX, positionY: parsed.data.positionY },
  });
  if (result.count !== 1) throw new Error("Stall not found");
}
