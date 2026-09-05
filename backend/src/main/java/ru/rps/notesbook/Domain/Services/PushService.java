package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.DirectoryContracts;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.API.Contracts.PushContracts.DirectoryPushOperation;
import ru.rps.notesbook.API.Contracts.PushContracts.NotePushOperation;
import ru.rps.notesbook.API.Contracts.PushContracts.PushOperationResult;
import ru.rps.notesbook.API.Contracts.PushContracts.PushRequest;
import ru.rps.notesbook.API.Contracts.PushContracts.PushResourceType;
import ru.rps.notesbook.API.Contracts.PushContracts.PushResponse;
import ru.rps.notesbook.API.Contracts.PushContracts.PushResultStatus;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Interfaces.Services.IPermissionAccessService;
import ru.rps.notesbook.Domain.Interfaces.Services.IPushService;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PushService implements IPushService {

    private final INoteService noteService;
    private final IDirectoryService directoryService;
    private final IPermissionAccessService permissionAccessService;

    @Override
    public PushResponse Push(UUID userId, PushRequest request) {
        List<PushOperationResult> results = new ArrayList<>();

        if (request.notes() != null) {
            for (NotePushOperation op : request.notes()) {
                results.add(applyNoteOperation(userId, op));
            }
        }
        if (request.directories() != null) {
            for (DirectoryPushOperation op : request.directories()) {
                results.add(applyDirectoryOperation(userId, op));
            }
        }

        return new PushResponse(results);
    }

    // Note

    private PushOperationResult applyNoteOperation(UUID userId, NotePushOperation op) {
        try {
            return switch (op.op()) {
                case CREATE -> createNote(userId, op);
                case UPDATE -> updateNote(userId, op);
                case DELETE -> deleteNote(userId, op);
            };
        } catch (RuntimeException e) {
            return new PushOperationResult(PushResourceType.NOTE, op.id(), PushResultStatus.ERROR, null, e.getMessage());
        }
    }

    private PushOperationResult createNote(UUID userId, NotePushOperation op) {
        boolean exists;
        Long existingVersion = null;
        try {
            existingVersion = noteService.GetNoteById(op.id()).version();
            exists = true;
        } catch (RuntimeException e) {
            exists = false;
        }
        if (exists) {
            return new PushOperationResult(PushResourceType.NOTE, op.id(), PushResultStatus.CONFLICT, existingVersion,
                    "Note с таким id уже существует");
        }

        NoteContracts.CreateNoteRequest createRequest = new NoteContracts.CreateNoteRequest(
                op.title(), op.content(), op.noteType(), op.isFavourite()
        );
        noteService.CreateNote(op.id(), userId, createRequest);

        return new PushOperationResult(PushResourceType.NOTE, op.id(), PushResultStatus.OK, null, null);
    }

    private PushOperationResult updateNote(UUID userId, NotePushOperation op) {
        try {
            noteService.GetNoteById(op.id());
        } catch (RuntimeException e) {
            return new PushOperationResult(PushResourceType.NOTE, op.id(), PushResultStatus.ERROR, null, "Note not found");
        }

        if (!permissionAccessService.canEditNote(userId, op.id())) {
            return new PushOperationResult(PushResourceType.NOTE, op.id(), PushResultStatus.FORBIDDEN, null, null);
        }

        try {
            NoteContracts.UpdateNoteRequest updateRequest = new NoteContracts.UpdateNoteRequest(
                    op.title(), op.content(), op.expectedVersion()
            );
            noteService.UpdateNote(op.id(), updateRequest);
            return new PushOperationResult(PushResourceType.NOTE, op.id(), PushResultStatus.OK, null, null);
        } catch (ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                Long currentVersion = noteService.GetNoteById(op.id()).version();
                return new PushOperationResult(PushResourceType.NOTE, op.id(), PushResultStatus.CONFLICT, currentVersion, e.getReason());
            }
            throw e;
        }
    }

    private PushOperationResult deleteNote(UUID userId, NotePushOperation op) {
        NoteContracts.NoteResponse existing;
        try {
            existing = noteService.GetNoteById(op.id());
        } catch (RuntimeException e) {
            return new PushOperationResult(PushResourceType.NOTE, op.id(), PushResultStatus.ERROR, null, "Note not found");
        }

        if (!existing.ownerId().equals(userId)) {
            return new PushOperationResult(PushResourceType.NOTE, op.id(), PushResultStatus.FORBIDDEN, null, null);
        }

        try {
            noteService.DeleteNoteById(op.id(), op.expectedVersion());
            return new PushOperationResult(PushResourceType.NOTE, op.id(), PushResultStatus.OK, null, null);
        } catch (ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                Long currentVersion = noteService.GetNoteById(op.id()).version();
                return new PushOperationResult(PushResourceType.NOTE, op.id(), PushResultStatus.CONFLICT, currentVersion, e.getReason());
            }
            throw e;
        }
    }

    // Directory

    private PushOperationResult applyDirectoryOperation(UUID userId, DirectoryPushOperation op) {
        try {
            return switch (op.op()) {
                case CREATE -> createDirectory(userId, op);
                case UPDATE -> updateDirectory(userId, op);
                case DELETE -> deleteDirectory(userId, op);
            };
        } catch (RuntimeException e) {
            return new PushOperationResult(PushResourceType.DIRECTORY, op.id(), PushResultStatus.ERROR, null, e.getMessage());
        }
    }

    private PushOperationResult createDirectory(UUID userId, DirectoryPushOperation op) {
        boolean exists;
        Long existingVersion = null;
        try {
            existingVersion = directoryService.GetDirectoryById(op.id()).version();
            exists = true;
        } catch (RuntimeException e) {
            exists = false;
        }
        if (exists) {
            return new PushOperationResult(PushResourceType.DIRECTORY, op.id(), PushResultStatus.CONFLICT, existingVersion,
                    "Directory с таким id уже существует");
        }

        DirectoryContracts.CreateDirectoryRequest createRequest = new DirectoryContracts.CreateDirectoryRequest(op.title());
        directoryService.CreateDirectory(op.id(), userId, createRequest);

        return new PushOperationResult(PushResourceType.DIRECTORY, op.id(), PushResultStatus.OK, null, null);
    }

    private PushOperationResult updateDirectory(UUID userId, DirectoryPushOperation op) {
        DirectoryContracts.DirectoryResponse existing;
        try {
            existing = directoryService.GetDirectoryById(op.id());
        } catch (RuntimeException e) {
            return new PushOperationResult(PushResourceType.DIRECTORY, op.id(), PushResultStatus.ERROR, null, "Directory not found");
        }

        if (!existing.ownerId().equals(userId)) {
            return new PushOperationResult(PushResourceType.DIRECTORY, op.id(), PushResultStatus.FORBIDDEN, null, null);
        }

        try {
            DirectoryContracts.UpdateDirectoryRequest updateRequest =
                    new DirectoryContracts.UpdateDirectoryRequest(op.title(), op.expectedVersion());
            directoryService.UpdateDirectory(op.id(), updateRequest);
            return new PushOperationResult(PushResourceType.DIRECTORY, op.id(), PushResultStatus.OK, null, null);
        } catch (ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                Long currentVersion = directoryService.GetDirectoryById(op.id()).version();
                return new PushOperationResult(PushResourceType.DIRECTORY, op.id(), PushResultStatus.CONFLICT, currentVersion, e.getReason());
            }
            throw e;
        }
    }

    private PushOperationResult deleteDirectory(UUID userId, DirectoryPushOperation op) {
        DirectoryContracts.DirectoryResponse existing;
        try {
            existing = directoryService.GetDirectoryById(op.id());
        } catch (RuntimeException e) {
            return new PushOperationResult(PushResourceType.DIRECTORY, op.id(), PushResultStatus.ERROR, null, "Directory not found");
        }

        if (!existing.ownerId().equals(userId)) {
            return new PushOperationResult(PushResourceType.DIRECTORY, op.id(), PushResultStatus.FORBIDDEN, null, null);
        }

        try {
            directoryService.DeleteDirectoryById(op.id(), op.expectedVersion());
            return new PushOperationResult(PushResourceType.DIRECTORY, op.id(), PushResultStatus.OK, null, null);
        } catch (ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                Long currentVersion = directoryService.GetDirectoryById(op.id()).version();
                return new PushOperationResult(PushResourceType.DIRECTORY, op.id(), PushResultStatus.CONFLICT, currentVersion, e.getReason());
            }
            throw e;
        }
    }

}