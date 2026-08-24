"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getExhibitionById, deleteExhibition } from "@/lib/admin";
import type { Exhibition } from "@prisma/client";

export default function DeleteExhibitionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadExhibition() {
      try {
        const data = await getExhibitionById(id);
        if (!data) {
          router.push("/admin/exhibitions");
          return;
        }
        setExhibition(data);
      } catch {
        setError("Failed to load exhibition");
      }
    }

    loadExhibition();
  }, [id, router]);

  async function handleDelete() {
    setError("");
    setIsLoading(true);

    try {
      await deleteExhibition(id);
      router.push("/admin/exhibitions");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete exhibition");
      setIsLoading(false);
    }
  }

  if (!exhibition) {
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

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <Link href="/admin/exhibitions" className="text-sm text-violet-600 hover:text-violet-700 font-semibold mb-2 inline-block">
            ← Back to Exhibitions
          </Link>
          <h1 className="text-3xl font-bold">Delete Exhibition</h1>
        </header>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-lg font-semibold text-red-900 mb-2">⚠️ Are you sure?</p>
            <p className="text-red-800 mb-4">
              This will permanently delete the exhibition <strong>&quot;{exhibition.name}&quot;</strong>.
            </p>
            <p className="text-sm text-red-700">
              This action cannot be undone. Make sure there are no active bookings for this exhibition.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-800 mb-6">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:bg-red-400"
            >
              {isLoading ? "Deleting..." : "Delete Exhibition"}
            </button>
            <Link
              href="/admin/exhibitions"
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
