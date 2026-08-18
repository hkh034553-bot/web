"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { getPreference, setPreference } from "@/lib/cookies";

const CONSENT_KEY = "hkh_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getPreference(CONSENT_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const decide = (value: "accepted" | "declined") => {
    setPreference(CONSENT_KEY, value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-full max-w-xl z-[65]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div
              role="dialog"
              aria-label="Cookie consent"
              className="brutalist-card bg-surface p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <span className="brutalist-badge-coral w-11 h-11 flex-shrink-0">
                <Cookie className="w-5 h-5 text-white" />
              </span>
              <p className="text-sm text-text-muted leading-relaxed flex-grow">
                We use cookies to improve your browsing experience, analyse traffic, and tailor our marketing. Accepting helps us keep improving — it won&apos;t change how the site works for you.
              </p>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => decide("declined")}
                  className="brutalist-btn brutalist-btn-secondary px-5 py-2.5 text-xs"
                >
                  Decline
                </button>
                <button
                  onClick={() => decide("accepted")}
                  className="brutalist-btn brutalist-btn-primary px-5 py-2.5 text-xs"
                >
                  Accept All
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
