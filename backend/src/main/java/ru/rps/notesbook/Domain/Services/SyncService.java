package ru.rps.notesbook.Domain.Services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import ru.rps.notesbook.API.Contracts.DirectoryContracts;
import ru.rps.notesbook.API.Contracts.DirectoryNoteContracts;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.API.Contracts.SyncContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.ISyncService;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Domain.Models.DirectoryNote;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.PermissionAccess;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SyncService implements ISyncService {

    private final INoteRepository noteRepository;
    private final IDirectoryRepository directoryRepository;
    private final IDirectoryNoteRepository directoryNoteRepository;
    private final IPermissionAccessRepository permissionAccessRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public SyncContracts.SyncResponse Sync(UUID userId, SyncContracts.SyncRequest request) {

        LocalDateTime syncAt = LocalDateTime.now();

        LocalDateTime lastSyncAt = request.lastSyncAt() != null ? request.lastSyncAt() : LocalDateTime.MIN;

        List<PermissionAccess> userPermissions = permissionAccessRepository.GetPermissionAccessesByUserId(userId);

        Set<UUID> directPermissionNoteIds = new LinkedHashSet<>();
        Set<UUID> permittedDirectoryIds = new LinkedHashSet<>();
        for (PermissionAccess permission : userPermissions) {
            if (permission.GetNote() != null) {
                directPermissionNoteIds.add(permission.GetNote().GetId());
            }
            if (permission.GetDirectory() != null) {
                permittedDirectoryIds.add(permission.GetDirectory().GetId());
            }
        }

        List<Directory> ownedDirectories = directoryRepository.GetDirectoriesByOwnerId(userId);
        Set<UUID> ownedDirectoryIds = new LinkedHashSet<>();
        for (Directory directory : ownedDirectories) {
            ownedDirectoryIds.add(directory.GetId());
        }

        Set<UUID> relevantDirectoryIds = new LinkedHashSet<>();
        relevantDirectoryIds.addAll(permittedDirectoryIds);
        relevantDirectoryIds.addAll(ownedDirectoryIds);

        Set<UUID> viaDirectoryNoteIds = new LinkedHashSet<>();
        for (UUID directoryId : relevantDirectoryIds) {
            for (DirectoryNote directoryNote : directoryNoteRepository.GetDirectoriesNotesByDirectoryId(directoryId)) {
                viaDirectoryNoteIds.add(directoryNote.GetNote().GetId());
            }
        }

        List<Note> changedNotes = noteRepository.GetNotesUpdatedAfter(lastSyncAt);
        List<Directory> changedDirectories = directoryRepository.GetDirectoriesUpdatedAfter(lastSyncAt);
        List<DirectoryNote> changedLinks = directoryNoteRepository.GetDirectoryNotesAddedAfter(lastSyncAt);

        List<NoteContracts.NoteResponse> visibleNotes = changedNotes.stream()
                .filter(note ->
                        note.GetOwner().GetId().equals(userId)
                                || directPermissionNoteIds.contains(note.GetId())
                                || viaDirectoryNoteIds.contains(note.GetId()))
                .map(this::toNoteResponse)
                .toList();

        List<DirectoryContracts.DirectoryResponse> visibleDirectories = changedDirectories.stream()
                .filter(directory ->
                        directory.GetOwner().GetId().equals(userId)
                                || permittedDirectoryIds.contains(directory.GetId()))
                .map(SyncService::toDirectoryResponse)
                .toList();

        List<DirectoryNoteContracts.DirectoryNoteSyncResponse> visibleLinks = changedLinks.stream()
                .filter(directoryNote -> relevantDirectoryIds.contains(directoryNote.GetDirectory().GetId()))
                .map(SyncService::toDirectoryNoteSyncResponse)
                .toList();

        Set<UUID> accessibleNoteIds = new LinkedHashSet<>();
        for (Note note : noteRepository.GetNotesByUserId(userId)) {
            accessibleNoteIds.add(note.GetId());
        }
        for (PermissionAccess permission : userPermissions) {
            if (permission.GetNote() == null) {
                continue;
            }
            noteRepository.GetNoteById(permission.GetNote().GetId())
                    .ifPresent(note -> accessibleNoteIds.add(note.GetId()));
        }
        for (UUID directoryId : relevantDirectoryIds) {
            directoryRepository.GetDirectoryById(directoryId).ifPresent(directory -> {
                for (DirectoryNote directoryNote : directoryNoteRepository.GetDirectoriesNotesByDirectoryId(directoryId)) {
                    noteRepository.GetNoteById(directoryNote.GetNote().GetId())
                            .ifPresent(note -> accessibleNoteIds.add(note.GetId()));
                }
            });
        }

        Set<UUID> accessibleDirectoryIds = new LinkedHashSet<>(ownedDirectoryIds);
        for (UUID directoryId : permittedDirectoryIds) {
            directoryRepository.GetDirectoryById(directoryId)
                    .ifPresent(directory -> accessibleDirectoryIds.add(directory.GetId()));
        }

        return new SyncContracts.SyncResponse(
                syncAt,
                visibleNotes,
                visibleDirectories,
                visibleLinks,
                accessibleNoteIds.stream().toList(),
                accessibleDirectoryIds.stream().toList()
        );
    }

    // Helpers

    private NoteContracts.NoteResponse toNoteResponse(Note n) {
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

    private static DirectoryContracts.DirectoryResponse toDirectoryResponse(Directory d) {
        return new DirectoryContracts.DirectoryResponse(
                d.GetId(),
                d.GetTitle(),
                d.GetCreatedDate(),
                d.GetOwner().GetId(),
                d.GetUpdatedAt(),
                d.GetDeletedAt(),
                d.GetVersion()
        );
    }

    private static DirectoryNoteContracts.DirectoryNoteSyncResponse toDirectoryNoteSyncResponse(DirectoryNote dn) {
        return new DirectoryNoteContracts.DirectoryNoteSyncResponse(
                dn.GetNote().GetId(),
                dn.GetDirectory().GetId(),
                dn.GetAddedAt()
        );
    }

}