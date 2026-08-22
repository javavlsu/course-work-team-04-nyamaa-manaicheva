package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.NoteTag;

import java.util.List;
import java.util.UUID;

@Repository
public interface INoteTagRepository {
    List<NoteTag> GetNoteTagsByNoteId(UUID noteId);
    NoteTag SaveNoteTag(NoteTag noteTag);
    void DeleteNoteTagByNoteId(UUID noteId);
    void DeleteNoteTagByTagId(UUID tagId);
}