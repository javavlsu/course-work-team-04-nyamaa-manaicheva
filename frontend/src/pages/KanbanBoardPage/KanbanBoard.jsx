import KanbanColumn from "./KanbanColumn";

function KanbanBoard({
  columns,
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
    <div className="kanban-board">
      {columns.map((column) => (
        <KanbanColumn
          key={column.key}
          column={column}
          draggingId={draggingId}
          dragOverKey={dragOverKey}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          addCard={addCard}
          commitCard={commitCard}
        />
      ))}
    </div>
  );
}

export default KanbanBoard;
