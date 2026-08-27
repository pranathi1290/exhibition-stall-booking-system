"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "./BrandLogo";

export default function SiteNav({ hasSession }: { hasSession: boolean }) {
  const pathname = usePathname();
  const isAdminPortal = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 border-b border-[#0a2348]/10 bg-white/95 px-5 py-4 text-[#0a2348] shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <BrandLogo />
        <div className="flex flex-wrap items-center gap-1 text-xs font-bold uppercase tracking-[0.12em]">
            <Link href="/exhibitions" className="rounded-sm px-4 py-2 text-[#0a2348]/65 transition hover:bg-[#eaf3ff] hover:text-[#0867d9]">
            Exhibitions
          </Link>
          {!isAdminPortal && (hasSession ? (
            <Link href="/dashboard" className="rounded-sm bg-[#0867d9] px-4 py-2 text-white shadow-lg shadow-[#0867d9]/20 transition hover:bg-[#0a2348]">
              My bookings
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-sm px-4 py-2 text-[#0a2348]/65 transition hover:bg-[#eaf3ff] hover:text-[#0867d9]">
                Login
              </Link>
              <Link href="/register" className="rounded-sm bg-[#0867d9] px-4 py-2 text-white shadow-lg shadow-[#0867d9]/20 transition hover:bg-[#0a2348]">
                Register
              </Link>
            </>
          ))}
        </div>
      </nav>
    </header>
  );
}
