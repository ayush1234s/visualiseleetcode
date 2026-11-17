import { createContext, useContext, useEffect, useMemo, useState } from "react";

const darkTokens = {
  surface: "bg-[#161b22]",
  inset: "bg-[#0d1117]",
  subtle: "bg-[#21262d]",
  border: "border-[#30363d]",
  divider: "divide-[#30363d]",
  text: "text-white",
  secondary: "text-gray-300",
  muted: "text-gray-400",
  hover: "hover:bg-[#21262d]/50",
};

const lightTokens = {
  surface: "bg-white",
  inset: "bg-slate-50",
  subtle: "bg-slate-100",
  border: "border-slate-200",
  divider: "divide-slate-200",
  text: "text-slate-900",
  secondary: "text-slate-700",
  muted: "text-slate-500",
  hover: "hover:bg-slate-50",
};

const ThemeContext = createContext({
  theme: "dark",
  resolvedTheme: "dark",
  isLight: false,
  tokens: darkTokens,
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app_theme") || "system";
  });

  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;
  const isLight = resolvedTheme === "light";
  const tokens = useMemo(() => (isLight ? lightTokens : darkTokens), [isLight]);

  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    const root = document.documentElement;
    const body = document.body;

    if (resolvedTheme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");

      if (body) {
        body.classList.remove("dark");
        body.classList.add("light");
        body.setAttribute("data-theme", "light");
      }
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");

      if (body) {
        body.classList.remove("light");
        body.classList.add("dark");
        body.setAttribute("data-theme", "dark");
      }
    }
  }, [theme, resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, isLight, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
