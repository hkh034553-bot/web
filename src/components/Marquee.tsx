"use client";

import React from "react";
import { motion } from "framer-motion";

const ITEMS = [
  "Branding",
  "Web Development",
  "Social Media Marketing",
  "Paid Ads",
  "App Development",
  "Graphic Design",
  "SEO",
  "Content Strategy",
  "Conversion Optimization",
  "Video Editing",
  "Email Campaigns",
  "UI/UX Design",
];

/** Infinite horizontal marquee of service keywords. */
export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y-2 border-border bg-surface py-4 select-none">
      <motion.div
        className="flex w-max items-center whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        {row.map((item, i) => (
          <span
            key={i}
            className="flex items-center font-display font-bold uppercase tracking-[0.18em] text-text-muted text-sm sm:text-base"
          >
            <span className="mx-6 text-accent-coral" aria-hidden>
              ✦
            </span>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
