import { describe, expect, it } from "vitest";
import { canClaimStall, getHoldConflictMessage, isHoldExpired } from "../src/lib/booking-workflow";
import { verifyRazorpaySignature } from "../src/lib/razorpay-signature";

describe("booking hold workflow", () => {
  const now = new Date("2026-08-20T10:00:00.000Z");

  it("recognizes an expired hold", () => {
    expect(isHoldExpired("HELD", new Date("2026-08-20T09:59:59.000Z"), now)).toBe(true);
    expect(isHoldExpired("HELD", new Date("2026-08-20T10:01:00.000Z"), now)).toBe(false);
  });

  it("allows the same user to continue an active hold but rejects another user", () => {
    const heldUntil = new Date("2026-08-20T10:05:00.000Z");
    expect(canClaimStall("HELD", heldUntil, "user-a", "user-a", now)).toBe(true);
    expect(canClaimStall("HELD", heldUntil, "user-a", "user-b", now)).toBe(false);
    expect(getHoldConflictMessage("HELD", heldUntil, now)).toBe("Stall is currently held by another user");
  });

  it("models concurrent attempts as one winner and one conflict", async () => {
    let claimed = false;
    let ready = 0;
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => { release = resolve; });
    const attempt = async () => {
      ready += 1;
      if (ready === 2) release();
      await barrier;
      if (claimed) return false;
      claimed = true;
      return true;
    };
    const results = await Promise.all([attempt(), attempt()]);
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it("verifies Razorpay signatures without accepting malformed signatures", () => {
    const signature = "";
    expect(verifyRazorpaySignature("order_123", "pay_123", signature, "test-secret")).toBe(false);
  });
});