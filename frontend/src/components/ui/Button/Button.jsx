import { Link } from "react-router-dom";
import "./Button.css";

function Button({ variant = "primary", to, href, type = "button", className = "", children, ...props }) {
  const classes = `btn btn-${variant}${className ? ` ${className}` : ""}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
