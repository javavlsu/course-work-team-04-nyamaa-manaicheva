package ru.rps.notesbook.Domain.Services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRevisionRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Models.DirectoryNote;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.NoteRevision;
import ru.rps.notesbook.Domain.Models.PermissionAccess;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService implements INoteService {

    private final INoteRepository noteRepository;
    private final IUserRepository userRepository;
    private final INoteRevisionRepository noteRevisionRepository;
    private final IPermissionAccessRepository permissionAccessRepository;
    private final IDirectoryRepository directoryRepository;
    private final IDirectoryNoteRepository directoryNoteRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public List<NoteContracts.NoteResponse> GetNotesByOwnerId(UUID ownerId) {
        Map<UUID, Note> notes = new LinkedHashMap<>();

        // Notes
        for (Note note : noteRepository.GetNotesByUserId(ownerId)) {
            notes.putIfAbsent(note.GetId(), note);
        }

        List<PermissionAccess> userPermissions = permissionAccessRepository.GetPermissionAccessesByUserId(ownerId);

        // Notes с прямым PermissionAccess
        for (PermissionAccess permission : userPermissions) {
            if (permission.GetNote() == null) {
                continue;
            }
            noteRepository.GetNoteById(permission.GetNote().GetId())
                    .ifPresent(note -> notes.putIfAbsent(note.GetId(), note));
        }

        // Notes с доступом через Directory permission
        for (PermissionAccess permission : userPermissions) {
            if (permission.GetDirectory() == null) {
                continue;
            }
            directoryRepository.GetDirectoryById(permission.GetDirectory().GetId())
                    .ifPresent(directory -> {
                        for (DirectoryNote directoryNote : directoryNoteRepository.GetDirectoriesNotesByDirectoryId(directory.GetId())) {
                            noteRepository.GetNoteById(directoryNote.GetNote().GetId())
                                    .ifPresent(note -> notes.putIfAbsent(note.GetId(), note));
                        }
                    });
        }

        return notes.values().stream()
                .map(this::toResponse)
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
    public NoteContracts.NoteResponse CreateNote(UUID ownerId, NoteContracts.CreateNoteRequest request) {
        return CreateNote(UUID.randomUUID(), ownerId, request);
    }

    // Stage 7.3: Push Sync - id приходит от клиента (offline-generated), вместо UUID.randomUUID().
    // Проверка "такой id уже существует" — ответственность вызывающей стороны (PushService),
    // не этого метода — точно так же, как обычный CreateNote не проверяет дубликаты.
    @Override
    @Transactional
    public NoteContracts.NoteResponse CreateNote(UUID id, UUID ownerId, NoteContracts.CreateNoteRequest request) {
        User owner = userRepository.GetUserById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Note note = new Note(
                id,
                request.title(),
                writeContent(request.content()),
                LocalDateTime.now(),
                request.noteType(),
                request.isFavourite(),
                owner
        );

        return toResponse(noteRepository.SaveNote(note));
    }

    @Override
    @Transactional
    public NoteContracts.NoteResponse UpdateNote(UUID id, NoteContracts.UpdateNoteRequest request) {
        Note note = noteRepository.GetNoteById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        // Optimistic-locking фундамент для будущего Sync (Stage 7.0). expectedVersion необязателен -
        // старые клиенты, которые его не передают, продолжают работать как раньше.
        if (request.expectedVersion() != null && !request.expectedVersion().equals(note.GetVersion())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Resource was modified by another client (currentVersion=" + note.GetVersion() + ")");
        }

        boolean isChanging = request.title() != null || request.content() != null;

        if (isChanging) {
            NoteRevision revision = new NoteRevision(
                    UUID.randomUUID(),
                    note,
                    note.GetTitle(),
                    note.GetContent(),
                    note.GetVersion(),
                    LocalDateTime.now(),
                    note.GetOwner()
            );
            noteRevisionRepository.SaveRevision(revision);
        }

        if (request.title() != null) {
            note.ChangeTitle(request.title());
        }
        if (request.content() != null) {
            note.ChangeContent(writeContent(request.content()));
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
        DeleteNoteById(id, null);
    }

    // Stage 7.3: Push Sync - optimistic-lock проверка при удалении, аналогично UpdateNote.
    // expectedVersion == null -> проверка пропускается (обратная совместимость со старыми клиентами).
    @Override
    @Transactional
    public void DeleteNoteById(UUID id, Long expectedVersion) {
        Note note = noteRepository.GetNoteById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (expectedVersion != null && !expectedVersion.equals(note.GetVersion())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Resource was modified by another client (currentVersion=" + note.GetVersion() + ")");
        }

        note.MarkDeleted();

        noteRepository.SaveNote(note);
    }

    private String writeContent(Object content) {
        if (content == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Некорректный JSON в content заметки", e);
        }
    }

    private Object readContent(String content) {
        if (content == null) {
            return null;
        }
        try {
            return objectMapper.readValue(content, Object.class);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Некорректный JSON в content заметки", e);
        }
    }

    private NoteContracts.NoteResponse toResponse(Note n) {
        return new NoteContracts.NoteResponse(
                n.GetId(),
                n.GetTitle(),
                readContent(n.GetContent()),
                n.GetCreateDate(),
                n.GetUpdatedAt(),
                n.GetDeletedAt(),
                n.GetNoteType(),
                n.GetIsFavourite(),
                n.GetOwner().GetId(),
                n.GetVersion()
        );
    }

}