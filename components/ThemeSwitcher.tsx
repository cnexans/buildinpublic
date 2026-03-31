"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "system" | "dark" | "light";

const themes = {
  system: { name: "Sistema", icon: Monitor },
  dark: { name: "Oscuro", icon: Moon },
  light: { name: "Claro", icon: Sun },
};

const themeOrder: Theme[] = ["system", "dark", "light"];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;

    if (selectedTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      if (systemTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else if (selectedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "system";
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const cycleTheme = () => {
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <button
        className="w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center"
        disabled
        aria-label="Cambiar tema"
      >
        <Monitor size={18} className="text-muted-foreground" />
      </button>
    );
  }

  const CurrentIcon = themes[theme].icon;

  return (
    <button
      onClick={cycleTheme}
      className="w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center hover:bg-accent transition-colors cursor-pointer"
      aria-label={`Tema actual: ${themes[theme].name}. Click para cambiar.`}
      title={themes[theme].name}
    >
      <CurrentIcon size={18} className="text-foreground" />
    </button>
  );
}
