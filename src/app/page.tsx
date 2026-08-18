import Link from "next/link";
import { getPublicExhibitions } from "@/lib/public";
import { getUserSession } from "@/lib/user-auth";

export default async function HomePage() {
  const exhibitions = await getPublicExhibitions();
  const session = await getUserSession();

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-5xl font-bold">Exhibition Stall Booking</h1>
          <p className="mt-4 max-w-2xl text-lg text-emerald-50">
            Browse available exhibition spaces, explore interactive stall maps, and secure your booth in just a few clicks.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/exhibitions"
              className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Browse Exhibitions
            </Link>
            {!session && (
              <Link
                href="/register"
                className="inline-block rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                Get Started
              </Link>
            )}
            {session && (
              <Link
                href="/dashboard"
                className="inline-block rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                My Bookings
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Exhibitions */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Featured Events</p>
          <h2 className="mt-2 text-3xl font-bold">Available Exhibitions</h2>
          <p className="mt-2 text-slate-600">Choose from our curated list of upcoming exhibitions</p>

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
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-slate-600">No exhibitions available at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">Why choose us?</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-700">📍</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">Visual Stall Maps</h3>
              <p className="mt-2 text-slate-600">See every stall's location and availability at a glance with our interactive grid layout</p>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-700">✅</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">Easy Booking</h3>
              <p className="mt-2 text-slate-600">Simple registration and one-click booking process to secure your space instantly</p>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-700">📊</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">Track Status</h3>
              <p className="mt-2 text-slate-600">Monitor your bookings and payments in real-time from your personal dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation for authenticated users */}
      {session && (
        <section className="border-t border-slate-200 bg-white px-6 py-8">
          <div className="mx-auto max-w-6xl flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              My Bookings
            </Link>
            <Link
              href="/exhibitions"
              className="rounded-lg bg-slate-200 px-6 py-3 font-semibold text-slate-900 hover:bg-slate-300"
            >
              Browse More
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
