"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { userRegister } from "@/lib/user-actions";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await userRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        company: formData.company || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      });

      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Create Account</p>
        <h1 className="mt-3 text-3xl font-bold">Register</h1>
        <p className="mt-2 text-sm text-slate-600">Complete your profile and start booking exhibition stalls.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-1">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Full name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 disabled:bg-slate-100"
              placeholder="John Doe"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="company" className="mb-2 block text-sm font-medium text-slate-700">
              Company
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 disabled:bg-slate-100"
              placeholder="Your Company"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 disabled:bg-slate-100"
              placeholder="you@example.com"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 disabled:bg-slate-100"
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-slate-700">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 disabled:bg-slate-100"
              placeholder="123 Main St, City"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password * (min 8 characters)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 disabled:bg-slate-100"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:bg-slate-600"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-semibold text-emerald-700">Login</Link>
        </div>
      </div>
    </main>
  );
}
