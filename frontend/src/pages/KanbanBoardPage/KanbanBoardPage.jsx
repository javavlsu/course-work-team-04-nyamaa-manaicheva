import { useState } from "react";

import AppSidebar from "../../components/layout/AppSidebar";
import Topbar from "./Topbar";
import KanbanBoard from "./KanbanBoard";
import { mockColumns } from "../../lib/utils/mockData";
import "./KanbanBoardPage.css";

export function KanbanBoardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [columns, setColumns] = useState(mockColumns);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);

  const handleDragStart = (id) => {
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverKey(null);
  };

  const handleDragOver = (e, key) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverKey(key);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverKey(null);
    }
  };

  const handleDrop = (e, targetKey) => {
    e.preventDefault();
    if (draggingId == null) return;
    setColumns((prev) => {
      const source = prev.find((col) => col.cards.some((c) => c.id === draggingId));
      if (!source) return prev;
      const card = source.cards.find((c) => c.id === draggingId);
      return prev.map((col) => {
        if (col.key === targetKey && source.key === targetKey) {
          return { ...col, cards: [...col.cards.filter((c) => c.id !== draggingId), card] };
        }
        if (col.key === source.key) {
          return { ...col, cards: col.cards.filter((c) => c.id !== draggingId) };
        }
        if (col.key === targetKey) {
          return { ...col, cards: [...col.cards, card] };
        }
        return col;
      });
    });
    setDragOverKey(null);
  };

  const addCard = (columnKey) => {
    setColumns((prev) => {
      const nextId =
        prev.reduce((max, col) => Math.max(max, ...col.cards.map((c) => c.id)), 0) + 1;
      return prev.map((col) =>
        col.key === columnKey
          ? {
              ...col,
              cards: [
                ...col.cards,
                { id: nextId, title: "", editing: true, priority: "medium", label: "Средний" },
              ],
            }
          : col,
      );
    });
  };

  const commitCard = (columnKey, cardId, title) => {
    const trimmed = title.trim();
    setColumns((prev) =>
      prev.map((col) => {
        if (col.key !== columnKey) return col;
        const cards = trimmed
          ? col.cards.map((c) =>
              c.id === cardId ? { ...c, title: trimmed, editing: false } : c,
            )
          : col.cards.filter((c) => c.id !== cardId);
        return { ...col, cards };
      }),
    );
  };

  return (
    <div className="app">
      <AppSidebar
        active="kanban"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="main">
        <Topbar />
        <KanbanBoard
          columns={columns}
          draggingId={draggingId}
          dragOverKey={dragOverKey}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          addCard={addCard}
          commitCard={commitCard}
        />
      </div>
    </div>
  );
}
