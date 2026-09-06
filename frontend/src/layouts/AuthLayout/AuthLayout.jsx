import { useState } from "react";
import { Outlet } from "react-router-dom";

import "./AuthLayout.css";

export function AuthLayout() {
  const [panel, setPanel] = useState({ icon: null, title: "", description: "", glow: false });

  return (
    <div className="auth-layout">
      <main className="auth-main">
        <Outlet context={setPanel} />
      </main>
      <div className="auth-aside">
        {panel.glow && <div className="auth-aside__glow" />}
        <div className="auth-aside__content">
          {panel.icon}
          <h2>{panel.title}</h2>
          <p>{panel.description}</p>
        </div>
      </div>
    </div>
  );
}