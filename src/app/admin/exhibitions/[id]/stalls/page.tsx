import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getExhibitionById, getStallsByExhibition, getExhibitionStats } from "@/lib/admin";

export default async function ExhibitionStallsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Check authentication
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const exhibition = await getExhibitionById(id);
  if (!exhibition) {
    redirect("/admin/exhibitions");
  }

  const stalls = await getStallsByExhibition(id);
  const stats = await getExhibitionStats(id);

  const statusColors: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-700",
    HELD: "bg-yellow-100 text-yellow-700",
    BOOKED: "bg-red-100 text-red-700",
    BLOCKED: "bg-slate-100 text-slate-700",
  };

  return (
    <main className="site-shell min-h-screen p-6 text-[#0a2348] sm:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <Link href="/admin/exhibitions" className="eyebrow text-[#0867d9] hover:text-[#0a2348]">
            ← Back to Exhibitions
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="display-title mt-4 text-5xl font-bold">{exhibition.name}</h1>
              <p className="mt-2 text-[#17211f]/60">{exhibition.venue}</p>
              {exhibition.locationUrl && <a href={exhibition.locationUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-[#0867d9] hover:text-[#0a2348]">Open location ↗</a>}
            </div>
            <Link
              href={`/admin/exhibitions/${id}/stalls/create`}
              className="rounded-full bg-[#0867d9] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2d83ed]"
            >
              + Add Stall
            </Link>
            <Link
              href={`/admin/exhibitions/${id}/layout`}
              className="rounded-full border border-[#17211f]/15 bg-white px-5 py-2.5 text-sm font-bold hover:border-[#f26b4f]"
            >
              Edit Layout
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
              <div key={label} className={`rounded-2xl border border-[#17211f]/10 ${colorClass} p-5 shadow-sm`}>
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
              href={`/admin/exhibitions/${id}/stalls/create`}
              className="inline-block rounded-lg bg-[#0867d9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d83ed]"
            >
              Create Your First Stall
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.75rem] border border-[#17211f]/10 bg-white shadow-[0_16px_50px_rgba(23,33,31,.07)]">
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
                            href={`/admin/exhibitions/${id}/stalls/${stall.id}/edit`}
                            className="text-sm font-medium text-[#0867d9] hover:text-[#0a2348]"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/exhibitions/${id}/stalls/${stall.id}/delete`}
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
