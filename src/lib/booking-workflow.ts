import type { StallStatus } from "@prisma/client";

export const HOLD_DURATION_MINUTES = 10;

export function isHoldExpired(status: StallStatus, heldUntil: Date | null, now = new Date()): boolean {
  return status === "HELD" && (!heldUntil || heldUntil.getTime() <= now.getTime());
}

export function canClaimStall(
  status: StallStatus,
  heldUntil: Date | null,
  heldByUserId: string | null,
  userId: string,
  now = new Date()
): boolean {
  return status === "AVAILABLE" || (isHoldExpired(status, heldUntil, now)) || (status === "HELD" && heldByUserId === userId && !!heldUntil && heldUntil > now);
}

export function getHoldConflictMessage(status: StallStatus, heldUntil: Date | null, now = new Date()): string {
  if (status === "BOOKED") return "Stall is already booked";
  if (status === "HELD" && !isHoldExpired(status, heldUntil, now)) return "Stall is currently held by another user";
  if (status === "BLOCKED") return "Stall is blocked";
  return "Stall is not available";
}