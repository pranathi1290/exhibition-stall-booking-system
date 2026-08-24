/**
 * Admin authentication server actions
 * Login, logout, and session management
 */

"use server";

import { prisma } from "./prisma";
import { hashPassword, verifyPassword, createToken, setAdminSession, clearAdminSession } from "./auth";
import { requireAdminRole } from "./auth";
import type { AdminRole } from "@prisma/client";

export async function adminLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validation
    if (!email?.trim()) return { success: false, error: "Email is required" };
    if (!password) return { success: false, error: "Password is required" };

    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password
    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Create session token
    const token = await createToken(admin.id);
    await setAdminSession(token);

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await clearAdminSession();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

export async function getAdminUsers() {
  await requireAdminRole(["SUPER_ADMIN"]);
  return prisma.adminUser.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Create initial admin user (for setup only)
 * Remove or restrict this after initial setup
 */
export async function createAdminUser(email: string, name: string, password: string, role: AdminRole = "TEAM_MEMBER"): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminRole(["SUPER_ADMIN"]);
    // Validation
    if (!email?.trim()) return { success: false, error: "Email is required" };
    if (!name?.trim()) return { success: false, error: "Name is required" };
    if (!password || password.length < 8) return { success: false, error: "Password must be at least 8 characters" };

    // Check if admin already exists
    const existing = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return { success: false, error: "Admin user already exists" };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin user
    await prisma.adminUser.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash,
        role,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, error: "An error occurred while creating admin user" };
  }
}

export async function updateAdminRole(adminId: string, role: AdminRole): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAdminRole(["SUPER_ADMIN"]);
    if (session.adminId === adminId && role !== "SUPER_ADMIN") {
      return { success: false, error: "You cannot remove your own super admin access" };
    }
    await prisma.adminUser.update({ where: { id: adminId }, data: { role } });
    return { success: true };
  } catch (error) {
    console.error("Error updating admin role:", error);
    return { success: false, error: "Only a super admin can update roles" };
  }
}

export async function removeAdminUser(adminId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAdminRole(["SUPER_ADMIN"]);
    if (session.adminId === adminId) return { success: false, error: "You cannot remove your own account" };
    await prisma.adminUser.delete({ where: { id: adminId } });
    return { success: true };
  } catch (error) {
    console.error("Error removing admin user:", error);
    return { success: false, error: "Only a super admin can remove admins" };
  }
}
