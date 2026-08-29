import { useState } from "react";
import { Link } from "lucide-react";

import { PaperclipIcon } from "./icons";

export default function FormatToolbar() {
  const [active, setActive] = useState([]);

  const toggleCmd = (cmd) => {
    setActive(
      active.includes(cmd)
        ? active.filter((c) => c !== cmd)
        : [...active, cmd],
    );
  };

  const btnClass = (cmd) => (active.includes(cmd) ? "fmt-btn active" : "fmt-btn");

  return (
    <div className="format-toolbar">
      <button
        className={btnClass("bold")}
        title="Жирный"
        onClick={() => toggleCmd("bold")}
      >
        <strong>B</strong>
      </button>
      <button
        className={btnClass("italic")}
        title="Курсив"
        onClick={() => toggleCmd("italic")}
      >
        <em>I</em>
      </button>
      <button
        className={btnClass("strikethrough")}
        title="Зачёркнутый"
        onClick={() => toggleCmd("strikethrough")}
      >
        <s>S</s>
      </button>
      <span className="fmt-sep"></span>
      <button className="fmt-btn" title="Вставить ссылку">
        <Link strokeWidth={1.8} />
      </button>
      <span className="fmt-sep"></span>
      <button className="fmt-btn" title="Прикрепить файл">
        <PaperclipIcon />
      </button>
    </div>
  );
}
