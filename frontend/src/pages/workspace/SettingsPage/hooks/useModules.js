import { useCallback, useEffect, useState } from "react";

const MODULES_STORAGE_KEY = "nb-modules";
const DEFAULT_MODULES = { kanban: true, calendar: true, analytics: true };

function readModules() {
  try {
    const raw = localStorage.getItem(MODULES_STORAGE_KEY);
    if (!raw) return DEFAULT_MODULES;
    const parsed = JSON.parse(raw);
    const modules = { ...DEFAULT_MODULES };
    for (const key of ["kanban", "calendar", "analytics"]) {
      if (typeof parsed[key] === "boolean") {
        modules[key] = parsed[key];
      }
    }
    return modules;
  } catch {
    return DEFAULT_MODULES;
  }
}

export default function useModules() {
  const [modules, setModules] = useState(readModules);

  useEffect(() => {
    localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(modules));
  }, [modules]);

  const toggle = useCallback((key) => {
    setModules((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  return { modules, toggle };
}