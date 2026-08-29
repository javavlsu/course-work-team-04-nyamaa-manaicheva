import { useState } from "react";

import { mockNotes } from "../../lib/utils/mockData";
import AppSidebar from "../../components/layout/AppSidebar";
import Topbar from "./Topbar";
import Toolbar from "./Toolbar";
import FoldersSection from "./FoldersSection";
import NotesGrid from "./NotesGrid";
import EmptyState from "./EmptyState";
import FabGroup from "./FabGroup";
import "./NotesFeedPage.css";

function pluralRu(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "заметка";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "заметки";
  return "заметок";
}

export function NotesFeedPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [notes, setNotes] = useState(mockNotes);
  const [folders, setFolders] = useState([
    { key: "all", name: "Все заметки", tint: "tint-blue" },
    { key: "work", name: "Работа", tint: "tint-orange" },
    { key: "design", name: "Дизайн", tint: "tint-green" },
    { key: "marketing", name: "Маркетинг", tint: "tint-purple" },
  ]);
  const [activeFolder, setActiveFolder] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const favoritesCount = notes.filter((n) => n.favorited).length;
  const visible =
    activeFolder === "all"
      ? notes
      : notes.filter((n) => n.folder === activeFolder);

  const counts = notes.reduce((acc, note) => {
    acc[note.folder] = (acc[note.folder] || 0) + 1;
    return acc;
  }, {});
  counts.all = notes.length;

  const toggleFavorite = (id) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, favorited: !n.favorited } : n)));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    console.log("Search:", e.target.value);
  };

  const addFolder = () => {
    const tints = ["tint-orange", "tint-green", "tint-purple", "tint-blue"];
    const n = folders.length - 1;
    setFolders([
      ...folders,
      { key: `custom-${n}`, name: "Новая папка", tint: tints[folders.length % 4] },
    ]);
  };

  return (
    <div className="app">
      <AppSidebar
        active="notes"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        counts={{ all: notes.length, favorites: favoritesCount }}
      />
      <div className="main">
        <Topbar count={visible.length} pluralRu={pluralRu} />
        <Toolbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        <FoldersSection
          folders={folders}
          activeFolder={activeFolder}
          counts={counts}
          onSelect={setActiveFolder}
          onAdd={addFolder}
        />
        {visible.length > 0 ? (
          <NotesGrid notes={visible} onToggle={toggleFavorite} />
        ) : (
          <EmptyState />
        )}
      </div>
      <FabGroup />
    </div>
  );
}
