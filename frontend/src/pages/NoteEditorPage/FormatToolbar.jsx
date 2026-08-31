import { useRef, useState } from "react";
import { Link } from "lucide-react";

import { PaperclipIcon } from "./icons";

export default function FormatToolbar({
  onFileSelect,
  isUploading = false,
  uploadDisabled = false,
}) {
  const [active, setActive] = useState([]);
  const fileInputRef = useRef(null);

  const toggleCmd = (cmd) => {
    setActive(
      active.includes(cmd)
        ? active.filter((c) => c !== cmd)
        : [...active, cmd],
    );
  };

  const btnClass = (cmd) => (active.includes(cmd) ? "fmt-btn active" : "fmt-btn");

  const handleAttachClick = () => {
    if (isUploading || uploadDisabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    // Сброс value, чтобы повторный выбор того же файла снова вызывал onChange
    e.target.value = "";
    if (file && onFileSelect) onFileSelect(file);
  };

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
      <button
        className="fmt-btn"
        title={isUploading ? "Загрузка…" : "Прикрепить файл"}
        onClick={handleAttachClick}
        disabled={isUploading || uploadDisabled}
      >
        <PaperclipIcon />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
