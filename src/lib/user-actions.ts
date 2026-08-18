/**
 * User authentication server actions
 * Registration, login, logout
 */

"use server";

import { prisma } from "./prisma";
import { hashPassword, verifyPassword, createToken, setUserSession, clearUserSession } from "./user-auth";

export async function userRegister(data: {
  name: string;
  email: string;
  password: string;
  company?: string;
  phone?: string;
  address?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Validation
    if (!data.name?.trim()) return { success: false, error: "Name is required" };
    if (!data.email?.trim()) return { success: false, error: "Email is required" };
    if (!data.password || data.password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" };
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        company: data.company?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
      },
    });

    // Create session token
    const token = await createToken(user.id);
    await setUserSession(token);

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "An error occurred during registration" };
  }
}

export async function userLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validation
    if (!email?.trim()) return { success: false, error: "Email is required" };
    if (!password) return { success: false, error: "Password is required" };

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Create session token
    const token = await createToken(user.id);
    await setUserSession(token);

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
}

export async function userLogout(): Promise<void> {
  try {
    await clearUserSession();
  } catch (error) {
    console.error("Logout error:", error);
  }
}
