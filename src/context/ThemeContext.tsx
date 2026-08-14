"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Read from localStorage or default to light
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Default to light as requested in design brief
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }

    // Check screen size
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    setMounted(true);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const paddingLeftValue = mounted && isDesktop 
    ? (isMenuOpen ? "400px" : "80px") 
    : "0px";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isMenuOpen, setIsMenuOpen }}>
      <motion.div
        style={!mounted ? { visibility: "hidden" } : undefined}
        animate={{
          paddingLeft: paddingLeftValue
        }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="min-h-screen flex flex-col w-full bg-[#FAFAF6] dark:bg-[#14141A] overflow-x-hidden"
      >
        {children}
      </motion.div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
