import { MoreHorizontal, Plus } from "lucide-react";

import KanbanCard from "./KanbanCard";

function KanbanColumn({
  column,
  draggingId,
  dragOverKey,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  addCard,
  commitCard,
}) {
  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="column-header-left">
          <span
            className={column.dotClass ? `column-dot ${column.dotClass}` : "column-dot"}
            style={column.dotStyle ?? undefined}
          />
          <span className="column-title">{column.title}</span>
          <span className="column-count">{column.cards.length}</span>
        </div>
        <button className="btn btn-ghost" style={{ padding: "4px" }}>
          <MoreHorizontal strokeWidth={1.6} size={16} />
        </button>
      </div>
      <div
        className={dragOverKey === column.key ? "column-body drag-over" : "column-body"}
        onDragOver={(e) => onDragOver(e, column.key)}
        onDragLeave={(e) => onDragLeave(e, column.key)}
        onDrop={(e) => onDrop(e, column.key)}
      >
        {column.cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            dragging={draggingId === card.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            commitCard={(title) => commitCard(column.key, card.id, title)}
          />
        ))}
      </div>
      <div style={{ padding: "0 12px 12px" }}>
        <button className="add-card-btn" onClick={() => addCard(column.key)}>
          <Plus strokeWidth={1.6} />
          Добавить карточку
        </button>
      </div>
    </div>
  );
}

export default KanbanColumn;
