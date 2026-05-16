package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService implements INoteService {

    private final INoteRepository noteRepository;
    private final IUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NoteContracts.NoteResponse> GetNotesByOwnerId(UUID ownerId) {
        return noteRepository.GetNotesByUserId(ownerId).stream()
                .map(NoteService::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public NoteContracts.NoteResponse GetNoteById(UUID id) {
        return toResponse(noteRepository.GetNoteById(id)
                .orElseThrow(() -> new RuntimeException("Note not found")));
    }

    @Override
    @Transactional
    public NoteContracts.NoteResponse CreateNote(UUID ownerId, String title, String content, NoteTypeEnum noteType, boolean isFavourite) {
        User owner = userRepository.GetUserById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Note note = new Note(
                UUID.randomUUID(),
                title,
                content,
                LocalDateTime.now(),
                noteType,
                isFavourite,
                owner
        );
        return toResponse(noteRepository.SaveNote(note));
    }

    @Override
    @Transactional
    public NoteContracts.NoteResponse UpdateNote(UUID id, NoteContracts.UpdateNoteRequest request) {
        Note note = noteRepository.GetNoteById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (request.title() != null) {
            note.ChangeTitle(request.title());
        }
        if (request.content() != null) {
            note.ChangeContent(request.content());
        }

        return toResponse(noteRepository.SaveNote(note));
    }

    @Override
    @Transactional
    public NoteContracts.NoteResponse favouriteChangeNote(UUID id) {
        Note note = noteRepository.GetNoteById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        note.ChangeIsFavourite(!note.GetIsFavourite());

        return toResponse(noteRepository.SaveNote(note));
    }

    @Override
    @Transactional
    public void DeleteNoteById(UUID id) {
        noteRepository.DeleteNoteById(id);
    }

    private static NoteContracts.NoteResponse toResponse(Note n) {
        return new NoteContracts.NoteResponse(
                n.GetId(),
                n.GetTitle(),
                n.GetContent(),
                n.GetCreateDate(),
                n.GetNoteType(),
                n.GetIsFavourite(),
                n.GetOwner().GetId()
        );
    }
}
