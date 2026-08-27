import Link from "next/link";

export default function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="ExpoStall home">
      <span className="brand-mark relative flex h-9 w-9 items-center justify-center rounded-sm border border-[#0867d9] text-[#0867d9] transition group-hover:bg-[#0867d9] group-hover:text-white" aria-hidden="true">
        <span className="brand-mark__arc brand-mark__arc--left" />
        <span className="brand-mark__arc brand-mark__arc--right" />
        <span className="brand-mark__aisle" />
      </span>
      {!compact && (
        <span className="text-[0.95rem] font-bold uppercase tracking-[0.14em]">
          Expo<span className="text-[#0867d9]">Stall</span>
        </span>
      )}
    </Link>
  );
}
