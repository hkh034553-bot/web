"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/Reveal";
import { FAQ_ITEMS, type FaqItem } from "@/lib/site";

interface FAQSectionProps {
  items?: FaqItem[];
  className?: string;
}

export default function FAQSection({ items = FAQ_ITEMS, className = "" }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className={`scroll-mt-28 ${className}`}>
      <Reveal>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm font-bold text-accent-coral tracking-widest uppercase block mb-2">
            Before You Ask
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text">
            Frequently Asked <span className="font-normal text-text-muted">Questions</span>
          </h2>
          <p className="text-text-muted mt-3 text-sm">
            Quick answers to the questions we hear most. Tap a question to expand it.
          </p>
        </div>
      </Reveal>

      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Reveal key={item.question} delay={idx * 0.04}>
              <div
                className={`brutalist-card bg-surface overflow-hidden transition-colors ${
                  isOpen ? "border-accent-coral" : ""
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer"
                >
                  <span className="font-display font-bold text-base sm:text-lg text-text">
                    {item.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-shrink-0"
                  >
                    <span
                      className={`w-8 h-8 border-2 border-border rounded-full flex items-center justify-center ${
                        isOpen ? "bg-accent-coral text-white" : "bg-bg text-text"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-text-muted leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
