import "./AuthLayout.css";

function AuthLayout({ icon, title, description, glow = false, children }) {
  return (
    <div className="auth-layout">
      <main className="auth-main">{children}</main>
      <div className="auth-aside">
        {glow && <div className="auth-aside__glow" />}
        <div className="auth-aside__content">
          {icon}
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
