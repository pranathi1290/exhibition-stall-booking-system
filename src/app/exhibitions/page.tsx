import Link from "next/link";
import { getPublicExhibitions } from "@/lib/public";
import { normalizeCurrency } from "@/lib/demo-store";

export default async function ExhibitionsPage() {
  const exhibitions = await getPublicExhibitions();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Available Events</p>
        <h1 className="mt-2 text-4xl font-bold">All Exhibitions</h1>
        <p className="mt-3 text-slate-600">Browse and book exhibition stalls for your business.</p>

        {exhibitions.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exhibitions.map((exhibition) => (
              <Link
                key={exhibition.id}
                href={`/exhibitions/${exhibition.id}`}
                className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
              >
                <div className="h-40 overflow-hidden rounded-t-2xl bg-gradient-to-r from-emerald-500 to-teal-600">
                  {exhibition.bannerUrl && (
                    <img
                      src={exhibition.bannerUrl}
                      alt={exhibition.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    {new Date(exhibition.startDate).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(exhibition.endDate).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">{exhibition.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{exhibition.description}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-700">{exhibition.venue}</p>
                  <div className="mt-4 inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 group-hover:bg-emerald-200">
                    View details →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900">No exhibitions available</h2>
            <p className="mt-2 text-slate-600">Check back soon for upcoming exhibition opportunities.</p>
          </div>
        )}
      </div>
    </main>
  );
}
