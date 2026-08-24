/**
 * User authentication utilities
 * Handles user registration, login, and session management
 * Separate from admin authentication
 */

import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "user-secret-key-change-in-production");
const COOKIE_NAME = "user_session";
const TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

/**
 * Create a JWT token for user session
 */
export async function createToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId, type: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<{ userId: string; type: string } | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return {
      userId: verified.payload.userId as string,
      type: verified.payload.type as string,
    };
  } catch {
    return null;
  }
}

/**
 * Set user session cookie
 */
export async function setUserSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds
    path: "/",
  });
}

/**
 * Get user session from cookies
 */
export async function getUserSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const verified = await verifyToken(token);
  if (!verified || verified.type !== "user") {
    return null;
  }

  return { userId: verified.userId };
}

/**
 * Clear user session cookie
 */
export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Require user authentication (middleware helper)
 * Use in server components or server actions
 */
export async function requireUserAuth() {
  const session = await getUserSession();
  if (!session) {
    throw new Error("Unauthorized: User authentication required");
  }
  return session;
}
