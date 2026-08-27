"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export default function TestimonialsShowcase({ testimonials }: { testimonials: Testimonial[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="mt-10 grid gap-3 md:grid-cols-3">
      {testimonials.map((testimonial, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={testimonial.name}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show testimonial from ${testimonial.name}`}
            aria-current={isActive}
            className={`text-left transition-all duration-700 ease-out ${isActive ? "z-10 scale-[1.03] opacity-100 blur-0" : "scale-100 opacity-55 blur-[1.5px] hover:opacity-80 hover:blur-0"}`}
          >
            <figure className={`flex min-h-64 flex-col justify-between border p-7 transition-colors duration-700 sm:p-8 ${isActive ? "border-[#0867d9] bg-[#123463] shadow-[0_18px_40px_rgba(8,103,217,.25)]" : "border-white/15 bg-[#123463]/75"}`}>
              <div className="flex items-center justify-between text-[#0867d9]">
                <span className="text-3xl leading-none">&ldquo;</span>
                <span className="eyebrow text-white/35">0{index + 1}</span>
              </div>
              <blockquote className={`mt-7 leading-7 transition-all duration-700 ${isActive ? "text-lg text-white" : "text-base text-white/75"}`}>
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-8 border-t border-white/15 pt-4">
                <p className="text-sm font-bold text-white">{testimonial.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/45">{testimonial.role}</p>
              </figcaption>
            </figure>
          </button>
        );
      })}
    </div>
  );
}
