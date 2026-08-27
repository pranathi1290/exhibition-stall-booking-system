"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "./BrandLogo";

type AdminSidebarProps = {
  role?: "SUPER_ADMIN" | "WORKSPACE_ADMIN" | "TEAM_MEMBER";
};

const links = [
  { href: "/admin", label: "Dashboard", icon: "01" },
  { href: "/admin/exhibitions", label: "Exhibitions", icon: "02" },
  { href: "/admin/bookings", label: "Bookings", icon: "03" },
  { href: "/admin/bookings/create", label: "Manual booking", icon: "04" },
];

const upcomingLinks = [
  { label: "Payments", icon: "05" },
  { label: "Block stalls", icon: "06" },
  { label: "Analytics", icon: "07" },
];

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();

  if (pathname === "/admin/login" || pathname === "/admin/logout") return null;

  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="admin-sidebar sticky top-0 z-40 flex h-auto w-full flex-col border-b border-[#0a2348]/10 bg-[#0a2348] text-white lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 lg:block lg:px-7 lg:py-7">
        <BrandLogo />
        <span className="hidden text-[0.62rem] uppercase tracking-[0.2em] text-[#76aef2] lg:mt-7 lg:block">Control room</span>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 py-3 lg:flex-1 lg:flex-col lg:gap-1 lg:px-4 lg:py-8" aria-label="Admin navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={`flex min-w-max items-center gap-3 border px-3 py-2.5 text-xs font-bold uppercase tracking-[0.08em] transition lg:w-full lg:px-4 lg:py-3 ${isActive(link.href) ? "border-[#0867d9] bg-[#0867d9] text-white shadow-lg shadow-[#0867d9]/20" : "border-transparent text-white/55 hover:border-white/15 hover:bg-white/10 hover:text-white"}`}>
            <span className="text-[0.65rem] text-[#76aef2]">{link.icon}</span>
            {link.label}
          </Link>
        ))}
        {role === "SUPER_ADMIN" && (
          <Link href="/admin/team" className={`flex min-w-max items-center gap-3 border px-3 py-2.5 text-xs font-bold uppercase tracking-[0.08em] transition lg:mt-5 lg:w-full lg:px-4 lg:py-3 ${isActive("/admin/team") ? "border-[#0867d9] bg-[#0867d9] text-white shadow-lg shadow-[#0867d9]/20" : "border-transparent text-white/55 hover:border-white/15 hover:bg-white/10 hover:text-white"}`}>
            <span className="text-[0.65rem] text-[#76aef2]">08</span>
            Team access
          </Link>
        )}
        <span className="hidden px-4 pt-7 pb-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/30 lg:block">Workspace tools</span>
        {upcomingLinks.map((link) => (
          <span key={link.label} aria-disabled="true" className="flex min-w-max items-center gap-3 border border-transparent px-3 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white/30 lg:w-full lg:px-4 lg:py-3">
            <span className="text-[0.65rem] text-[#76aef2]/50">{link.icon}</span>
            {link.label}
            <span className="ml-auto hidden text-[0.55rem] tracking-normal text-white/25 lg:block">Soon</span>
          </span>
        ))}
      </nav>
      <div className="hidden border-t border-white/10 p-5 lg:block">
        <Link href="/" className="block text-xs font-bold uppercase tracking-[0.08em] text-white/55 transition hover:text-white">View public site <span className="ml-1 text-[#76aef2]">↗</span></Link>
      </div>
    </aside>
  );
}
