"use client";

import { useState } from "react";

type PaymentInfo = {
  value: string;
  title: string;
  description: string;
  featured?: boolean;
};

export default function PaymentInfoCards({ items }: { items: PaymentInfo[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={item.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-pressed={isActive}
            className={`min-h-48 border p-7 text-left transition-all duration-300 hover:-translate-y-1 ${
              item.featured
                ? isActive
                  ? "border-[#0867d9] bg-[#0a2348] text-white shadow-[0_14px_30px_rgba(8,103,217,.22)]"
                  : "border-[#0a2348]/12 bg-[#0a2348] text-white"
                : isActive
                  ? "border-[#0867d9] bg-[#eaf3ff] text-[#0a2348] shadow-[0_10px_24px_rgba(8,103,217,.14)]"
                  : "border-[#0a2348]/12 bg-[#eaf3ff] text-[#0a2348] hover:border-[#0867d9]"
            }`}
          >
            <p className={`text-3xl font-bold ${item.featured ? "text-[#b9d8ff]" : "text-[#0867d9]"}`}>{item.value}</p>
            <h3 className="mt-6 font-bold">{item.title}</h3>
            <p className={`mt-2 text-sm leading-6 ${item.featured ? "text-white/70" : "text-[#0a2348]/65"}`}>{item.description}</p>
          </button>
        );
      })}
    </div>
  );
}
