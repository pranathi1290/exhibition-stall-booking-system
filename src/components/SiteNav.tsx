"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteNav({ hasSession }: { hasSession: boolean }) {
  const pathname = usePathname();
  const isAdminPortal = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-[#17211f]/95 px-5 py-4 text-white shadow-xl shadow-[#17211f]/10 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3 text-lg font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f26b4f] text-sm text-white shadow-lg shadow-[#f26b4f]/30 transition group-hover:rotate-6">E</span>
          <span>Expo<span className="text-[#f7b2a4]">Space</span></span>
        </Link>
        <div className="flex flex-wrap items-center gap-1 text-sm font-semibold">
          <Link href="/exhibitions" className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white">
            Exhibitions
          </Link>
          {!isAdminPortal && hasSession && (
            <Link href="/dashboard" className="rounded-full bg-[#f26b4f] px-4 py-2 text-white shadow-lg shadow-[#f26b4f]/20 transition hover:bg-[#ff8065]">
              My bookings
            </Link>
          )}
          {!isAdminPortal && (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-[#f26b4f] px-4 py-2 text-white shadow-lg shadow-[#f26b4f]/20 transition hover:bg-[#ff8065]">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
