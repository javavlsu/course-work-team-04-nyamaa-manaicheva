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

// Stage 7.2: базовая pull-синхронизация Note/Directory/DirectoryNote.
//
// ВАЖНО: этот сервис намеренно НЕ использует PermissionAccessService.canViewNote/canEditNote/
// canViewDirectory/canEditDirectory. Эти методы внутри вызывают getActiveNoteOrThrow/
// getActiveDirectoryOrThrow, которые ищут ресурс через GetNoteById/GetDirectoryById -
// а эти репозиторные методы фильтруют deletedAt IS NULL. Для soft-deleted ресурса это
// означает 404 вместо ответа true/false, что ломает сценарий "вернуть tombstone удалённого
// ресурса тому, у кого раньше был к нему доступ" (см. Stage 7.2 audit).
//
// Вместо этого доступ вычисляется один раз через bulk ID-множества (шаги 2-5 ниже),
// построенные из тех же источников (own / direct PermissionAccess / via Directory
// PermissionAccess), что и существующая логика в NoteService.GetNotesByOwnerId /
// DirectoryService.GetDirectoriesByOwnerId / PermissionAccessService - просто в виде
// множеств ID, а не point-lookup. Сама модель прав доступа не меняется и не дублируется -
// используются те же repository-методы.
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

        // Шаг 1: syncAt захватывается ДО любых запросов к БД, чтобы не потерять изменения,
        // которые произойдут прямо во время обработки этого запроса (см. Stage 7.2 audit,
        // раздел "Timestamp strategy"). Возможное следствие - запись попадёт в этот И в
        // следующий sync повторно, это безопасно (клиент просто перезапишет тем же значением).
        LocalDateTime syncAt = LocalDateTime.now();

        // lastSyncAt == null -> первый sync, эквивалент "с начала времён".
        LocalDateTime lastSyncAt = request.lastSyncAt() != null ? request.lastSyncAt() : LocalDateTime.MIN;

        // Шаг 2: PermissionAccess пользователя - один запрос, дальше работаем в памяти.
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

        // Шаг 3: собственные directories пользователя (метод уже фильтрует deletedAt IS NULL -
        // это нормально: собственная удалённая Directory не должна открывать доступ к тому,
        // что в ней когда-то лежало, через directory-traversal ниже).
        List<Directory> ownedDirectories = directoryRepository.GetDirectoriesByOwnerId(userId);
        Set<UUID> ownedDirectoryIds = new LinkedHashSet<>();
        for (Directory directory : ownedDirectories) {
            ownedDirectoryIds.add(directory.GetId());
        }

        // Шаг 4: relevant directories = permitted (raw, из PermissionAccess) + owned (active-only).
        Set<UUID> relevantDirectoryIds = new LinkedHashSet<>();
        relevantDirectoryIds.addAll(permittedDirectoryIds);
        relevantDirectoryIds.addAll(ownedDirectoryIds);

        // Шаг 5: Notes, доступные через directories, - без повторной проверки активности Note
        // (в отличие от GetNotesByOwnerId). N+1 здесь осознанно допустим для учебного проекта.
        Set<UUID> viaDirectoryNoteIds = new LinkedHashSet<>();
        for (UUID directoryId : relevantDirectoryIds) {
            for (DirectoryNote directoryNote : directoryNoteRepository.GetDirectoriesNotesByDirectoryId(directoryId)) {
                viaDirectoryNoteIds.add(directoryNote.GetNote().GetId());
            }
        }

        // Шаг 6: дельта изменений. GetNotesUpdatedAfter/GetDirectoriesUpdatedAfter НЕ фильтруют
        // soft-deleted ресурсы - удалённые Note/Directory попадут сюда как tombstone
        // (deletedAt != null, updatedAt > lastSyncAt).
        List<Note> changedNotes = noteRepository.GetNotesUpdatedAfter(lastSyncAt);
        List<Directory> changedDirectories = directoryRepository.GetDirectoriesUpdatedAfter(lastSyncAt);
        List<DirectoryNote> changedLinks = directoryNoteRepository.GetDirectoryNotesAddedAfter(lastSyncAt);

        // Фильтрация доступа по заранее построенным множествам (без canViewNote/canViewDirectory).
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

        // Accessible IDs: полный текущий снимок (не дельта) - для revoke detection на клиенте.
        // Зеркалит существующий паттерн NoteService.GetNotesByOwnerId/DirectoryService.GetDirectoriesByOwnerId
        // (own + direct permission + via directory permission, все проверки - active-only),
        // но собирает только ID, без полного маппинга в Response.
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
            // Directory могла быть soft-deleted к текущему моменту - тогда её уже не должно быть
            // в "текущем доступном наборе" (в отличие от viaDirectoryNoteIds выше, который
            // используется только для фильтрации дельты, где мы намеренно не проверяем активность).
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

    // ===================== Mapping helpers =====================
    // Небольшие локальные mapper-хелперы, зеркалящие toResponse() из NoteService/DirectoryService/
    // DirectoryNoteContracts - переиспользовать сами приватные методы других сервисов нельзя
    // (они private), а выносить общий mapping-слой ради Sync - лишний рефакторинг для этого этапа.

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
