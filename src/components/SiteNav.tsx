"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "./BrandLogo";

export default function SiteNav({ hasSession }: { hasSession: boolean }) {
  const pathname = usePathname();
  const isAdminPortal = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#191b1a]/95 px-5 py-4 text-white shadow-2xl shadow-[#191b1a]/20 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <BrandLogo />
        <div className="flex flex-wrap items-center gap-1 text-xs font-bold uppercase tracking-[0.12em]">
          <Link href="/exhibitions" className="rounded-sm px-4 py-2 text-white/60 transition hover:bg-white/10 hover:text-white">
            Exhibitions
          </Link>
          {!isAdminPortal && hasSession && (
            <Link href="/dashboard" className="rounded-sm bg-[#d65c45] px-4 py-2 text-white shadow-lg shadow-[#d65c45]/20 transition hover:bg-[#e27660]">
              My bookings
            </Link>
          )}
          {!isAdminPortal && (
            <>
              <Link href="/login" className="rounded-sm px-4 py-2 text-white/60 transition hover:bg-white/10 hover:text-white">
                Login
              </Link>
              <Link href="/register" className="rounded-sm bg-[#d65c45] px-4 py-2 text-white shadow-lg shadow-[#d65c45]/20 transition hover:bg-[#e27660]">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
