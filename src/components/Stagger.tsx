"use client";

import React from "react";
import { motion } from "framer-motion";
import { EASE, VIEWPORT } from "@/lib/animations";

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  stagger?: number;
  delay?: number;
}

/** Parent that cascades its <StaggerItem /> children with a stagger delay. */
export function Stagger({
  children,
  className,
  id,
  stagger = 0.09,
  delay = 0,
}: StaggerProps) {
  return (
    <motion.div
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ItemProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
  x?: number;
}

/** Individual element inside a <Stagger /> parent. */
export function StaggerItem({ children, className, y = 28, x = 0 }: ItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y, x },
        visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.55, ease: EASE } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
