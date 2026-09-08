import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import AppSidebar from "@/components/layout/AppSidebar";
import "./WorkspaceLayout.css";

export function WorkspaceLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarProps, setSidebarProps] = useState({});

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