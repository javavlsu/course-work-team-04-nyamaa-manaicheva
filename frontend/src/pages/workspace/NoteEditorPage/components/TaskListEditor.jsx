import { useRef } from "react";
import { Plus, X } from "lucide-react";
import "./TaskListEditor.css";

function TaskListEditor({ items, onItemsChange }) {
  const list = Array.isArray(items) ? items : [];
  const focusRefs = useRef([]);

  const updateText = (index, text) => {
    onItemsChange(list.map((item, i) => (i === index ? { ...item, text } : item)));
  };

  const toggleDone = (index) => {
    onItemsChange(list.map((item, i) => (i === index ? { ...item, done: !item.done } : item)));
  };

  const removeItem = (index) => {
    onItemsChange(list.filter((_, i) => i !== index));
  };

  const addItem = (index) => {
    const next = [...list];
    next.splice(index + 1, 0, { text: "", done: false });
    onItemsChange(next);
    requestAnimationFrame(() => focusRefs.current[index + 1]?.focus());
  };

  const handleKeyDown = (e, index) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    const item = list[index];
    if (!item || item.text.trim() === "") {
      removeItem(index);
    } else {
      addItem(index);
    }
  };

  if (list.length === 0) {
    return (
      <div className="task-list-editor task-list-editor-empty">
        <button
          className="task-list-add"
          onClick={() => onItemsChange([{ text: "", done: false }])}
        >
          <Plus size={14} strokeWidth={2} />
          Добавить задачу
        </button>
      </div>
    );
  }

  return (
    <div className="task-list-editor">
      {list.map((item, i) => (
        <div className="task-row" key={i}>
          <input
            type="checkbox"
            className="task-checkbox"
            checked={Boolean(item.done)}
            onChange={() => toggleDone(i)}
            aria-label={`Задача «${item.text || "без названия"}» выполнена`}
          />
          <input
            ref={(el) => {
              focusRefs.current[i] = el;
            }}
            className={`task-text${item.done ? " done" : ""}`}
            value={item.text}
            placeholder="Новая задача"
            onChange={(e) => updateText(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
          <button
            className="task-delete"
            title="Удалить задачу"
            onClick={() => removeItem(i)}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
      ))}
      <button className="task-list-add" onClick={() => addItem(list.length - 1)}>
        <Plus size={14} strokeWidth={2} />
        Добавить задачу
      </button>
    </div>
  );
}

export default TaskListEditor;