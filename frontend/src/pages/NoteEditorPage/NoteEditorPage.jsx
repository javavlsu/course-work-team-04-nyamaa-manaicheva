import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import AppSidebar from "../../components/layout/AppSidebar";
import { mockComments, mockNotes } from "../../lib/utils/mockData";
import EditorTopbar from "./EditorTopbar";
import FormatToolbar from "./FormatToolbar";
import MarkdownArea from "./MarkdownArea";
import CommentsSection from "./CommentsSection";
import "./NoteEditorPage.css";

const blankNote = {
  title: "",
  content: "",
  createdAt: "только что",
  updatedAt: "только что",
};

const initialShareUsers = [
  { name: "Мария К.", initials: "МК", role: "Редактирование" },
  { name: "Дмитрий С.", initials: "ДС", role: "Просмотр" },
];

export function NoteEditorPage() {
  const { id } = useParams();
  const note =
    id === "new"
      ? blankNote
      : mockNotes.find((n) => n.id === Number(id)) || blankNote;

  const [collapsed, setCollapsed] = useState(false);
  const [mode, setMode] = useState("edit");
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [favorited, setFavorited] = useState(Boolean(note.favorited));
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacy, setPrivacy] = useState("private");
  const [shareUsers, setShareUsers] = useState(initialShareUsers);
  const [comments, setComments] = useState(mockComments);
  const [commentDraft, setCommentDraft] = useState("");

  const privacyWrapRef = useRef(null);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (
        privacyWrapRef.current &&
        !privacyWrapRef.current.contains(e.target)
      ) {
        setPrivacyOpen(false);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () =>
      document.removeEventListener("click", handleDocumentClick);
  }, []);

  const addShareUser = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const initials = trimmed
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    setShareUsers([
      ...shareUsers,
      { name: trimmed, initials, role: "Просмотр" },
    ]);
  };

  const removeShareUser = (index) => {
    setShareUsers(shareUsers.filter((_, i) => i !== index));
  };

  const addComment = () => {
    const text = commentDraft.trim();
    if (!text) return;
    setComments([
      ...comments,
      { author: "Алексей В.", initials: "АВ", time: "только что", text },
    ]);
    setCommentDraft("");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleExport = () => {
    const safeTitle = title || "Без названия";
    const blob = new Blob([content], { type: "text/markdown; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      safeTitle
        .replace(/[^a-zA-Zа-яА-Я0-9_\- ]/g, "")
        .trim()
        .replace(/\s+/g, "-") + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    console.log("Save", { id, title, content });
  };

  return (
    <div className="app">
      <AppSidebar
        active=""
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="main">
        <EditorTopbar
          mode={mode}
          onModeChange={setMode}
          favorited={favorited}
          onToggleFavorite={() => setFavorited(!favorited)}
          privacyOpen={privacyOpen}
          onTogglePrivacy={() => setPrivacyOpen(!privacyOpen)}
          privacy={privacy}
          onSelectPrivacy={setPrivacy}
          privacyWrapRef={privacyWrapRef}
          shareUsers={shareUsers}
          onAddShareUser={addShareUser}
          onRemoveShareUser={removeShareUser}
          onExport={handleExport}
          onSave={handleSave}
        />
        <div className="editor-content-wrap">
          {mode === "edit" && <FormatToolbar />}
          <div className="editor-body">
            <MarkdownArea
              mode={mode}
              title={title}
              onTitleChange={(e) => setTitle(e.target.value)}
              content={content}
              onContentChange={(e) => setContent(e.target.value)}
            />
            <div className="note-dates">
              <span>Создано: {note.createdAt}</span>
              <span>Изменено: {note.updatedAt}</span>
            </div>
            <CommentsSection
              comments={comments}
              draft={commentDraft}
              onDraftChange={(e) => setCommentDraft(e.target.value)}
              onSend={addComment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
