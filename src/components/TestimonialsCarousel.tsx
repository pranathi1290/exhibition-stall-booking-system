"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || testimonials.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [isPaused, testimonials.length]);

  const active = testimonials[activeIndex];
  if (!active) return null;

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  }

  return (
    <div
      className="mt-10 overflow-hidden border border-white/15 bg-[#191b1a]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid min-h-[330px] items-stretch md:grid-cols-[1.2fr_.8fr]">
        <figure className="flex flex-col justify-between p-8 sm:p-12" key={active.name}>
          <div className="flex items-center justify-between text-[#c6a15b]">
            <span className="text-4xl leading-none">&ldquo;</span>
            <span className="eyebrow text-white/35">0{activeIndex + 1} / 0{testimonials.length}</span>
          </div>
          <blockquote className="mt-8 max-w-3xl text-2xl leading-tight text-white sm:text-3xl">
            {active.quote}
          </blockquote>
          <figcaption className="mt-10 border-t border-white/15 pt-4">
            <p className="text-sm font-bold">{active.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/45">{active.role}</p>
          </figcaption>
        </figure>

        <div className="flex flex-col justify-between border-t border-white/15 bg-[#252725] p-8 md:border-l md:border-t-0 sm:p-12">
          <p className="eyebrow text-[#c6a15b]">Exhibitor notes</p>
          <p className="max-w-xs text-sm leading-6 text-white/55">Real perspective from the people choosing their next space.</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={showPrevious} aria-label="Previous testimonial" className="flex h-11 w-11 items-center justify-center border border-white/25 text-lg text-white transition hover:border-[#c6a15b] hover:text-[#c6a15b]">
              <span aria-hidden="true">&larr;</span>
            </button>
            <button type="button" onClick={showNext} aria-label="Next testimonial" className="flex h-11 w-11 items-center justify-center border border-white/25 text-lg text-white transition hover:border-[#c6a15b] hover:text-[#c6a15b]">
              <span aria-hidden="true">&rarr;</span>
            </button>
            <div className="ml-2 flex gap-2" aria-label="Choose testimonial">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.name}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show testimonial ${index + 1}`}
                  aria-current={index === activeIndex}
                  className={`h-1.5 transition-all ${index === activeIndex ? "w-10 bg-[#d65c45]" : "w-5 bg-white/25 hover:bg-white/55"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
