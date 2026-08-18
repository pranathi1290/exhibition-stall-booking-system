/**
 * Admin authentication server actions
 * Login, logout, and session management
 */

"use server";

import { prisma } from "./prisma";
import { hashPassword, verifyPassword, createToken, setAdminSession, clearAdminSession } from "./auth";

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

/**
 * Create initial admin user (for setup only)
 * Remove or restrict this after initial setup
 */
export async function createAdminUser(email: string, name: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
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
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, error: "An error occurred while creating admin user" };
  }
}
