import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getExhibitions } from "@/lib/admin";

export default async function ExhibitionsPage() {
  // Check authentication
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const exhibitions = await getExhibitions();

  return (
    <main className="site-shell min-h-screen p-6 text-[#0a2348] sm:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5 rounded-[1.75rem] bg-[#0a2348] p-6 text-white shadow-2xl shadow-[#0a2348]/15">
          <div>
            <Link href="/admin" className="eyebrow text-[#76aef2] hover:text-white">
              ← Back to Dashboard
            </Link>
            <h1 className="display-title mt-3 text-5xl font-bold">Exhibitions</h1>
          </div>
          <Link
            href="/admin/exhibitions/create"
            className="rounded-full bg-[#0867d9] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0867d9]/20 hover:bg-[#2d83ed]"
          >
            + Create Exhibition
          </Link>
        </header>

        {/* Exhibitions List */}
        {exhibitions.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-[#0a2348]/20 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600 mb-4">No exhibitions yet</p>
            <Link
              href="/admin/exhibitions/create"
              className="inline-block rounded-full bg-[#0867d9] px-5 py-3 text-sm font-bold text-white hover:bg-[#2d83ed]"
            >
              Create Your First Exhibition
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {exhibitions.map((exhibition) => (
              <div key={exhibition.id} className="rounded-[1.5rem] border border-[#17211f]/10 bg-white p-6 shadow-[0_16px_50px_rgba(23,33,31,.07)] transition hover:-translate-y-0.5 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{exhibition.name}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        exhibition.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                        exhibition.status === "DRAFT" ? "bg-yellow-100 text-yellow-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {exhibition.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{exhibition.description}</p>
                    <div className="flex gap-6 text-sm text-slate-500">
                      <span>📍 {exhibition.venue}</span>
                      {exhibition.locationUrl && <a href={exhibition.locationUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#0867d9] hover:text-[#0a2348]">Location ↗</a>}
                      <span>📅 {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/admin/exhibitions/${exhibition.id}/stalls`}
                      className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700 hover:bg-violet-100"
                    >
                      Stalls
                    </Link>
                    <Link
                      href={`/admin/exhibitions/${exhibition.id}/edit`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/exhibitions/${exhibition.id}/delete`}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
