"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, CornerDownLeft, FileText } from "lucide-react";
import { SEARCH_INDEX } from "@/lib/site";

/** Custom event name the Navbar triggers to open the search overlay. */
export const OPEN_SEARCH_EVENT = "hkh:open-search";

export function openSiteSearch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
  }
}

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // Fresh query each time the palette opens; cleared again on close.
        setQuery("");
        setOpen((o) => !o);
      }
    };
    const onOpen = () => {
      setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  // Focus the input when opened.
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEARCH_INDEX.slice(0, 8);
    return SEARCH_INDEX.filter((item) => {
      const haystack = [
        item.title,
        item.section,
        item.description,
        ...(item.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    }).slice(0, 12);
  }, [query]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) go(results[active].href);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
            className="absolute inset-0 bg-black"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search the site"
            className="relative w-full max-w-xl brutalist-card bg-surface overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b-2 border-border px-5 py-4">
              <Search className="w-5 h-5 text-accent-coral flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search services, pages, FAQs..."
                aria-label="Search"
                className="flex-grow bg-transparent text-text placeholder:text-text-muted/60 text-base outline-none"
              />
              {query ? (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="text-text-muted hover:text-text cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="text-[10px] font-bold px-2 py-1 border-2 border-border bg-bg rounded-md text-text-muted">
                  ESC
                </kbd>
              )}
            </div>

            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-text-muted">
                  No results for “{query}”. Try “website”, “branding”, or “pricing”.
                </li>
              )}
              {results.map((item, idx) => (
                <li key={`${item.href}-${item.title}`}>
                  <button
                    onClick={() => go(item.href)}
                    onMouseEnter={() => setActive(idx)}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-start gap-3 border-2 transition-colors cursor-pointer ${
                      idx === active
                        ? "bg-accent-coral/10 border-accent-coral"
                        : "border-transparent hover:bg-bg/50"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg border-2 border-border flex items-center justify-center flex-shrink-0 ${
                        idx === active ? "bg-accent-coral text-white" : "bg-bg text-text"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                    </span>
                    <span className="flex-grow min-w-0">
                      <span className="block font-bold text-sm text-text truncate">
                        {item.title}
                      </span>
                      <span className="block text-xs text-text-muted truncate">
                        {item.section} — {item.description}
                      </span>
                    </span>
                    {idx === active && (
                      <CornerDownLeft className="w-4 h-4 text-accent-coral flex-shrink-0 mt-1" />
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t-2 border-border px-5 py-3 flex items-center gap-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
              <span>
                <kbd className="border border-border rounded px-1.5 py-0.5 bg-bg">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="border border-border rounded px-1.5 py-0.5 bg-bg">↵</kbd> open
              </span>
              <span>
                <kbd className="border border-border rounded px-1.5 py-0.5 bg-bg">esc</kbd> close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
