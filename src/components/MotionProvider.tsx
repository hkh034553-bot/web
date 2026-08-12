"use client";

import React from "react";
import { MotionConfig } from "framer-motion";

/** Applies framer-motion's reduced-motion="user" globally to respect accessibility. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
