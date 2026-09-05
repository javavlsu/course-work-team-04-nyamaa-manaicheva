import NoteCard from "./NoteCard";

function NotesGrid({ notes, folders, onToggle, onMove, onRemove, onCreateAndMove }) {
  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          folders={folders}
          onToggle={onToggle}
          onMove={onMove}
          onRemove={onRemove}
          onCreateAndMove={onCreateAndMove}
        />
      ))}
    </div>
  );
}

export default NotesGrid;
