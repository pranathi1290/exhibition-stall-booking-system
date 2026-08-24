"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStallById, updateStall } from "@/lib/admin";
import type { StallStatus } from "@prisma/client";

export default function EditStallPage({ params }: { params: Promise<{ id: string; stallId: string }> }) {
  const router = useRouter();
  const { id, stallId } = use(params);
  const [formData, setFormData] = useState({
    stallNumber: "",
    width: "",
    length: "",
    price: "",
    advancePercentage: "50",
    positionX: "0",
    positionY: "0",
    status: "AVAILABLE" as StallStatus,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function loadStall() {
      try {
        const stall = await getStallById(stallId);
        if (!stall) {
          router.push(`/admin/exhibitions/${id}/stalls`);
          return;
        }

        setFormData({
          stallNumber: stall.stallNumber,
          width: stall.width.toString(),
          length: stall.length.toString(),
          price: stall.price.toString(),
          advancePercentage: stall.advancePercentage.toString(),
          positionX: stall.positionX.toString(),
          positionY: stall.positionY.toString(),
          status: stall.status,
        });
      } catch {
        setError("Failed to load stall");
      } finally {
        setIsLoadingData(false);
      }
    }

    loadStall();
  }, [stallId, id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await updateStall(stallId, {
        stallNumber: formData.stallNumber,
        width: parseFloat(formData.width),
        length: parseFloat(formData.length),
        price: parseFloat(formData.price),
        advancePercentage: parseInt(formData.advancePercentage),
        positionX: parseInt(formData.positionX),
        positionY: parseInt(formData.positionY),
        status: formData.status,
      });

      router.push(`/admin/exhibitions/${id}/stalls`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stall");
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoadingData) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

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
          <h1 className="text-3xl font-bold">Edit Stall</h1>
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

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none disabled:bg-slate-100"
              >
                <option value="AVAILABLE">Available</option>
                <option value="HELD">Held</option>
                <option value="BOOKED">Booked</option>
                <option value="BLOCKED">Blocked</option>
              </select>
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
                {isLoading ? "Saving..." : "Save Changes"}
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
