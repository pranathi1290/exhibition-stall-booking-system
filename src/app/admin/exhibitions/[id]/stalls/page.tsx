import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getExhibitionById, getStallsByExhibition, getExhibitionStats } from "@/lib/admin";

export default async function ExhibitionStallsPage({ params }: { params: { id: string } }) {
  // Check authentication
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const exhibition = await getExhibitionById(params.id);
  if (!exhibition) {
    redirect("/admin/exhibitions");
  }

  const stalls = await getStallsByExhibition(params.id);
  const stats = await getExhibitionStats(params.id);

  const statusColors: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-700",
    HELD: "bg-yellow-100 text-yellow-700",
    BOOKED: "bg-red-100 text-red-700",
    BLOCKED: "bg-slate-100 text-slate-700",
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <Link href="/admin/exhibitions" className="text-sm text-violet-600 hover:text-violet-700 font-semibold mb-2 inline-block">
            ← Back to Exhibitions
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{exhibition.name}</h1>
              <p className="text-slate-600 mt-1">{exhibition.venue}</p>
            </div>
            <Link
              href={`/admin/exhibitions/${params.id}/stalls/create`}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              + Add Stall
            </Link>
          </div>
        </header>

        {/* Statistics */}
        <section className="grid gap-4 md:grid-cols-5 mb-8">
          {[
            ["Total Stalls", stats.totalStalls.toString()],
            ["Available", stats.available.toString(), "green"],
            ["Held", stats.held.toString(), "yellow"],
            ["Booked", stats.booked.toString(), "red"],
            ["Blocked", stats.blocked.toString(), "slate"],
          ].map(([label, value, color]) => {
            const colorClass = color === "green" ? "bg-green-50" : color === "yellow" ? "bg-yellow-50" : color === "red" ? "bg-red-50" : "bg-slate-50";
            return (
              <div key={label} className={`rounded-xl border border-slate-200 ${colorClass} p-4`}>
                <p className="text-sm text-slate-600">{label}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
            );
          })}
        </section>

        {/* Stalls Table */}
        {stalls.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600 mb-4">No stalls yet</p>
            <Link
              href={`/admin/exhibitions/${params.id}/stalls/create`}
              className="inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Create Your First Stall
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Stall #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Dimensions</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Area</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Advance</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stalls.map((stall) => (
                    <tr key={stall.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-semibold">{stall.stallNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {stall.width.toString()} × {stall.length.toString()} m
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{stall.area.toString()} m²</td>
                      <td className="px-6 py-4 text-sm font-semibold">₹{stall.price.toString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">₹{stall.advanceAmount.toString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors[stall.status]}`}>
                          {stall.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/exhibitions/${params.id}/stalls/${stall.id}/edit`}
                            className="text-sm font-medium text-violet-600 hover:text-violet-700"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/exhibitions/${params.id}/stalls/${stall.id}/delete`}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
