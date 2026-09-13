import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import AppSidebar from "@/components/layout/AppSidebar";
import { resetNotesCounts } from "@/hooks/useNotesCounts.js";
import "./WorkspaceLayout.css";

export function WorkspaceLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarProps, setSidebarProps] = useState({});

  useEffect(() => {
    resetNotesCounts();
  }, []);

  const outletContext = useMemo(() => ({ setSidebarProps }), [setSidebarProps]);

  return (
    <div className="app">
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        {...sidebarProps}
      />
      <div className="main">
        <Outlet context={outletContext} />
      </div>
    </div>
  );
}