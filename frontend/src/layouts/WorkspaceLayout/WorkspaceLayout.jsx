import { useState } from "react";
import { Outlet } from "react-router-dom";

export function WorkspaceLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app">
      <Outlet context={{ collapsed, onToggleSidebar: () => setCollapsed((v) => !v) }} />
    </div>
  );
}