package ru.rps.notesbook.Domain.Services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IAttachmentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICommentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRevisionRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteTagRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;
import ru.rps.notesbook.Domain.Models.Attachment;
import ru.rps.notesbook.Domain.Models.DirectoryNote;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.NoteRevision;
import ru.rps.notesbook.Domain.Models.PermissionAccess;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService implements INoteService {

    private static final Logger log = LoggerFactory.getLogger(NoteService.class);

    private final INoteRepository noteRepository;
    private final IUserRepository userRepository;
    private final INoteRevisionRepository noteRevisionRepository;
    private final IPermissionAccessRepository permissionAccessRepository;
    private final IDirectoryRepository directoryRepository;
    private final IDirectoryNoteRepository directoryNoteRepository;
    private final INoteTagRepository noteTagRepository;
    private final ICommentRepository commentRepository;
    private final IAttachmentRepository attachmentRepository;
    private final IFileStorageService fileStorageService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public NoteContracts.NotePageResponse GetNotesByOwnerId(
            UUID ownerId, String search, NoteTypeEnum noteType, Boolean isFavourite, Integer limit, String cursor
    ) {
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

        String normalizedSearch = (search != null && !search.isBlank()) ? search.trim().toLowerCase() : null;

        int pageSize = PageCursor.normalizeLimit(limit);
        PageCursor pageCursor = PageCursor.decodeOrNull(cursor);

        List<Note> page = notes.values().stream()
                .filter(note -> normalizedSearch == null || note.GetTitle().toLowerCase().contains(normalizedSearch))
                .filter(note -> noteType == null || note.GetNoteType() == noteType)
                .filter(note -> isFavourite == null || note.GetIsFavourite() == isFavourite)
                .sorted(Comparator.comparing(Note::GetUpdatedAt, Comparator.reverseOrder())
                        .thenComparing(Note::GetId, Comparator.reverseOrder()))
                .filter(note -> pageCursor == null || pageCursor.isAfter(note.GetUpdatedAt(), note.GetId()))
                .limit(pageSize + 1)
                .toList();

        boolean hasMore = page.size() > pageSize;
        List<Note> pageItems = hasMore ? page.subList(0, pageSize) : page;

        String nextCursor = hasMore
                ? PageCursor.of(pageItems.get(pageItems.size() - 1).GetUpdatedAt(), pageItems.get(pageItems.size() - 1).GetId()).encode()
                : null;

        return new NoteContracts.NotePageResponse(
                pageItems.stream().map(this::toResponse).toList(),
                nextCursor,
                hasMore
        );
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

    // for push sync only with client-generated UUID
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

    @Override
    @Transactional(readOnly = true)
    public List<NoteContracts.NoteResponse> GetTrashByOwnerId(UUID ownerId) {
        return noteRepository.GetDeletedNotesByOwnerId(ownerId).stream()
                .sorted(Comparator.comparing(Note::GetDeletedAt, Comparator.reverseOrder()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public NoteContracts.NoteResponse RestoreNoteById(UUID id, UUID ownerId) {
        Note note = noteRepository.GetDeletedNoteById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found in trash"));

        if (!note.GetOwner().GetId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Только владелец может восстановить заметку");
        }

        note.Restore();

        return toResponse(noteRepository.SaveNote(note));
    }

    @Override
    @Transactional
    public void PurgeNoteById(UUID id, UUID ownerId) {
        Note note = noteRepository.GetDeletedNoteById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found in trash"));

        if (!note.GetOwner().GetId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Только владелец может удалить заметку навсегда");
        }

        List<Attachment> attachments = attachmentRepository.GetAttachmentsByNoteId(id);

        commentRepository.DeleteCommentsByNoteId(id);
        noteRevisionRepository.DeleteRevisionsByNoteId(id);
        noteTagRepository.DeleteNoteTagByNoteId(id);
        directoryNoteRepository.DeleteDirectoryNoteByNoteId(id);
        attachmentRepository.DeleteAttachmentsByNoteId(id);
        permissionAccessRepository.DeletePermissionAccessByNoteId(id);

        noteRepository.DeleteNoteById(id);

        for (Attachment attachment : attachments) {
            try {
                fileStorageService.Delete(attachment.GetStorageKey());
            } catch (RuntimeException e) {
                log.error("Failed to delete storage object for purged note {} (key={}); DB metadata already removed",
                        id, attachment.GetStorageKey(), e);
            }
        }
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