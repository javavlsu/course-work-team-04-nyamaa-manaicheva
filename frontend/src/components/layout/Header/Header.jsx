import { Link } from "react-router-dom";
import { BookText } from "lucide-react";

import Button from "../../ui/Button";
import "./Header.css";

function Header() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
        <BookText />
        NotesBook
      </Link>
      <div className="nav-actions">
        <Button variant="secondary" to="/login">Войти</Button>
        <Button variant="primary" to="/register">Регистрация</Button>
      </div>
    </nav>
  );
}

export default Header;
