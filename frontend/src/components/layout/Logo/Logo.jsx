import { Link } from "react-router-dom";
import { BookText } from "lucide-react";
import "./Logo.css";

function Logo() {
  return (
    <Link to="/" className="logo">
      <BookText />
      NotesBook
    </Link>
  );
}

export default Logo;
