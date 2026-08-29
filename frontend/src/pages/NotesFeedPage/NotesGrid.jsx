import NoteCard from "./NoteCard";

function NotesGrid({ notes, onToggle }) {
  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onToggle={onToggle} />
      ))}
    </div>
  );
}

export default NotesGrid;
