"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin } from "@/lib/auth-actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await adminLogin(email, password);
      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error || "Login failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#17211f] px-6 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white p-8 shadow-2xl sm:p-10">
        <p className="eyebrow text-[#c94f3d]">Arc &amp; Aisle control room</p>
        <h1 className="display-title mt-4 text-5xl font-bold">Run the room.</h1>
        <p className="mt-4 text-sm leading-6 text-[#17211f]/60">Sign in to manage exhibitions, stalls, bookings, and the details behind every event.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full rounded-xl border border-[#17211f]/15 bg-[#f5f1ea] px-4 py-3 outline-none transition focus:border-[#c94f3d] focus:ring-4 focus:ring-[#f26b4f]/10 disabled:bg-slate-100"
              placeholder="admin@exhibitionbook.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="w-full rounded-xl border border-[#17211f]/15 bg-[#f5f1ea] px-4 py-3 outline-none transition focus:border-[#c94f3d] focus:ring-4 focus:ring-[#f26b4f]/10 disabled:bg-slate-100"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#c94f3d] px-4 py-3 font-semibold text-white shadow-lg shadow-[#c94f3d]/20 transition hover:-translate-y-0.5 hover:bg-[#ad4032] disabled:bg-[#c94f3d]/60"
          >
            {isLoading ? "Logging in..." : "Access dashboard"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Return to <Link href="/" className="font-semibold text-violet-700">public portal</Link>
        </div>
      </div>
    </main>
  );
}
