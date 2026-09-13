import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, Kanban, ListTodo, StickyNote, Table, X } from "lucide-react";
import "./NoteTemplateModal.css";

const NOTE_TEMPLATES = [
  { key: "Empty", label: "Заметка", description: "Обычная заметка в Markdown", to: "/notes/new", Icon: StickyNote },
  { key: "List", label: "Список задач", description: "Чек-лист с выполненными задачами", to: "/notes/new?type=List", Icon: ListTodo },
  { key: "Table", label: "Таблица", description: "Редактируемая таблица", to: "/notes/new?type=Table", Icon: Table },
  { key: "Directory", label: "Директория", description: "Папка для группировки заметок", action: "directory", Icon: Folder },
  { key: "Kanban", label: "Канбан доска", description: "Пока недоступна", action: "kanban", Icon: Kanban },
];

function NoteTemplateModal({ open, onClose, onCreateDirectory }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSelect = (template) => {
    if (template.action === "directory") {
      onClose();
      onCreateDirectory?.();
      return;
    }
    if (template.action === "kanban") {
      onClose();
      window.alert("Функция «Канбан доска» пока недоступна");
      return;
    }
    navigate(template.to);
  };

  return (
    <div className="note-template-modal-overlay" onClick={handleOverlayClick}>
      <div className="note-template-modal" role="dialog" aria-modal="true" aria-label="Создать...">
        <div className="note-template-modal-header">
          <h3 className="note-template-modal-title">Создать...</h3>
          <button
            className="note-template-modal-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="note-template-modal-body">
          {NOTE_TEMPLATES.map((template) => {
            const Icon = template.Icon;
            return (
              <button
                key={template.key}
                type="button"
                className="note-template-option"
                onClick={() => handleSelect(template)}
              >
                <span className="note-template-option-icon">
                  <Icon strokeWidth={1.8} />
                </span>
                <span className="note-template-option-text">
                  <span className="note-template-option-label">{template.label}</span>
                  <span className="note-template-option-desc">{template.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NoteTemplateModal;