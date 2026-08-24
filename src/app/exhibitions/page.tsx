import Link from "next/link";
import { getPublicExhibitions } from "@/lib/public";
import ExhibitionImage from "@/components/ExhibitionImage";

const fallbackExhibitionImage =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";

export default async function ExhibitionsPage() {
  const exhibitions = await getPublicExhibitions();

  return (
    <main className="site-shell min-h-screen px-6 py-16 text-[#17211f] sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="reveal max-w-3xl"><p className="eyebrow text-[#c94f3d]">The event calendar</p>
        <h1 className="display-title mt-5 text-6xl font-bold sm:text-8xl">Choose your next big room.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#17211f]/65">Browse the exhibitions shaping the season, then step onto the floor plan and find the position that fits your ambition.</p></div>

        {exhibitions.length > 0 ? (
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exhibitions.map((exhibition, index) => (
              <Link
                key={exhibition.id}
                href={`/exhibitions/${exhibition.id}`}
                className={`group overflow-hidden rounded-[1.75rem] border border-[#17211f]/10 bg-white shadow-[0_16px_50px_rgba(23,33,31,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,33,31,.15)] ${index === 0 ? "md:col-span-2" : ""}`}
              >
                <div className={`relative overflow-hidden bg-[#d7e7dc] ${index === 0 ? "h-64" : "h-48"}`}>
                  <ExhibitionImage
                    src={exhibition.bannerUrl || fallbackExhibitionImage}
                    alt={exhibition.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-[#f5f1ea]/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#17211f]">{String(index + 1).padStart(2, "0")} / {String(exhibitions.length).padStart(2, "0")}</span>
                </div>
                <div className="p-6 sm:p-7">
                  <p className="eyebrow text-[#c94f3d]">
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
                  <h3 className="mt-3 text-2xl font-bold text-[#17211f]">{exhibition.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#17211f]/65">{exhibition.description}</p>
                  <p className="mt-5 text-sm font-bold text-[#17211f]/75">{exhibition.venue}<span className="float-right text-[#c94f3d] transition group-hover:translate-x-1">Explore ↗</span></p>
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
