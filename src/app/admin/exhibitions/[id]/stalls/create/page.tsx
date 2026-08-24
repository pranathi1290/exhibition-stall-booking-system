"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createStall } from "@/lib/admin";

export default function CreateStallPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [formData, setFormData] = useState({
    stallNumber: "",
    width: "",
    length: "",
    price: "",
    advancePercentage: "50",
    positionX: "0",
    positionY: "0",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await createStall({
        exhibitionId: id,
        stallNumber: formData.stallNumber,
        width: parseFloat(formData.width),
        length: parseFloat(formData.length),
        price: parseFloat(formData.price),
        advancePercentage: parseInt(formData.advancePercentage),
        positionX: parseInt(formData.positionX),
        positionY: parseInt(formData.positionY),
      });

      router.push(`/admin/exhibitions/${id}/stalls`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create stall");
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

  // Calculate area and advance in real-time
  const area = formData.width && formData.length 
    ? (parseFloat(formData.width) * parseFloat(formData.length)).toFixed(2)
    : "0";
  const advance = formData.price && formData.advancePercentage
    ? (parseFloat(formData.price) * (parseInt(formData.advancePercentage) / 100)).toFixed(2)
    : "0";

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <Link href={`/admin/exhibitions/${id}/stalls`} className="text-sm text-violet-600 hover:text-violet-700 font-semibold mb-2 inline-block">
            ← Back to Stalls
          </Link>
          <h1 className="text-3xl font-bold">Create Stall</h1>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stall Number */}
            <div>
              <label htmlFor="stallNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                Stall Number *
              </label>
              <input
                id="stallNumber"
                name="stallNumber"
                type="text"
                value={formData.stallNumber}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                placeholder="e.g., A-101"
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="width" className="block text-sm font-semibold text-slate-700 mb-2">
                  Width (m) *
                </label>
                <input
                  id="width"
                  name="width"
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                  placeholder="4"
                />
              </div>
              <div>
                <label htmlFor="length" className="block text-sm font-semibold text-slate-700 mb-2">
                  Length (m) *
                </label>
                <input
                  id="length"
                  name="length"
                  type="number"
                  step="0.01"
                  value={formData.length}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Area (m²)
                </label>
                <div className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-slate-600">
                  {area}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                  placeholder="50000"
                />
              </div>
              <div>
                <label htmlFor="advancePercentage" className="block text-sm font-semibold text-slate-700 mb-2">
                  Advance (%)
                </label>
                <div className="flex gap-2">
                  <input
                    id="advancePercentage"
                    name="advancePercentage"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.advancePercentage}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                  />
                  <div className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-slate-600 whitespace-nowrap">
                    ₹{advance}
                  </div>
                </div>
              </div>
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="positionX" className="block text-sm font-semibold text-slate-700 mb-2">
                  Position X
                </label>
                <input
                  id="positionX"
                  name="positionX"
                  type="number"
                  value={formData.positionX}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="positionY" className="block text-sm font-semibold text-slate-700 mb-2">
                  Position Y
                </label>
                <input
                  id="positionY"
                  name="positionY"
                  type="number"
                  value={formData.positionY}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
                  placeholder="0"
                />
              </div>
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
                {isLoading ? "Creating..." : "Create Stall"}
              </button>
              <Link
                href={`/admin/exhibitions/${id}/stalls`}
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
