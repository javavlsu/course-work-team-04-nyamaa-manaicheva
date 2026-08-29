import { useNavigate } from "react-router-dom";

import { StarIcon } from "./icons";

function NoteCard({ note, onToggle }) {
  const navigate = useNavigate();

  return (
    <div
      className="note-card"
      data-folder={note.folder}
      onClick={() => navigate(`/notes/${note.id}`)}
    >
      <div className="note-card-header">
        <span className="note-card-title">{note.title}</span>
        <StarIcon
          filled={note.favorited}
          className={`note-card-star${note.favorited ? " favorited" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(note.id);
          }}
        />
      </div>
      <p className="note-card-preview">{note.excerpt}</p>
      <div className="note-card-footer">
        <span className="note-card-meta">{note.createdAt}</span>
        <span className="note-card-tag">{note.tag}</span>
        {note.avatars && (
          <div className="note-card-avatars">
            {note.avatars.map((initials) => (
              <div className="avatar-sm" key={initials}>
                {initials}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteCard;
