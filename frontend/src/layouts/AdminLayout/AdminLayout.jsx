import { useCallback, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "@/components/layout/AdminSidebar";
import "../WorkspaceLayout/WorkspaceLayout.css";

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarProps, setSidebarProps] = useState({});

  const mergeSidebarProps = useCallback((props) => {
    setSidebarProps((prev) => ({ ...prev, ...props }));
  }, []);

  const outletContext = useMemo(
    () => ({ setSidebarProps: mergeSidebarProps }),
    [mergeSidebarProps],
  );

  return (
    <div className="app">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        active={sidebarProps.active}
      />
      <div className="main">
        <Outlet context={outletContext} />
      </div>
    </div>
  );
}
