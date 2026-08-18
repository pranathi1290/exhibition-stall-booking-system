/**
 * Server actions for admin operations
 * All operations include admin auth verification and validation
 */

"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { requireAdminAuth } from "./auth";
import type { Exhibition, Stall, ExhibitionStatus, StallStatus } from "@prisma/client";

// ============================================================================
// EXHIBITION OPERATIONS
// ============================================================================

export async function getExhibitions(): Promise<Exhibition[]> {
  await requireAdminAuth();
  return prisma.exhibition.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getExhibitionById(id: string): Promise<Exhibition | null> {
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
  status?: ExhibitionStatus;
}): Promise<Exhibition> {
  await requireAdminAuth();

  // Validation
  if (!data.name?.trim()) throw new Error("Exhibition name is required");
  if (!data.description?.trim()) throw new Error("Description is required");
  if (!data.venue?.trim()) throw new Error("Venue is required");
  if (!(data.startDate instanceof Date)) throw new Error("Invalid start date");
  if (!(data.endDate instanceof Date)) throw new Error("Invalid end date");
  if (data.startDate >= data.endDate) throw new Error("Start date must be before end date");

  return prisma.exhibition.create({
    data: {
      name: data.name.trim(),
      description: data.description.trim(),
      venue: data.venue.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      bannerUrl: data.bannerUrl?.trim() || null,
      status: data.status || "ACTIVE",
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
    status?: ExhibitionStatus;
  }
): Promise<Exhibition> {
  await requireAdminAuth();

  const existing = await prisma.exhibition.findUnique({ where: { id } });
  if (!existing) throw new Error("Exhibition not found");

  // Validation
  if (data.name !== undefined && !data.name.trim()) throw new Error("Exhibition name cannot be empty");
  if (data.description !== undefined && !data.description.trim()) throw new Error("Description cannot be empty");
  if (data.venue !== undefined && !data.venue.trim()) throw new Error("Venue cannot be empty");

  if (data.startDate && data.endDate) {
    if (data.startDate >= data.endDate) throw new Error("Start date must be before end date");
  } else if (data.startDate) {
    if (data.startDate >= existing.endDate) throw new Error("Start date must be before end date");
  } else if (data.endDate) {
    if (existing.startDate >= data.endDate) throw new Error("Start date must be before end date");
  }

  return prisma.exhibition.update({
    where: { id },
    data: {
      name: data.name?.trim(),
      description: data.description?.trim(),
      venue: data.venue?.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      bannerUrl: data.bannerUrl?.trim() || null,
      status: data.status,
    },
  });
}

export async function deleteExhibition(id: string): Promise<void> {
  await requireAdminAuth();

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

export async function getStallsByExhibition(exhibitionId: string): Promise<Stall[]> {
  await requireAdminAuth();

  return prisma.stall.findMany({
    where: { exhibitionId },
    orderBy: { stallNumber: "asc" },
  });
}

export async function getStallById(id: string): Promise<Stall | null> {
  await requireAdminAuth();
  return prisma.stall.findUnique({ where: { id } });
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
}): Promise<Stall> {
  await requireAdminAuth();

  // Validation
  if (!data.stallNumber?.trim()) throw new Error("Stall number is required");
  if (!data.exhibitionId?.trim()) throw new Error("Exhibition is required");
  if (typeof data.width !== "number" || data.width <= 0) throw new Error("Width must be a positive number");
  if (typeof data.length !== "number" || data.length <= 0) throw new Error("Length must be a positive number");
  if (typeof data.price !== "number" || data.price <= 0) throw new Error("Price must be a positive number");

  // Check exhibition exists
  const exhibition = await prisma.exhibition.findUnique({
    where: { id: data.exhibitionId },
  });
  if (!exhibition) throw new Error("Exhibition not found");

  // Check stall number is unique per exhibition
  const existing = await prisma.stall.findFirst({
    where: {
      exhibitionId: data.exhibitionId,
      stallNumber: data.stallNumber.trim(),
    },
  });
  if (existing) throw new Error("Stall number already exists for this exhibition");

  const area = new Prisma.Decimal(data.width).times(data.length);
  const advancePercentage = data.advancePercentage || 50;
  const advanceAmount = new Prisma.Decimal(data.price).times(advancePercentage).dividedBy(100);

  return prisma.stall.create({
    data: {
      stallNumber: data.stallNumber.trim(),
      exhibitionId: data.exhibitionId,
      width: new Prisma.Decimal(data.width),
      length: new Prisma.Decimal(data.length),
      area,
      price: new Prisma.Decimal(data.price),
      advancePercentage,
      advanceAmount,
      positionX: data.positionX,
      positionY: data.positionY,
      status: data.status || "AVAILABLE",
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
): Promise<Stall> {
  await requireAdminAuth();

  const existing = await prisma.stall.findUnique({ where: { id } });
  if (!existing) throw new Error("Stall not found");

  // Validation
  if (data.stallNumber !== undefined && !data.stallNumber.trim()) throw new Error("Stall number cannot be empty");
  if (data.width !== undefined && (typeof data.width !== "number" || data.width <= 0)) {
    throw new Error("Width must be a positive number");
  }
  if (data.length !== undefined && (typeof data.length !== "number" || data.length <= 0)) {
    throw new Error("Length must be a positive number");
  }
  if (data.price !== undefined && (typeof data.price !== "number" || data.price <= 0)) {
    throw new Error("Price must be a positive number");
  }

  // Check stall number uniqueness if changing
  if (data.stallNumber && data.stallNumber !== existing.stallNumber) {
    const duplicate = await prisma.stall.findFirst({
      where: {
        exhibitionId: existing.exhibitionId,
        stallNumber: data.stallNumber.trim(),
      },
    });
    if (duplicate) throw new Error("Stall number already exists for this exhibition");
  }

  // Recalculate area and advance if needed
  let updateData: any = { ...data };
  if (data.stallNumber) updateData.stallNumber = data.stallNumber.trim();
  if (data.width || data.length) {
    const width = data.width ?? existing.width;
    const length = data.length ?? existing.length;
    updateData.area = new Prisma.Decimal(width).times(length);
  }
  if (data.price || data.advancePercentage !== undefined) {
    const price = data.price ?? existing.price;
    const advancePercentage = data.advancePercentage ?? existing.advancePercentage;
    updateData.advanceAmount = new Prisma.Decimal(price).times(advancePercentage).dividedBy(100);
  }

  // Convert numbers to Decimal
  if (data.width) updateData.width = new Prisma.Decimal(data.width);
  if (data.length) updateData.length = new Prisma.Decimal(data.length);
  if (data.price) updateData.price = new Prisma.Decimal(data.price);

  return prisma.stall.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteStall(id: string): Promise<void> {
  await requireAdminAuth();

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
