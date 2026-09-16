package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.API.Contracts.NoteTagContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteTagRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.ITagRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteTagService;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.NoteTag;
import ru.rps.notesbook.Domain.Models.Tag;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteTagService implements INoteTagService {

    private final INoteTagRepository noteTagRepository;
    private final INoteRepository noteRepository;
    private final ITagRepository tagRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NoteTagContracts.NoteTagResponse> GetTagsByNoteId(UUID noteId) {
        return noteTagRepository.GetNoteTagsByNoteId(noteId).stream()
                .map(NoteTagService::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public NoteTagContracts.NoteTagResponse AddTagToNote(NoteTagContracts.CreateNoteTagRequest request) {
        Note note = noteRepository.GetNoteById(request.noteId())
                .orElseThrow(() -> new RuntimeException("Note not found"));
        Tag tag = tagRepository.GetTagById(request.tagId())
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        if (noteTagRepository.ExistsByNoteIdAndTagId(note.GetId(), tag.GetId())) {
            return new NoteTagContracts.NoteTagResponse(note.GetId(), tag.GetId());
        }

        NoteTag noteTag = new NoteTag(note, tag);

        return toResponse(noteTagRepository.SaveNoteTag(noteTag));
    }

    @Override
    @Transactional
    public void RemoveTagFromNote(UUID noteId, UUID tagId) {
        noteTagRepository.DeleteNoteTagByNoteIdAndTagId(noteId, tagId);
    }

    private static NoteTagContracts.NoteTagResponse toResponse(NoteTag nt) {
        return new NoteTagContracts.NoteTagResponse(
                nt.GetNote().GetId(),
                nt.GetTag().GetId()
        );
    }

}