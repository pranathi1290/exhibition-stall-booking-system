"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createExhibition } from "@/lib/admin";

export default function CreateExhibitionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    venue: "",
    startDate: "",
    endDate: "",
    bannerUrl: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await createExhibition({
        name: formData.name,
        description: formData.description,
        venue: formData.venue,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        bannerUrl: formData.bannerUrl || undefined,
      });

      router.push("/admin/exhibitions");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create exhibition");
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <Link href="/admin/exhibitions" className="text-sm text-violet-600 hover:text-violet-700 font-semibold mb-2 inline-block">
            ← Back to Exhibitions
          </Link>
          <h1 className="text-3xl font-bold">Create Exhibition</h1>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Exhibition Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                placeholder="e.g., India Build Expo 2026"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                required
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                placeholder="Describe the exhibition..."
              />
            </div>

            {/* Venue */}
            <div>
              <label htmlFor="venue" className="block text-sm font-semibold text-slate-700 mb-2">
                Venue *
              </label>
              <input
                id="venue"
                name="venue"
                type="text"
                value={formData.venue}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                placeholder="e.g., Bengaluru International Exhibition Centre"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Date *
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-semibold text-slate-700 mb-2">
                  End Date *
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Banner URL */}
            <div>
              <label htmlFor="bannerUrl" className="block text-sm font-semibold text-slate-700 mb-2">
                Banner URL (Optional)
              </label>
              <input
                id="bannerUrl"
                name="bannerUrl"
                type="url"
                value={formData.bannerUrl}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700 disabled:bg-violet-400"
              >
                {isLoading ? "Creating..." : "Create Exhibition"}
              </button>
              <Link
                href="/admin/exhibitions"
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
