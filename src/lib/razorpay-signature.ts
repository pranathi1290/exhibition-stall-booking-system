import crypto from "node:crypto";

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
