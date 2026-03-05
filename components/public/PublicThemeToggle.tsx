"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";

type ThemeMode = "system" | "dark" | "light";

const THEME_STORAGE_KEY = "public-theme-mode";
const THEME_ROOT_ID = "public-theme-root";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "dark" || value === "light";
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(mode: ThemeMode) {
  const root = document.getElementById(THEME_ROOT_ID);
  if (!root) return;
  const shouldDark = resolveIsDark(mode);
  root.classList.toggle("dark", shouldDark);
  root.setAttribute("data-theme-mode", mode);
  (root as HTMLElement).style.colorScheme = shouldDark ? "dark" : "light";
}

function nextMode(mode: ThemeMode): ThemeMode {
  if (mode === "system") return "dark";
  if (mode === "dark") return "light";
  return "system";
}

export function PublicThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const root = document.getElementById(THEME_ROOT_ID);
    const fromRoot = root ? root.getAttribute("data-theme-mode") : null;
    const fromStorage = localStorage.getItem(THEME_STORAGE_KEY);
    const initial = isThemeMode(fromRoot)
      ? fromRoot
      : isThemeMode(fromStorage)
        ? fromStorage
        : "system";
    setMode(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    applyTheme(mode);

    if (mode !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [mode]);

  const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : SunMoon;

  return (
    <button
      type="button"
      onClick={() => setMode((prev) => nextMode(prev))}
      className="rounded-md p-2 text-white/70 transition-colors hover:bg-white/8 hover:text-white"
      aria-label={`Theme: ${mode}. Click to switch`}
      title={`Theme: ${mode} (system -> dark -> light)`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.8} />
    </button>
  );
}
