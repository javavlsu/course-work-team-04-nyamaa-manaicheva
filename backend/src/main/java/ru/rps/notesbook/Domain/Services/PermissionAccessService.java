package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.PermissionAccessContracts;
import ru.rps.notesbook.Domain.Enum.PermissionTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IPermissionAccessService;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Domain.Models.DirectoryNote;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.PermissionAccess;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PermissionAccessService implements IPermissionAccessService {

    private final IPermissionAccessRepository permissionAccessRepository;
    private final INoteRepository noteRepository;
    private final IDirectoryRepository directoryRepository;
    private final IDirectoryNoteRepository directoryNoteRepository;
    private final IUserRepository userRepository;

    private enum AccessLevel { NONE, VIEW, EDIT }

    // canView/canEdit

    @Override
    @Transactional(readOnly = true)
    public boolean canViewNote(UUID userId, UUID noteId) {
        Note note = getActiveNoteOrThrow(noteId);
        return resolveNoteAccessLevel(userId, note) != AccessLevel.NONE;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canEditNote(UUID userId, UUID noteId) {
        Note note = getActiveNoteOrThrow(noteId);
        return resolveNoteAccessLevel(userId, note) == AccessLevel.EDIT;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canViewDirectory(UUID userId, UUID directoryId) {
        Directory directory = getActiveDirectoryOrThrow(directoryId);
        return resolveDirectoryAccessLevel(userId, directory) != AccessLevel.NONE;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canEditDirectory(UUID userId, UUID directoryId) {
        Directory directory = getActiveDirectoryOrThrow(directoryId);
        return resolveDirectoryAccessLevel(userId, directory) == AccessLevel.EDIT;
    }

    // Access resolution

    private AccessLevel resolveNoteAccessLevel(UUID userId, Note note) {
        if (note.GetOwner().GetId().equals(userId)) {
            return AccessLevel.EDIT;
        }

        AccessLevel level = permissionAccessRepository.GetPermissionAccessByUserIdAndNoteId(userId, note.GetId())
                .map(p -> toLevel(p.GetAccessType()))
                .orElse(AccessLevel.NONE);

        if (level == AccessLevel.EDIT) {
            return level;
        }

        List<DirectoryNote> directoryNotes = directoryNoteRepository.GetDirectoriesNotesByNoteId(note.GetId());
        for (DirectoryNote directoryNote : directoryNotes) {
            Optional<Directory> activeDirectory = directoryRepository.GetDirectoryById(directoryNote.GetDirectory().GetId());
            if (activeDirectory.isEmpty()) {
                continue;
            }

            AccessLevel viaDirectory = resolveDirectoryAccessLevel(userId, activeDirectory.get());
            level = max(level, viaDirectory);

            if (level == AccessLevel.EDIT) {
                break;
            }
        }

        return level;
    }

    private AccessLevel resolveDirectoryAccessLevel(UUID userId, Directory directory) {
        if (directory.GetOwner().GetId().equals(userId)) {
            return AccessLevel.EDIT;
        }

        return permissionAccessRepository.GetPermissionAccessByUserIdAndDirectoryId(userId, directory.GetId())
                .map(p -> toLevel(p.GetAccessType()))
                .orElse(AccessLevel.NONE);
    }

    private static AccessLevel toLevel(PermissionTypeEnum type) {
        return switch (type) {
            case View -> AccessLevel.VIEW;
            case Edit -> AccessLevel.EDIT;
        };
    }

    private static AccessLevel max(AccessLevel a, AccessLevel b) {
        return a.ordinal() >= b.ordinal() ? a : b;
    }

    // Grant / Update / Revoke / List

    @Override
    @Transactional
    public PermissionAccessContracts.PermissionAccessResponse GrantPermission(
            UUID currentUserId, PermissionAccessContracts.CreatePermissionAccessRequest request) {

        validateExactlyOneResource(request.noteId(), request.directoryId());

        Note note = null;
        Directory directory = null;
        User owner;

        if (request.noteId() != null) {
            note = getActiveNoteOrThrow(request.noteId());
            owner = note.GetOwner();
        } else {
            directory = getActiveDirectoryOrThrow(request.directoryId());
            owner = directory.GetOwner();
        }

        if (!owner.GetId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Только владелец ресурса может выдавать доступ");
        }

        if (request.userId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId обязателен");
        }

        if (request.userId().equals(currentUserId) || request.userId().equals(owner.GetId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Нельзя выдать permission владельцу или самому себе");
        }

        User targetUser = userRepository.GetUserById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));

        Optional<PermissionAccess> existing = note != null
                ? permissionAccessRepository.GetPermissionAccessByUserIdAndNoteId(targetUser.GetId(), note.GetId())
                : permissionAccessRepository.GetPermissionAccessByUserIdAndDirectoryId(targetUser.GetId(), directory.GetId());

        PermissionAccess saved;
        if (existing.isPresent()) {
            PermissionAccess permission = existing.get();
            permission.ChangePermissionType(request.type());
            saved = permissionAccessRepository.SavePermissionAccess(permission);
        } else {
            PermissionAccess permission = new PermissionAccess(
                    UUID.randomUUID(),
                    request.type(),
                    note,
                    targetUser,
                    directory,
                    owner,
                    LocalDateTime.now()
            );
            saved = permissionAccessRepository.SavePermissionAccess(permission);
        }

        return toResponse(saved);
    }

    @Override
    @Transactional
    public PermissionAccessContracts.PermissionAccessResponse UpdatePermission(
            UUID currentUserId, UUID id, PermissionAccessContracts.UpdatePermissionAccessRequest request) {

        PermissionAccess permission = permissionAccessRepository.GetPermissionAccessById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission не найден"));

        requireResourceOwner(currentUserId, permission);

        permission.ChangePermissionType(request.type());
        PermissionAccess saved = permissionAccessRepository.SavePermissionAccess(permission);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void RevokePermission(UUID currentUserId, UUID id) {
        PermissionAccess permission = permissionAccessRepository.GetPermissionAccessById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission не найден"));

        requireResourceOwner(currentUserId, permission);

        permissionAccessRepository.DeletePermissionAccessById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionAccessContracts.PermissionAccessResponse> GetPermissionsByNoteId(UUID currentUserId, UUID noteId) {
        Note note = getActiveNoteOrThrow(noteId);

        if (!note.GetOwner().GetId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Только владелец может просматривать permissions");
        }

        return permissionAccessRepository.GetPermissionAccessesByNoteId(noteId).stream()
                .map(PermissionAccessService::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionAccessContracts.PermissionAccessResponse> GetPermissionsByDirectoryId(UUID currentUserId, UUID directoryId) {
        Directory directory = getActiveDirectoryOrThrow(directoryId);

        if (!directory.GetOwner().GetId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Только владелец может просматривать permissions");
        }

        return permissionAccessRepository.GetPermissionAccessesByDirectoryId(directoryId).stream()
                .map(PermissionAccessService::toResponse)
                .toList();
    }

    // Helpers

    private Note getActiveNoteOrThrow(UUID noteId) {
        return noteRepository.GetNoteById(noteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));
    }

    private Directory getActiveDirectoryOrThrow(UUID directoryId) {
        return directoryRepository.GetDirectoryById(directoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Directory not found"));
    }

    private void validateExactlyOneResource(UUID noteId, UUID directoryId) {
        boolean hasNote = noteId != null;
        boolean hasDirectory = directoryId != null;
        if (hasNote == hasDirectory) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Permission должен относиться либо к Note, либо к Directory");
        }
    }

    private void requireResourceOwner(UUID currentUserId, PermissionAccess permission) {
        UUID ownerId = permission.GetNote() != null
                ? permission.GetNote().GetOwner().GetId()
                : permission.GetDirectory().GetOwner().GetId();

        if (!ownerId.equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Только владелец ресурса может управлять permissions");
        }
    }

    private static PermissionAccessContracts.PermissionAccessResponse toResponse(PermissionAccess p) {
        return new PermissionAccessContracts.PermissionAccessResponse(
                p.GetId(),
                p.GetAccessType(),
                p.GetNote() != null ? p.GetNote().GetId() : null,
                p.GetUser().GetId(),
                p.GetDirectory() != null ? p.GetDirectory().GetId() : null
        );
    }

}