package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.API.Contracts.AnalyticsContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IAttachmentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICommentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IAnalyticsService;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Domain.Models.DirectoryNote;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.PermissionAccess;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Collection;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalyticsService implements IAnalyticsService {

    private static final int WEEKS_WINDOW = 8;

    private final INoteRepository noteRepository;
    private final IDirectoryRepository directoryRepository;
    private final IDirectoryNoteRepository directoryNoteRepository;
    private final IPermissionAccessRepository permissionAccessRepository;
    private final ICommentRepository commentRepository;
    private final IAttachmentRepository attachmentRepository;

    @Override
    @Transactional(readOnly = true)
    public AnalyticsContracts.AnalyticsResponse GetAnalytics(UUID userId) {

        Map<UUID, Note> visibleNotes = collectVisibleNotes(userId);
        Map<UUID, Directory> visibleDirectories = collectVisibleDirectories(userId);

        long totalNotes = visibleNotes.size();
        long favouriteNotes = visibleNotes.values().stream()
                .filter(Note::GetIsFavourite)
                .count();

        Map<NoteTypeEnum, Long> notesByType = new EnumMap<>(NoteTypeEnum.class);
        for (NoteTypeEnum type : NoteTypeEnum.values()) {
            notesByType.put(type, 0L);
        }
        for (Note note : visibleNotes.values()) {
            notesByType.merge(note.GetNoteType(), 1L, Long::sum);
        }

        long sharedNotes = 0;
        long totalComments = 0;
        long totalAttachments = 0;
        for (Note note : visibleNotes.values()) {
            totalComments += commentRepository.GetCommentsByNoteId(note.GetId()).size();
            totalAttachments += attachmentRepository.GetAttachmentsByNoteId(note.GetId()).size();

            if (note.GetOwner().GetId().equals(userId)) {
                List<PermissionAccess> notePermissions =
                        permissionAccessRepository.GetPermissionAccessesByNoteId(note.GetId());
                if (!notePermissions.isEmpty()) {
                    sharedNotes++;
                }
            }
        }

        List<AnalyticsContracts.NotesByWeekEntry> notesCreatedByWeek =
                buildWeeklyBuckets(visibleNotes.values());

        List<AnalyticsContracts.NotesByDirectoryEntry> notesByDirectory = visibleDirectories.values().stream()
                .map(directory -> {
                    long count = directoryNoteRepository.GetDirectoriesNotesByDirectoryId(directory.GetId())
                            .stream()
                            .filter(dn -> noteRepository.GetNoteById(dn.GetNote().GetId()).isPresent())
                            .count();
                    return new AnalyticsContracts.NotesByDirectoryEntry(
                            directory.GetId(), directory.GetTitle(), count);
                })
                .toList();

        return new AnalyticsContracts.AnalyticsResponse(
                totalNotes,
                favouriteNotes,
                sharedNotes,
                notesByType,
                notesCreatedByWeek,
                notesByDirectory,
                visibleDirectories.size(),
                totalComments,
                totalAttachments
        );
    }

    private Map<UUID, Note> collectVisibleNotes(UUID userId) {
        Map<UUID, Note> notes = new LinkedHashMap<>();

        for (Note note : noteRepository.GetNotesByUserId(userId)) {
            notes.putIfAbsent(note.GetId(), note);
        }

        List<PermissionAccess> userPermissions = permissionAccessRepository.GetPermissionAccessesByUserId(userId);

        for (PermissionAccess permission : userPermissions) {
            if (permission.GetNote() == null) {
                continue;
            }
            noteRepository.GetNoteById(permission.GetNote().GetId())
                    .ifPresent(note -> notes.putIfAbsent(note.GetId(), note));
        }

        for (PermissionAccess permission : userPermissions) {
            if (permission.GetDirectory() == null) {
                continue;
            }
            directoryRepository.GetDirectoryById(permission.GetDirectory().GetId())
                    .ifPresent(directory -> {
                        for (DirectoryNote directoryNote :
                                directoryNoteRepository.GetDirectoriesNotesByDirectoryId(directory.GetId())) {
                            noteRepository.GetNoteById(directoryNote.GetNote().GetId())
                                    .ifPresent(note -> notes.putIfAbsent(note.GetId(), note));
                        }
                    });
        }

        return notes;
    }

    private Map<UUID, Directory> collectVisibleDirectories(UUID userId) {
        Map<UUID, Directory> directories = new LinkedHashMap<>();

        for (Directory directory : directoryRepository.GetDirectoriesByOwnerId(userId)) {
            directories.putIfAbsent(directory.GetId(), directory);
        }

        for (PermissionAccess permission : permissionAccessRepository.GetPermissionAccessesByUserId(userId)) {
            if (permission.GetDirectory() == null) {
                continue;
            }
            directoryRepository.GetDirectoryById(permission.GetDirectory().GetId())
                    .ifPresent(directory -> directories.putIfAbsent(directory.GetId(), directory));
        }

        return directories;
    }

    private List<AnalyticsContracts.NotesByWeekEntry> buildWeeklyBuckets(Collection<Note> notes) {
        LocalDate currentWeekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate earliestWeekStart = currentWeekStart.minusWeeks(WEEKS_WINDOW - 1L);

        Map<LocalDate, Long> buckets = new TreeMap<>();
        for (long i = 0; i < WEEKS_WINDOW; i++) {
            buckets.put(earliestWeekStart.plusWeeks(i), 0L);
        }

        for (Note note : notes) {
            LocalDate weekStart = note.GetCreateDate().toLocalDate()
                    .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            if (!weekStart.isBefore(earliestWeekStart) && !weekStart.isAfter(currentWeekStart)) {
                buckets.merge(weekStart, 1L, Long::sum);
            }
        }

        return buckets.entrySet().stream()
                .map(e -> new AnalyticsContracts.NotesByWeekEntry(e.getKey(), e.getValue()))
                .toList();
    }

}