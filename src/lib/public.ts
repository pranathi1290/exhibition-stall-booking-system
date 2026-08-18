/**
 * Public user data and booking operations
 * No admin auth required - accessible to logged-in users
 */

"use server";

import { prisma } from "./prisma";
import { requireUserAuth } from "./user-auth";
import type { Exhibition, Stall, Booking } from "@prisma/client";

// ============================================================================
// PUBLIC QUERIES (no auth needed)
// ============================================================================

export async function getPublicExhibitions(): Promise<Exhibition[]> {
  return prisma.exhibition.findMany({
    where: { status: "ACTIVE" },
    orderBy: { startDate: "asc" },
  });
}

export async function getPublicExhibitionById(id: string): Promise<Exhibition | null> {
  return prisma.exhibition.findFirst({
    where: {
      id,
      status: "ACTIVE",
    },
  });
}

export async function getPublicStallsByExhibition(exhibitionId: string): Promise<Stall[]> {
  return prisma.stall.findMany({
    where: { exhibitionId },
    orderBy: { stallNumber: "asc" },
  });
}

export async function getPublicStallById(id: string): Promise<Stall | null> {
  return prisma.stall.findUnique({
    where: { id },
  });
}

// ============================================================================
// USER QUERIES (requires auth)
// ============================================================================

export async function getUserProfile(): Promise<any> {
  const session = await requireUserAuth();

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      company: true,
      phone: true,
      address: true,
      createdAt: true,
    },
  });
}

export async function getUserBookingHistory(): Promise<(Booking & { exhibition: Exhibition; stall: Stall })[]> {
  const session = await requireUserAuth();

  return prisma.booking.findMany({
    where: { userId: session.userId },
    include: {
      exhibition: true,
      stall: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserBookingById(bookingId: string): Promise<any> {
  const session = await requireUserAuth();

  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: session.userId,
    },
    include: {
      exhibition: true,
      stall: true,
      payments: true,
    },
  });
}

// ============================================================================
// BOOKING OPERATIONS (requires auth)
// ============================================================================

/**
 * Place a stall on hold for 10 minutes
 * User initiates payment after this
 */
export async function holdStall(stallId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireUserAuth();

  try {
    const stall = await prisma.stall.findUnique({
      where: { id: stallId },
    });

    if (!stall) {
      return { success: false, error: "Stall not found" };
    }

    // Can only hold AVAILABLE stalls
    if (stall.status !== "AVAILABLE") {
      return { success: false, error: "Stall is not available" };
    }

    // Check if user already has a confirmed booking for this stall
    const existingBooking = await prisma.booking.findFirst({
      where: {
        stallId,
        bookingStatus: "CONFIRMED",
      },
    });

    if (existingBooking) {
      return { success: false, error: "Stall is already booked" };
    }

    // Set hold expiry to 10 minutes from now
    const heldUntil = new Date(Date.now() + 10 * 60 * 1000);

    // Update stall to HELD
    await prisma.stall.update({
      where: { id: stallId },
      data: {
        status: "HELD",
        heldUntil,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Hold stall error:", error);
    return { success: false, error: "Failed to hold stall" };
  }
}

/**
 * Release hold on stall (user cancels before payment)
 */
export async function releaseStallHold(stallId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stall = await prisma.stall.findUnique({
      where: { id: stallId },
    });

    if (!stall) {
      return { success: false, error: "Stall not found" };
    }

    if (stall.status !== "HELD") {
      return { success: false, error: "Stall is not on hold" };
    }

    // Revert to AVAILABLE
    await prisma.stall.update({
      where: { id: stallId },
      data: {
        status: "AVAILABLE",
        heldUntil: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Release hold error:", error);
    return { success: false, error: "Failed to release hold" };
  }
}

/**
 * Create a booking with 50% advance payment pending
 * This is called after successful payment
 */
export async function createBooking(data: {
  exhibitionId: string;
  stallId: string;
  companyName: string;
  phone: string;
  address: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string; bookingId?: string }> {
  const session = await requireUserAuth();

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get stall
    const stall = await prisma.stall.findUnique({
      where: { id: data.stallId },
    });

    if (!stall) {
      return { success: false, error: "Stall not found" };
    }

    // Verify stall is held or available
    if (stall.status !== "HELD" && stall.status !== "AVAILABLE") {
      return { success: false, error: "Stall is not available" };
    }

    // Get exhibition
    const exhibition = await prisma.exhibition.findUnique({
      where: { id: data.exhibitionId },
    });

    if (!exhibition) {
      return { success: false, error: "Exhibition not found" };
    }

    // Check for existing booking on this stall
    const existingBooking = await prisma.booking.findFirst({
      where: {
        stallId: data.stallId,
        bookingStatus: "CONFIRMED",
      },
    });

    if (existingBooking) {
      return { success: false, error: "Stall is already booked" };
    }

    // Create booking number
    const count = await prisma.booking.count();
    const bookingNumber = `BK-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

    // Create booking with PENDING status (waiting for payment)
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        userId: session.userId,
        exhibitionId: data.exhibitionId,
        stallId: data.stallId,
        totalAmount: stall.price,
        advanceAmount: stall.advanceAmount,
        remainingAmount: stall.price.minus(stall.advanceAmount),
        bookingStatus: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Create booking error:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

/**
 * Confirm booking after payment verification
 * (Called after Razorpay payment verification)
 */
export async function confirmBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireUserAuth();

  try {
    // Get booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: session.userId,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.bookingStatus !== "PENDING") {
      return { success: false, error: "Booking cannot be confirmed" };
    }

    // Update booking and stall in transaction
    await prisma.$transaction(async (tx) => {
      // Update booking
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: "CONFIRMED",
          paymentStatus: "SUCCESS",
        },
      });

      // Mark stall as BOOKED
      await tx.stall.update({
        where: { id: booking.stallId },
        data: {
          status: "BOOKED",
          heldUntil: null,
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Confirm booking error:", error);
    return { success: false, error: "Failed to confirm booking" };
  }
}

/**
 * Cancel a pending booking (release hold)
 */
export async function cancelBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireUserAuth();

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: session.userId,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.bookingStatus === "CANCELLED") {
      return { success: false, error: "Booking is already cancelled" };
    }

    // Cancel booking and release stall hold in transaction
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { bookingStatus: "CANCELLED" },
      });

      // Revert stall to AVAILABLE if it was HELD
      const stall = await tx.stall.findUnique({
        where: { id: booking.stallId },
      });

      if (stall?.status === "HELD") {
        await tx.stall.update({
          where: { id: booking.stallId },
          data: {
            status: "AVAILABLE",
            heldUntil: null,
          },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Cancel booking error:", error);
    return { success: false, error: "Failed to cancel booking" };
  }
}
