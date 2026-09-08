import { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Heading,
  Link,
  Paperclip,
  Copy,
  Scissors,
  ClipboardPaste,
  List,
  ListOrdered,
  ListTodo,
  Table,
  ChevronDown,
} from "lucide-react";

export default function FormatToolbar({
  onBold,
  onItalic,
  onStrikethrough,
  onUnderline,
  onHeading,
  onLink,
  onBulletList,
  onNumberedList,
  onTaskList,
  onTable,
  onFileSelect,
  isUploading = false,
  uploadDisabled = false,
  onCopy,
  onCut,
  onPaste,
}) {
  const [headingOpen, setHeadingOpen] = useState(false);
  const headingRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleHeadingSelect = (level) => {
    onHeading(level);
    setHeadingOpen(false);
  };

  const handleAttachClick = () => {
    if (isUploading || uploadDisabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file && onFileSelect) onFileSelect(file);
  };

  return (
    <div className="format-toolbar">
      <div className="fmt-group">
        <button className="fmt-btn" title="Курсив" onClick={onItalic}>
          <Italic strokeWidth={2} />
        </button>
        <button className="fmt-btn" title="Жирный" onClick={onBold}>
          <Bold strokeWidth={2} />
        </button>
        <button className="fmt-btn" title="Подчёркнутый" onClick={onUnderline}>
          <Underline strokeWidth={2} />
        </button>
        <button className="fmt-btn" title="Зачёркнутый" onClick={onStrikethrough}>
          <Strikethrough strokeWidth={2} />
        </button>

        <div className="fmt-heading-wrap" ref={headingRef}>
          <button
            className="fmt-btn"
            title="Заголовок"
            onClick={() => setHeadingOpen((p) => !p)}
          >
            <Heading strokeWidth={2} />
            <ChevronDown strokeWidth={2} className="fmt-heading-chevron" />
          </button>
          {headingOpen && (
            <div className="fmt-heading-dropdown">
              {[1, 2, 3, 4, 5, 6].map((lvl) => (
                <button
                  key={lvl}
                  className="fmt-heading-option"
                  onClick={() => handleHeadingSelect(lvl)}
                >
                  <span className={`fmt-h-preview fmt-h${lvl}`}>H{lvl}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fmt-group">
        <button className="fmt-btn" title="Вставить ссылку" onClick={onLink}>
          <Link strokeWidth={2} />
        </button>
        <button
          className="fmt-btn"
          title={isUploading ? "Загрузка…" : "Прикрепить файл"}
          onClick={handleAttachClick}
          disabled={isUploading || uploadDisabled}
        >
          <Paperclip strokeWidth={2} />
        </button>
      </div>

      <div className="fmt-sep" />

      <div className="fmt-group">
        <button className="fmt-btn" title="Копировать" onClick={onCopy}>
          <Copy strokeWidth={2} />
        </button>
        <button className="fmt-btn" title="Вырезать" onClick={onCut}>
          <Scissors strokeWidth={2} />
        </button>
        <button className="fmt-btn" title="Вставить" onClick={onPaste}>
          <ClipboardPaste strokeWidth={2} />
        </button>
      </div>

      <div className="fmt-sep" />

      <div className="fmt-group">
        <button className="fmt-btn" title="Маркированный список" onClick={onBulletList}>
          <List strokeWidth={2} />
        </button>
        <button className="fmt-btn" title="Нумерованный список" onClick={onNumberedList}>
          <ListOrdered strokeWidth={2} />
        </button>
        <button className="fmt-btn" title="Список задач" onClick={onTaskList}>
          <ListTodo strokeWidth={2} />
        </button>
      </div>

      <div className="fmt-sep" />

      <div className="fmt-group fmt-group-table">
        <button className="fmt-btn" title="Вставить таблицу" onClick={onTable}>
          <Table strokeWidth={2} />
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
