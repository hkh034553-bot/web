"use client";

import React from "react";
import { motion } from "framer-motion";
import { EASE, VIEWPORT } from "@/lib/animations";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  once?: boolean;
}

/**
 * Scroll-triggered reveal wrapper for individual sections/elements.
 * Fades + slides up (or from a given offset) when scrolled into view.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  x = 0,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ ...VIEWPORT, once }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
