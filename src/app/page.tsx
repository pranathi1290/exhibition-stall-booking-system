import Link from "next/link";
import { getPublicExhibitions, getUserBookingHistory } from "@/lib/public";
import { getUserSession } from "@/lib/user-auth";
import ExhibitionImage from "@/components/ExhibitionImage";
import TestimonialsShowcase from "@/components/TestimonialsShowcase";
import PaymentInfoCards from "@/components/PaymentInfoCards";

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
    quote: "ExpoStall gives our exhibitions the same level of polish we bring to our own stand design.",
    name: "Meera Kapoor",
    role: "Marketing Lead, Form House",
  },
];

export default async function HomePage() {
  const exhibitions = await getPublicExhibitions();
  const session = await getUserSession();
  const bookings = session ? await getUserBookingHistory() : [];
  const featured = exhibitions.slice(0, 3);
  const nextExhibition = featured[0];

  return (
    <main className="site-shell min-h-screen bg-white text-[#0a2348]">
      <section className="relative isolate min-h-[680px] overflow-hidden bg-[#0a2348] px-6 py-20 text-white sm:py-28">
        <div className="pointer-events-none absolute right-[-8%] top-[-18%] -z-10 h-[560px] w-[560px] rounded-full border border-[#0867d9]/40 sm:h-[680px] sm:w-[680px]" />
        <div className="pointer-events-none absolute right-[8%] top-[-5%] -z-10 h-[390px] w-[390px] rounded-full border border-white/10 sm:h-[500px] sm:w-[500px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-1/2 w-full bg-[linear-gradient(90deg,rgba(8,103,217,.22)_1px,transparent_1px),linear-gradient(rgba(8,103,217,.22)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-20">
          <div className="reveal max-w-4xl">
            <p className="eyebrow text-[#76aef2]">ExpoStall / Book. Exhibit. Grow.</p>
            <h1 className="display-title mt-6 max-w-4xl text-6xl sm:text-8xl">Your next space to <em>stand out.</em></h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/75">Compare available spaces, view the floor plan, and reserve the right position for your team before the exhibition fills.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/exhibitions" className="rounded-full bg-[#0867d9] px-6 py-3.5 font-bold text-white shadow-xl shadow-[#0867d9]/25 transition hover:-translate-y-0.5 hover:bg-[#2d83ed]">Explore exhibitions <span className="ml-2">↗</span></Link>
              <Link href={session ? "/dashboard" : "/register"} className="rounded-full border border-white/35 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20">{session ? "Open my dashboard" : "Create your profile"}</Link>
            </div>
          </div>
          <div className="reveal reveal-delay-2 grid max-w-3xl grid-cols-3 border-t border-white/25 pt-5 text-sm">
            <div><p className="text-3xl font-bold text-[#76aef2]">{exhibitions.length}</p><p className="mt-1 text-white/60">Live exhibitions</p></div>
            <div><p className="text-3xl font-bold text-[#76aef2]">10 min</p><p className="mt-1 text-white/60">Stall hold window</p></div>
            <div><p className="text-3xl font-bold text-[#76aef2]">{nextExhibition?._count.stalls ?? 0}</p><p className="mt-1 text-white/60">Spaces in next event</p></div>
          </div>
        </div>
      </section>

      {session && (
        <section className="border-b border-[#17211f]/10 bg-white px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">
            <div>
              <p className="eyebrow text-[#0867d9]">Your ExpoStall</p>
              <h2 className="mt-2 text-2xl font-bold">{bookings.length > 0 ? "Your latest booking is ready." : "Your booking space is ready."}</h2>
              {bookings.length > 0 ? (
                <p className="mt-2 text-sm text-[#17211f]/60">{bookings[0].bookingNumber} · {bookings[0].exhibition.name} · Stall {bookings[0].stall.stallNumber}</p>
              ) : <p className="mt-2 text-sm text-[#17211f]/60">Explore an exhibition and reserve your first stall.</p>}
            </div>
            <Link href={bookings.length > 0 ? "/dashboard" : "/exhibitions"} className="rounded-full bg-[#0a2348] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0867d9]">{bookings.length > 0 ? "View my bookings ↗" : "Find a stall ↗"}</Link>
          </div>
        </section>
      )}

      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="eyebrow text-[#0867d9]">The current calendar</p><h2 className="display-title mt-4 max-w-2xl text-5xl font-bold sm:text-6xl">Find the room your brand deserves.</h2></div>
            <Link href="/exhibitions" className="rounded-full border border-[#17211f]/20 px-5 py-2.5 text-sm font-bold transition hover:border-[#f26b4f] hover:text-[#c94f3d]">View all events ↗</Link>
          </div>
          {featured.length > 0 ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {featured.map((exhibition, index) => (
                  <Link key={exhibition.id} href={`/exhibitions/${exhibition.id}`} className={`group overflow-hidden rounded-sm border border-[#0a2348]/12 bg-white shadow-[0_12px_40px_rgba(10,35,72,.06)] transition duration-300 hover:-translate-y-1 hover:border-[#0867d9]/45 hover:shadow-[0_20px_50px_rgba(8,103,217,.12)] ${index === 0 ? "lg:col-span-2" : ""}`}>
                    <div className="relative aspect-[16/7] overflow-hidden bg-[#eaf3ff]"><ExhibitionImage src={exhibition.bannerUrl || fallbackExhibitionImage} alt={exhibition.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0a2348]">Featured {String(index + 1).padStart(2, "0")}</span></div>
                    <div className="flex min-h-64 flex-col justify-between p-6 sm:p-7"><div><p className="eyebrow text-[#0867d9]">{new Date(exhibition.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - {new Date(exhibition.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p><h3 className="mt-4 text-2xl font-bold text-[#0a2348]">{exhibition.name}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#0a2348]/65">{exhibition.description}</p></div><div className="mt-8 flex items-center justify-between gap-3 border-t border-[#0a2348]/10 pt-4 text-sm font-bold text-[#0a2348]/80"><span>{exhibition._count.stalls} spaces available</span>{exhibition.locationUrl ? <a href={exhibition.locationUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="shrink-0 text-[#0867d9] transition hover:text-[#0a2348]">Location ↗</a> : <span className="shrink-0 text-[#0867d9] transition group-hover:translate-x-1">View floor ↗</span>}</div></div>
                </Link>
              ))}
            </div>
          ) : <div className="mt-12 rounded-[1.75rem] border border-dashed border-[#17211f]/20 bg-white/60 p-16 text-center"><p className="font-bold">The next programme is being curated.</p><p className="mt-2 text-sm text-[#17211f]/60">Check back soon for upcoming exhibition opportunities.</p></div>}
        </div>
      </section>

      <section className="overflow-hidden bg-[#eaf3ff] px-6 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow text-[#0867d9]">The ExpoStall difference</p>
            <h2 className="display-title mt-4 text-5xl font-bold sm:text-6xl">Built around the way events actually happen.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="min-h-56 cursor-pointer border border-[#0a2348]/15 bg-white/45 p-6 shadow-none transition hover:-translate-y-1 hover:border-[#0867d9] hover:bg-white hover:shadow-[0_12px_24px_rgba(8,103,217,.12)] active:translate-y-0 active:scale-[.99] active:shadow-[0_4px_10px_rgba(8,103,217,.18)] sm:p-7">
              <p className="text-3xl text-[#0867d9]">01</p>
              <h3 className="mt-10 font-bold">See the floor</h3>
              <p className="mt-2 text-sm leading-6 text-[#0a2348]/65">Choose with context using a live, visual stall map.</p>
            </div>
            <div className="min-h-56 cursor-pointer border border-[#0a2348]/15 bg-white/45 p-6 shadow-none transition hover:-translate-y-1 hover:border-[#0867d9] hover:bg-white hover:shadow-[0_12px_24px_rgba(8,103,217,.12)] active:translate-y-0 active:scale-[.99] active:shadow-[0_4px_10px_rgba(8,103,217,.18)] sm:p-7">
              <p className="text-3xl text-[#0867d9]">02</p>
              <h3 className="mt-10 font-bold">Hold your spot</h3>
              <p className="mt-2 text-sm leading-6 text-[#0a2348]/65">Your selected space stays yours while you complete payment.</p>
            </div>
            <div className="min-h-56 cursor-pointer border border-[#0a2348]/15 bg-white/45 p-6 shadow-none transition hover:-translate-y-1 hover:border-[#0867d9] hover:bg-white hover:shadow-[0_12px_24px_rgba(8,103,217,.12)] active:translate-y-0 active:scale-[.99] active:shadow-[0_4px_10px_rgba(8,103,217,.18)] sm:p-7">
              <p className="text-3xl text-[#0867d9]">03</p>
              <h3 className="mt-10 font-bold">Show up ready</h3>
              <p className="mt-2 text-sm leading-6 text-[#0a2348]/65">Keep every booking and payment detail in one place.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0a2348] px-6 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/15 pb-8">
            <div>
              <p className="eyebrow text-[#c6a15b]">From the floor</p>
              <h2 className="display-title mt-4 max-w-2xl text-5xl sm:text-6xl">Good spaces make better conversations.</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/55">A few words from the people building what comes next.</p>
          </div>
          <TestimonialsShowcase testimonials={testimonials} />
        </div>
      </section>

      <section className="border-t border-[#0a2348]/10 bg-white px-6 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow text-[#0867d9]">Payment, made clear</p>
            <h2 className="display-title mt-4 max-w-xl text-5xl font-bold sm:text-6xl">Secure your space with confidence.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-[#0a2348]/65">Choose an available stall, place it on hold, and complete the advance payment before your reservation window closes.</p>
          </div>
          <PaymentInfoCards items={[
            { value: "50%", title: "Advance payment", description: "Pay the displayed advance amount to confirm your stall booking." },
            { value: "10 min", title: "Hold window", description: "Your selected stall is held while you complete the payment process." },
            { value: "01", title: "One clear record", description: "Track booking status, paid amount, and balance from your dashboard." },
            { value: "INR", title: "Transparent pricing", description: "See the stall price and advance amount before you commit.", featured: true },
          ]} />
        </div>
      </section>

      <section className="border-t border-white/15 bg-[#0a2348] px-6 py-20 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <p className="eyebrow text-[#76aef2]">Need a hand?</p>
            <h2 className="display-title mt-4 max-w-xl text-5xl sm:text-6xl">Let&apos;s make room for what&apos;s next.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/65">Our team can help with stall selection, booking questions, and exhibition participation.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="mailto:hello@expostall.com" className="border border-white/15 bg-[#123463] p-6 transition hover:border-[#76aef2] hover:bg-[#16427d]">
              <p className="eyebrow text-[#76aef2]">Email us</p>
              <p className="mt-5 text-lg font-bold">hello@expostall.com</p>
              <p className="mt-2 text-sm text-white/50">For booking and exhibition support</p>
            </a>
            <a href="tel:+918000123456" className="border border-white/15 bg-[#123463] p-6 transition hover:border-[#76aef2] hover:bg-[#16427d]">
              <p className="eyebrow text-[#76aef2]">Call the team</p>
              <p className="mt-5 text-lg font-bold">+91 8000 123 456</p>
              <p className="mt-2 text-sm text-white/50">Mon - Sat, 9:00 AM - 6:00 PM</p>
            </a>
            <div className="border border-white/15 bg-white p-6 text-[#0a2348] sm:col-span-2">
              <p className="eyebrow text-[#0867d9]">Visit the floor</p>
              <p className="mt-5 text-lg font-bold">Bengaluru International Exhibition Centre</p>
              <p className="mt-2 text-sm text-[#0a2348]/60">Bengaluru, Karnataka, India</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
