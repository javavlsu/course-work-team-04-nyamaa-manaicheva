import { useState } from "react";
import { Outlet } from "react-router-dom";

import "./AuthLayout.css";

export function AuthLayout() {
  const [, setPanel] = useState({ icon: null, title: "", description: "", glow: false });

  return (
    <div className="auth-layout">
      <main className="auth-main">
        <Outlet context={setPanel} />
      </main>
      <aside className="auth-aside">
        <div className="auth-aside__content">
          <h2>
            Ваше новое пространство
            <br /> уже ждет вас!
          </h2>
        </div>
        <img className="auth-aside__image" src="/images/auth.jpg" alt="" />
      </aside>
    </div>
  );
}
