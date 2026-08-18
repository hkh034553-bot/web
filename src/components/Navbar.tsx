"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Menu, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { openSiteSearch } from "@/components/SiteSearch";

export default function Navbar() {
  const { theme, toggleTheme, isMenuOpen, setIsMenuOpen } = useTheme();
  const isOpen = isMenuOpen;
  const setIsOpen = setIsMenuOpen;

  const navLinks = [
    { name: "Services", href: "/services" },
    { name: "How We Work", href: "/#how-we-work" },
    { name: "Our Process", href: "/#our-process" },
    { name: "Our Work", href: "/#our-work" },
    { name: "Reviews", href: "/#reviews" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* 1. DESKTOP LEFT VERTICAL NAVBAR (Hidden on mobile) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-surface border-r-2 border-border flex-col justify-between items-center py-8 z-50 transition-colors duration-300">
        {/* Top: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="group flex items-center justify-center">
            <span className="brutalist-badge-coral w-12 h-12 flex items-center justify-center font-display font-bold text-2xl text-white select-none">
              H
            </span>
          </Link>
        </div>

        {/* Middle: Menu Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 border-2 border-border bg-bg text-text rounded-full flex items-center justify-center shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150 cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Bottom: Search + Theme Toggle */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={openSiteSearch}
            className="w-11 h-11 border-2 border-border bg-bg text-text rounded-full flex items-center justify-center shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 cursor-pointer"
            aria-label="Search the site (Ctrl+K)"
            title="Search (Ctrl+K)"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="w-11 h-11 border-2 border-border bg-bg text-text rounded-full flex items-center justify-center shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5 text-accent-amber animate-[spin_10s_linear_infinite]" />
            )}
          </button>
        </div>
      </aside>

      {/* 2. DESKTOP LEFT SLIDING DRAWER MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="hidden md:block fixed inset-0 bg-black z-30"
            />
            
            {/* Left sliding menu panel */}
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="hidden md:flex fixed left-20 top-0 bottom-0 w-80 bg-surface border-r-2 border-border z-40 p-10 flex-col justify-between transition-colors duration-300 shadow-brutal"
            >
              <div className="flex flex-col h-full justify-between pt-12">
                {/* Menu items */}
                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-accent-coral uppercase tracking-widest mb-2">Navigation Menu</p>
                  <div className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="font-display font-bold text-2xl text-text hover:text-accent-coral transition-colors w-fit hover:translate-x-1 duration-150 transform inline-block"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Bottom of drawer: CTA */}
                <div className="space-y-6 pb-6">
                  <Link
                    href="/contact?focus=Quote"
                    onClick={() => setIsOpen(false)}
                    className="brutalist-btn brutalist-btn-primary w-full py-3 text-center text-sm font-bold block"
                  >
                    Get a Free Quote
                  </Link>
                  <p className="text-text-muted text-[10px] text-center">
                    &copy; HKH Agency. Zero templates. Direct execution.
                  </p>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* 3. MOBILE HEADER (Shown on mobile only) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-20 border-b-2 border-border bg-bg/95 backdrop-blur-md flex items-center justify-between px-6 z-50 transition-colors duration-300">
        {/* Left: Hamburger/Close button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 border-2 border-border bg-surface text-text rounded-full flex items-center justify-center shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Center: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="group flex items-center gap-2">
            <span className="brutalist-badge-coral w-9 h-9 flex items-center justify-center font-display font-bold text-lg text-white">
              H
            </span>
            <span className="font-display font-bold text-xl tracking-tight text-text">
              HKH<span className="text-accent-coral">.</span>
            </span>
          </Link>
        </div>

        {/* Right: Search + Theme Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={openSiteSearch}
            className="w-10 h-10 border-2 border-border bg-surface text-text rounded-full flex items-center justify-center shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
            aria-label="Search the site"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 border-2 border-border bg-surface text-text rounded-full flex items-center justify-center shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-accent-amber" />
            )}
          </button>
        </div>
      </header>

      {/* 4. MOBILE SLIDING DRAWER MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-30"
            />
            
            {/* Mobile Left sliding menu panel */}
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="md:hidden fixed left-0 top-20 bottom-0 w-[80vw] max-w-sm bg-surface border-r-2 border-border z-40 p-8 flex flex-col justify-between transition-colors duration-300 shadow-brutal"
            >
              <div className="flex flex-col h-full justify-between pt-6">
                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-accent-coral uppercase tracking-widest">Navigation Menu</p>
                  <div className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="font-display font-bold text-xl text-text hover:text-accent-coral transition-colors w-fit"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 pb-6">
                  <Link
                    href="/contact?focus=Quote"
                    onClick={() => setIsOpen(false)}
                    className="brutalist-btn brutalist-btn-primary w-full py-3 text-center text-sm font-bold block"
                  >
                    Get a Free Quote
                  </Link>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
