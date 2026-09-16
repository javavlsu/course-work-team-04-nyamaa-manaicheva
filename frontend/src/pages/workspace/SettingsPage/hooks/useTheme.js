import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "nb-theme";

export default function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) === "dark");

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem(THEME_KEY, "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem(THEME_KEY, "light");
    }
  }, [dark]);

  const toggle = useCallback(() => setDark((value) => !value), []);

  return { dark, toggle };
}