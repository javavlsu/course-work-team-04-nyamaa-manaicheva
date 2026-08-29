import { useState } from "react";

const inputStyle = {
  border: "none",
  outline: "none",
  background: "none",
  font: "inherit",
  fontSize: "14px",
  fontWeight: "500",
  width: "100%",
};

function KanbanCard({ card, dragging, onDragStart, onDragEnd, commitCard }) {
  const [draft, setDraft] = useState("");

  if (card.editing) {
    return (
      <div className="kanban-card">
        <input
          className="kanban-card-title"
          type="text"
          placeholder="Название задачи…"
          autoFocus
          style={inputStyle}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commitCard(draft)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
        <div className="kanban-card-meta">
          <span className={`kanban-card-tag ${card.priority}`}>{card.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={dragging ? "kanban-card dragging" : "kanban-card"}
      draggable
      style={card.done ? { opacity: "0.7" } : undefined}
      onDragStart={() => onDragStart(card.id)}
      onDragEnd={onDragEnd}
    >
      <span className="kanban-card-title">{card.title}</span>
      <div className="kanban-card-meta">
        <span className={`kanban-card-tag ${card.priority}`}>{card.label}</span>
        {card.avatar && <div className="kanban-card-avatar">{card.avatar}</div>}
      </div>
      {card.date && <span className="kanban-card-date">{card.date}</span>}
    </div>
  );
}

export default KanbanCard;
