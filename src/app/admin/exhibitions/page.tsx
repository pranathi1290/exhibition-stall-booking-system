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
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <Link href="/admin" className="text-sm text-violet-600 hover:text-violet-700 font-semibold mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Exhibitions</h1>
          </div>
          <Link
            href="/admin/exhibitions/create"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            + Create Exhibition
          </Link>
        </header>

        {/* Exhibitions List */}
        {exhibitions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600 mb-4">No exhibitions yet</p>
            <Link
              href="/admin/exhibitions/create"
              className="inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Create Your First Exhibition
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {exhibitions.map((exhibition) => (
              <div key={exhibition.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold">{exhibition.name}</h2>
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
