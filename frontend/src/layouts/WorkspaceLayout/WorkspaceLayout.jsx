import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import AppSidebar from "@/components/layout/AppSidebar";
import { resetNotesCounts, useNotesCounts } from "@/hooks/useNotesCounts.js";
import "./WorkspaceLayout.css";

export function WorkspaceLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarProps, setSidebarProps] = useState({});
  const counts = useNotesCounts({ autoFetch: true });

  useEffect(() => {
    resetNotesCounts();
  }, []);

  const mergeSidebarProps = useCallback((props) => {
    setSidebarProps((prev) => ({ ...prev, ...props }));
  }, []);

  const outletContext = useMemo(
    () => ({ setSidebarProps: mergeSidebarProps }),
    [mergeSidebarProps],
  );

  const sidebarCounts = useMemo(
    () => ({
      all: counts.totalNotesCount ?? undefined,
      directories: counts.directoriesCount ?? undefined,
      favorites: counts.favouritesCount ?? undefined,
      trash: counts.trashCount ?? undefined,
    }),
    [counts],
  );

  return (
    <div className="app">
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        {...sidebarProps}
        counts={sidebarCounts}
      />
      <div className="main">
        <Outlet context={outletContext} />
      </div>
    </div>
  );
}