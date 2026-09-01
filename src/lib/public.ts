/**
 * Public user data and booking operations
 * No admin auth required - accessible to logged-in users
 */

"use server";

import { prisma } from "./prisma";
import { requireUserAuth } from "./user-auth";
import { getHoldConflictMessage, HOLD_DURATION_MINUTES, isHoldExpired } from "./booking-workflow";

type ExhibitionRecord = NonNullable<Awaited<ReturnType<typeof prisma.exhibition.findFirst>>>;
type StallRecord = NonNullable<Awaited<ReturnType<typeof prisma.stall.findFirst>>>;
type PublicExhibitionRecord = ExhibitionRecord & { _count: { stalls: number } };
type UserProfile = {
  id: string;
  email: string;
  name: string;
  company: string | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
};

// ============================================================================
// PUBLIC QUERIES (no auth needed)
// ============================================================================

export async function getPublicExhibitions(): Promise<PublicExhibitionRecord[]> {
  return prisma.exhibition.findMany({
    where: { status: "ACTIVE" },
    orderBy: { startDate: "asc" },
    include: {
      _count: {
        select: {
          stalls: { where: { status: "AVAILABLE" } },
        },
      },
    },
  });
}

export async function getPublicExhibitionById(id: string): Promise<ExhibitionRecord | null> {
  return prisma.exhibition.findFirst({
    where: {
      id,
      status: "ACTIVE",
    },
  });
}

export async function getPublicStallsByExhibition(exhibitionId: string): Promise<StallRecord[]> {
  await prisma.stall.updateMany({
    where: {
      exhibitionId,
      status: "HELD",
      OR: [{ heldUntil: null }, { heldUntil: { lte: new Date() } }],
    },
    data: { status: "AVAILABLE", heldUntil: null, heldByUserId: null },
  });
  return prisma.stall.findMany({
    where: { exhibitionId },
    orderBy: { stallNumber: "asc" },
  });
}

export async function getPublicStallById(id: string): Promise<StallRecord | null> {
  return prisma.stall.findFirst({
    where: {
      id,
      exhibition: { status: "ACTIVE" },
    },
  });
}

// ============================================================================
// USER QUERIES (requires auth)
// ============================================================================

export async function getUserProfile(): Promise<UserProfile | null> {
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

export async function getUserBookingHistory() {
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

export async function getUserBookingById(bookingId: string) {
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
    const now = new Date();
    const heldUntil = new Date(now.getTime() + HOLD_DURATION_MINUTES * 60 * 1000);
    const result = await prisma.$transaction(async (tx) => {
      const stall = await tx.stall.findUnique({ where: { id: stallId } });
      if (!stall) return { success: false as const, error: "Stall not found" };
      if (stall.status === "HELD" && stall.heldByUserId === session.userId && !isHoldExpired(stall.status, stall.heldUntil, now)) {
        await tx.stall.update({ where: { id: stall.id }, data: { heldUntil } });
        return { success: true as const };
      }
      const claimed = await tx.stall.updateMany({
        where: {
          id: stallId,
          OR: [
            { status: "AVAILABLE" },
            { status: "HELD", OR: [{ heldUntil: null }, { heldUntil: { lte: now } }] },
          ],
        },
        data: { status: "HELD", heldUntil, heldByUserId: session.userId },
      });
      if (claimed.count === 1) return { success: true as const };
      const current = await tx.stall.findUnique({ where: { id: stallId } });
      return { success: false as const, error: current ? getHoldConflictMessage(current.status, current.heldUntil, now) : "Stall not found" };
    });

    return result;
  } catch (error) {
    console.error("Hold stall error:", error);
    return { success: false, error: "Failed to hold stall" };
  }
}

/**
 * Release hold on stall (user cancels before payment)
 */
export async function releaseStallHold(stallId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireUserAuth();

  try {
    const stall = await prisma.stall.findUnique({ where: { id: stallId } });

    if (!stall) {
      return { success: false, error: "Stall not found" };
    }

    if (stall.status !== "HELD" || stall.heldByUserId !== session.userId) {
      return { success: false, error: "Stall is not on hold" };
    }

    // Revert to AVAILABLE
    await prisma.$transaction(async (tx) => tx.stall.update({
      where: { id: stallId },
      data: { status: "AVAILABLE", heldUntil: null, heldByUserId: null },
    }));

    return { success: true };
  } catch (error) {
    console.error("Release hold error:", error);
    return { success: false, error: "Failed to release hold" };
  }
}

/**
 * Create a booking with the database-calculated 50% advance pending.
 * Payment verification confirms the booking later.
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
    const booking = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const [user, exhibition, stall] = await Promise.all([
        tx.user.findUnique({ where: { id: session.userId } }),
        tx.exhibition.findUnique({ where: { id: data.exhibitionId } }),
        tx.stall.findUnique({ where: { id: data.stallId } }),
      ]);
      if (!user) throw new Error("User not found");
      if (!exhibition) throw new Error("Exhibition not found");
      if (!stall || stall.exhibitionId !== exhibition.id) throw new Error("Stall not found");
      if (stall.status !== "HELD" || stall.heldByUserId !== session.userId || !stall.heldUntil || stall.heldUntil <= now) {
        throw new Error(stall ? getHoldConflictMessage(stall.status, stall.heldUntil, now) : "Stall not found");
      }
      const existingBooking = await tx.booking.findUnique({ where: { stallId: stall.id } });
      if (existingBooking) {
        if (existingBooking.userId !== session.userId || existingBooking.bookingStatus === "CONFIRMED") {
          throw new Error("Stall is already booked");
        }
        return existingBooking;
      }
      const bookingNumber = `BK-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      return tx.booking.create({
        data: {
          bookingNumber,
          userId: user.id,
          exhibitionId: exhibition.id,
          stallId: stall.id,
          totalAmount: stall.price,
          advanceAmount: stall.advanceAmount,
          remainingAmount: stall.price.minus(stall.advanceAmount),
          bookingStatus: "PENDING",
          paymentStatus: "PENDING",
        },
      });
    });

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Create booking error:", error);
    const message = error instanceof Error ? error.message : "";
    const knownConflict = ["Stall is already booked", "Stall is currently held by another user", "Stall is blocked", "Stall is not available"];
    return { success: false, error: knownConflict.includes(message) ? message : "Failed to create booking" };
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
          heldByUserId: null,
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
            heldByUserId: null,
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
