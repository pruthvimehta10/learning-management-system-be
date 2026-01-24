"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    // 1. Check if the browser supports View Transitions
    if (!document.startViewTransition) {
      setTheme(theme === "dark" ? "light" : "dark");
      return;
    }

    // 2. Start the transition
    document.startViewTransition(() => {
      // 3. This is where the actual theme change happens
      setTheme(theme === "dark" ? "light" : "dark");
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center gap-2 px-4 h-9 rounded-md border-4 border-foreground bg-accent text-accent-foreground font-black hover:bg-accent/80 transition-colors"
      style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.1)" }}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}