package ru.rps.notesbook.API.Contracts;

import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class AnalyticsContracts {

    public record NotesByWeekEntry(
            LocalDate weekStart,
            long count
    ) {}

    public record NotesByDirectoryEntry(
            UUID directoryId,
            String title,
            long notesCount
    ) {}

    public record AnalyticsResponse(
            long totalNotes,
            long favouriteNotes,
            long sharedNotes,
            Map<NoteTypeEnum, Long> notesByType,
            List<NotesByWeekEntry> notesCreatedByWeek,
            List<NotesByDirectoryEntry> notesByDirectory,
            long totalDirectories,
            long totalComments,
            long totalAttachments
    ) {}

}
