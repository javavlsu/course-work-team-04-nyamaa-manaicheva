import NoteCard from "./NoteCard";

function NotesGrid({ notes, folders, onToggle, onMove, onRemove, onCreateAndMove, onDelete }) {
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
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default NotesGrid;
