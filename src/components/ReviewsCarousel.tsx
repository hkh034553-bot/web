"use client";

import React, { useEffect, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/animations";

interface Testimonial {
  id: number;
  rating: number;
  text: string;
  author: string;
  role: string;
  company: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    rating: 5,
    text: "HKH completely transformed our brand assets and delivered a conversion-optimized marketing website in under two weeks. Our inbound lead conversions jumped by 42% in the first month.",
    author: "Salman Khan",
    role: "Founder",
    company: "SwiftSaaS",
  },
  {
    id: 2,
    rating: 5,
    text: "Working directly with the creators at HKH made a massive difference. No middle management delays. They built an educational content pipeline that established our authority online in record time.",
    author: "Amna Shah",
    role: "Marketing Director",
    company: "Visa Agency Hub",
  },
  {
    id: 3,
    rating: 5,
    text: "The cross-platform app developed by HKH features an incredibly intuitive design and operates flawlessly. Our customer retention rates grew by 30% in just two months after release.",
    author: "David Vance",
    role: "Product Owner",
    company: "FinTech Solved",
  },
];

const AUTOPLAY_MS = 6000;

export default function ReviewsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (next: number, dir: number) => {
    setDirection(dir);
    setActiveIndex((next + testimonials.length) % testimonials.length);
  };

  const handleNext = () => goTo(activeIndex + 1, 1);
  const handlePrev = () => goTo(activeIndex - 1, -1);

  /* Auto-advance unless paused or hovered */
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(handleNext, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, activeIndex]);

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto px-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Quotation Mark Accent badges */}
      <div className="absolute -top-6 -left-2 sm:-left-6 hidden sm:block">
        <span className="brutalist-badge-coral w-12 h-12 flex items-center justify-center text-white">
          <Quote className="w-5 h-5 fill-current" />
        </span>
      </div>

      <div className="absolute -bottom-6 -right-2 sm:-right-6 hidden sm:block">
        <span className="brutalist-badge-sky w-12 h-12 flex items-center justify-center text-text">
          <Quote className="w-5 h-5 fill-current transform rotate-180" />
        </span>
      </div>

      {/* Main Card */}
      <div className="brutalist-card bg-surface p-8 sm:p-12 md:p-16 text-left relative overflow-hidden min-h-[300px] flex flex-col justify-between">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: EASE }}
            className="space-y-6"
          >
            {/* Stars */}
            <div className="flex gap-1">
              {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Star className="w-6 h-6 fill-accent-amber text-border" strokeWidth={2} />
                </motion.span>
              ))}
            </div>

            {/* Testimonial text */}
            <p className="text-xl sm:text-2xl font-display font-medium text-text leading-relaxed">
              "{testimonials[activeIndex].text}"
            </p>

            {/* Author */}
            <div>
              <h5 className="font-display font-bold text-lg text-text">
                {testimonials[activeIndex].author}
              </h5>
              <p className="text-text-muted text-sm">
                {testimonials[activeIndex].role}, <span className="text-accent-coral font-semibold">{testimonials[activeIndex].company}</span>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons + Autoplay toggle */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/10">
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                onClick={() => goTo(i, i > activeIndex ? 1 : -1)}
                aria-label={`Go to review ${i + 1}`}
                className="relative w-8 h-2 cursor-pointer group"
              >
                <span
                  className={`absolute inset-0 rounded-full border border-border transition-colors ${
                    i === activeIndex ? "bg-accent-coral" : "bg-bg group-hover:bg-accent-sky/40"
                  }`}
                />
                {/* Autoplay progress fill on the active dot */}
                {i === activeIndex && !paused && (
                  <motion.span
                    key={`fill-${activeIndex}-${Date.now()}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                    className="absolute inset-0 rounded-full bg-text/40 origin-left"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play reviews" : "Pause reviews"}
              className="w-9 h-9 border-2 border-border bg-bg text-text rounded-full flex items-center justify-center shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrev}
              className="w-10 h-10 border-2 border-border bg-bg text-text rounded-full flex items-center justify-center shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 border-2 border-border bg-bg text-text rounded-full flex items-center justify-center shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
