import Link from "next/link";

export default function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Arc and Aisle home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-[#c6a15b] text-[0.68rem] font-bold tracking-[-0.08em] text-[#c6a15b] transition group-hover:bg-[#c6a15b] group-hover:text-[#191b1a]">
        AA
      </span>
      {!compact && (
        <span className="text-[0.95rem] font-bold uppercase tracking-[0.14em]">
          Arc <span className="text-[#d65c45]">&amp;</span> Aisle
        </span>
      )}
    </Link>
  );
}
