/**
 * Admin authentication utilities
 * Handles password hashing, verification, and session management
 */

import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "./prisma";
import type { AdminRole } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "admin-secret-key-change-in-production");
const COOKIE_NAME = "admin_session";
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

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
 * Create a JWT token for admin session
 */
export async function createToken(adminId: string): Promise<string> {
  const token = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<{ adminId: string } | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return { adminId: verified.payload.adminId as string };
  } catch {
    return null;
  }
}

/**
 * Set admin session cookie
 */
export async function setAdminSession(token: string): Promise<void> {
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
 * Get admin session from cookies
 */
export async function getAdminSession(): Promise<{ adminId: string; role: AdminRole; name: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.adminId },
    select: { id: true, role: true, name: true, email: true },
  });
  if (!admin) return null;

  return { adminId: admin.id, role: admin.role, name: admin.name, email: admin.email };
}

/**
 * Clear admin session cookie
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Require admin authentication (middleware helper)
 * Use in server components or server actions
 */
export async function requireAdminAuth() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized: Admin authentication required");
  }
  return session;
}

export async function requireAdminRole(allowedRoles: AdminRole[]) {
  const session = await requireAdminAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden: insufficient admin permissions");
  }
  return session;
}
