package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.rps.notesbook.API.Contracts.AnalyticsContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IAttachmentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICommentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Models.Attachment;
import ru.rps.notesbook.Domain.Models.Comment;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.PermissionAccess;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private INoteRepository noteRepository;
    @Mock
    private IDirectoryRepository directoryRepository;
    @Mock
    private IDirectoryNoteRepository directoryNoteRepository;
    @Mock
    private IPermissionAccessRepository permissionAccessRepository;
    @Mock
    private ICommentRepository commentRepository;
    @Mock
    private IAttachmentRepository attachmentRepository;

    private AnalyticsService analyticsService;

    private User owner;

    @BeforeEach
    void setUp() {
        analyticsService = new AnalyticsService(
                noteRepository, directoryRepository, directoryNoteRepository,
                permissionAccessRepository, commentRepository, attachmentRepository);

        owner = new User(UUID.randomUUID(), "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(), "hash", RoleTypeEnum.Client);
    }

    private Note noteOf(NoteTypeEnum type, boolean favourite, LocalDateTime createdAt) {
        return new Note(UUID.randomUUID(), "Заметка", null, createdAt, type, favourite, owner);
    }

    @Test
    void getAnalytics_withNotesCommentsAndAttachments_shouldReturnAggregatedCounts() {
        Note note = noteOf(NoteTypeEnum.Empty, true, LocalDateTime.now());
        when(noteRepository.GetNotesByUserId(owner.GetId())).thenReturn(List.of(note));
        when(commentRepository.GetCommentsByNoteId(note.GetId())).thenReturn(List.of(mock(Comment.class)));
        when(attachmentRepository.GetAttachmentsByNoteId(note.GetId())).thenReturn(List.of(mock(Attachment.class)));
        when(permissionAccessRepository.GetPermissionAccessesByNoteId(note.GetId()))
                .thenReturn(List.of(mock(PermissionAccess.class)));

        AnalyticsContracts.AnalyticsResponse response = analyticsService.GetAnalytics(owner.GetId());

        assertEquals(1, response.totalNotes());
        assertEquals(1, response.favouriteNotes());
        assertEquals(1, response.sharedNotes());
        assertEquals(1, response.totalComments());
        assertEquals(1, response.totalAttachments());
    }

    @Test
    void getAnalytics_withNoNotes_shouldReturnZeroedResponse() {
        when(noteRepository.GetNotesByUserId(owner.GetId())).thenReturn(List.of());

        AnalyticsContracts.AnalyticsResponse response = analyticsService.GetAnalytics(owner.GetId());

        assertEquals(0, response.totalNotes());
        assertEquals(0, response.favouriteNotes());
        assertEquals(0, response.sharedNotes());
        assertEquals(0, response.totalDirectories());
        assertEquals(0L, (long) response.notesByType().values().stream().mapToLong(Long::longValue).sum());
    }

    @Test
    void getAnalytics_shouldGroupNotesByType() {
        Note emptyNote = noteOf(NoteTypeEnum.Empty, false, LocalDateTime.now());
        Note listNote = noteOf(NoteTypeEnum.List, false, LocalDateTime.now());
        when(noteRepository.GetNotesByUserId(owner.GetId())).thenReturn(List.of(emptyNote, listNote));

        AnalyticsContracts.AnalyticsResponse response = analyticsService.GetAnalytics(owner.GetId());

        assertEquals(1L, response.notesByType().get(NoteTypeEnum.Empty));
        assertEquals(1L, response.notesByType().get(NoteTypeEnum.List));
    }

    @Test
    void getAnalytics_shouldBuildEightWeekBuckets() {
        Note note = noteOf(NoteTypeEnum.Empty, false, LocalDateTime.now());
        when(noteRepository.GetNotesByUserId(owner.GetId())).thenReturn(List.of(note));

        AnalyticsContracts.AnalyticsResponse response = analyticsService.GetAnalytics(owner.GetId());

        assertEquals(8, response.notesCreatedByWeek().size());
        long totalInBuckets = response.notesCreatedByWeek().stream()
                .mapToLong(AnalyticsContracts.NotesByWeekEntry::count)
                .sum();
        assertEquals(1L, totalInBuckets);
    }

    @Test
    void getAnalytics_shouldCountOnlyNotesWithActivePermissions() {
        Note sharedNote = noteOf(NoteTypeEnum.Empty, false, LocalDateTime.now());
        Note privateNote = noteOf(NoteTypeEnum.Empty, false, LocalDateTime.now());
        when(noteRepository.GetNotesByUserId(owner.GetId())).thenReturn(List.of(sharedNote, privateNote));
        when(permissionAccessRepository.GetPermissionAccessesByNoteId(sharedNote.GetId()))
                .thenReturn(List.of(mock(PermissionAccess.class)));
        when(permissionAccessRepository.GetPermissionAccessesByNoteId(privateNote.GetId()))
                .thenReturn(List.of());

        AnalyticsContracts.AnalyticsResponse response = analyticsService.GetAnalytics(owner.GetId());

        assertEquals(1, response.sharedNotes());
    }

}
