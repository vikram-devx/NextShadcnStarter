import { useState, useEffect } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    
    // If saved theme exists, use it
    if (savedTheme) return savedTheme;
    
    // Check for system preference
    if (typeof window !== "undefined") {
      const systemPrefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemPrefersDark ? "dark" : "light";
    }
    
    // Default to light theme
    return "light";
  });

  useEffect(() => {
    // Update localStorage and apply theme to document
    localStorage.setItem("theme", theme);
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return { theme, setTheme };
}
