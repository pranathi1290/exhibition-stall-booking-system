import Link from "next/link";
import { getPublicExhibitions, getUserBookingHistory } from "@/lib/public";
import { getUserSession } from "@/lib/user-auth";
import ExhibitionImage from "@/components/ExhibitionImage";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

const fallbackExhibitionImage =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85";

const testimonials = [
  {
    quote: "We could see the entire floor before committing. That made choosing the right position feel remarkably simple.",
    name: "Ananya Rao",
    role: "Brand Director, Loom & Line",
  },
  {
    quote: "The booking process is clear, quick, and genuinely considered. We had our team space confirmed in minutes.",
    name: "Vikram Shah",
    role: "Founder, Northstar Systems",
  },
  {
    quote: "Arc & Aisle gives our exhibitions the same level of polish we bring to our own stand design.",
    name: "Meera Kapoor",
    role: "Marketing Lead, Form House",
  },
];

export default async function HomePage() {
  const exhibitions = await getPublicExhibitions();
  const session = await getUserSession();
  const bookings = session ? await getUserBookingHistory() : [];
  const featured = exhibitions.slice(0, 3);

  return (
    <main className="site-shell min-h-screen bg-[#f5f1ea] text-[#17211f]">
      <section className="relative isolate min-h-[680px] overflow-hidden bg-[#17211f] px-6 py-20 text-white sm:py-28">
        <ExhibitionImage src={fallbackExhibitionImage} alt="Exhibition hall prepared for visitors" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(23,33,31,.98)_12%,rgba(23,33,31,.82)_48%,rgba(23,33,31,.34))]" />
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-20">
          <div className="reveal max-w-4xl">
            <p className="eyebrow text-[#c6a15b]">A better place to be seen</p>
            <h1 className="display-title mt-6 max-w-4xl text-6xl sm:text-8xl">Make your next space <em>impossible</em> to miss.</h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/75">Discover high-energy exhibitions, choose your position on the map, and reserve a booth built for the conversations that matter.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/exhibitions" className="rounded-full bg-[#f26b4f] px-6 py-3.5 font-bold text-white shadow-xl shadow-[#f26b4f]/25 transition hover:-translate-y-0.5 hover:bg-[#ff8065]">Explore exhibitions <span className="ml-2">↗</span></Link>
              <Link href={session ? "/dashboard" : "/register"} className="rounded-full border border-white/35 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20">{session ? "Open my dashboard" : "Create your profile"}</Link>
            </div>
          </div>
          <div className="reveal reveal-delay-2 grid max-w-3xl grid-cols-3 border-t border-white/25 pt-5 text-sm">
            <div><p className="text-3xl font-bold text-[#f7b2a4]">{exhibitions.length || "02"}</p><p className="mt-1 text-white/60">Live exhibitions</p></div>
            <div><p className="text-3xl font-bold text-[#f7b2a4]">10 min</p><p className="mt-1 text-white/60">Stall hold window</p></div>
            <div><p className="text-3xl font-bold text-[#f7b2a4]">50%</p><p className="mt-1 text-white/60">Advance to confirm</p></div>
          </div>
        </div>
      </section>

      {session && (
        <section className="border-b border-[#17211f]/10 bg-white px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">
            <div>
              <p className="eyebrow text-[#c94f3d]">Your Arc &amp; Aisle</p>
              <h2 className="mt-2 text-2xl font-bold">{bookings.length > 0 ? "Your latest booking is ready." : "Your booking space is ready."}</h2>
              {bookings.length > 0 ? (
                <p className="mt-2 text-sm text-[#17211f]/60">{bookings[0].bookingNumber} · {bookings[0].exhibition.name} · Stall {bookings[0].stall.stallNumber}</p>
              ) : <p className="mt-2 text-sm text-[#17211f]/60">Explore an exhibition and reserve your first stall.</p>}
            </div>
            <Link href={bookings.length > 0 ? "/dashboard" : "/exhibitions"} className="rounded-full bg-[#17211f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c94f3d]">{bookings.length > 0 ? "View my bookings ↗" : "Find a stall ↗"}</Link>
          </div>
        </section>
      )}

      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="eyebrow text-[#c94f3d]">The current calendar</p><h2 className="display-title mt-4 max-w-2xl text-5xl font-bold sm:text-6xl">Find the room your brand deserves.</h2></div>
            <Link href="/exhibitions" className="rounded-full border border-[#17211f]/20 px-5 py-2.5 text-sm font-bold transition hover:border-[#f26b4f] hover:text-[#c94f3d]">View all events ↗</Link>
          </div>
          {featured.length > 0 ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {featured.map((exhibition, index) => (
                <Link key={exhibition.id} href={`/exhibitions/${exhibition.id}`} className={`group overflow-hidden rounded-sm border border-[#17211f]/10 bg-white shadow-[0_16px_50px_rgba(23,33,31,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,33,31,.15)] ${index === 0 ? "lg:col-span-2" : ""}`}>
                  <div className={`relative overflow-hidden bg-[#d7e7dc] ${index === 0 ? "h-72" : "h-56"}`}><ExhibitionImage src={exhibition.bannerUrl || fallbackExhibitionImage} alt={exhibition.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute left-5 top-5 rounded-full bg-[#f5f1ea]/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#17211f]">Featured {String(index + 1).padStart(2, "0")}</span></div>
                  <div className="p-6 sm:p-7"><p className="eyebrow text-[#c94f3d]">{new Date(exhibition.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - {new Date(exhibition.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p><h3 className="mt-3 text-2xl font-bold">{exhibition.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#17211f]/65">{exhibition.description}</p><p className="mt-5 text-sm font-bold text-[#17211f]/75">{exhibition.venue} <span className="float-right text-[#c94f3d] transition group-hover:translate-x-1">Explore ↗</span></p></div>
                </Link>
              ))}
            </div>
          ) : <div className="mt-12 rounded-[1.75rem] border border-dashed border-[#17211f]/20 bg-white/60 p-16 text-center"><p className="font-bold">The next programme is being curated.</p><p className="mt-2 text-sm text-[#17211f]/60">Check back soon for upcoming exhibition opportunities.</p></div>}
        </div>
      </section>

      <section className="overflow-hidden bg-[#b9e4d0] px-6 py-20 sm:py-24"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="eyebrow text-[#c94f3d]">The Arc &amp; Aisle difference</p><h2 className="display-title mt-4 text-5xl font-bold sm:text-6xl">Built around the way events actually happen.</h2></div><div className="grid gap-8 border-t border-[#17211f]/20 pt-7 sm:grid-cols-3"><div><p className="text-3xl">01</p><h3 className="mt-4 font-bold">See the floor</h3><p className="mt-2 text-sm leading-6 text-[#17211f]/65">Choose with context using a live, visual stall map.</p></div><div><p className="text-3xl">02</p><h3 className="mt-4 font-bold">Hold your spot</h3><p className="mt-2 text-sm leading-6 text-[#17211f]/65">Your selected space stays yours while you complete payment.</p></div><div><p className="text-3xl">03</p><h3 className="mt-4 font-bold">Show up ready</h3><p className="mt-2 text-sm leading-6 text-[#17211f]/65">Keep every booking and payment detail in one place.</p></div></div></div></section>

      <section className="bg-[#191b1a] px-6 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/15 pb-8">
            <div>
              <p className="eyebrow text-[#c6a15b]">From the floor</p>
              <h2 className="display-title mt-4 max-w-2xl text-5xl sm:text-6xl">Good spaces make better conversations.</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/55">A few words from the people building what comes next.</p>
          </div>
          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </section>
    </main>
  );
}
