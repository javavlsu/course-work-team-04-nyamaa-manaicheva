package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.rps.notesbook.API.Contracts.DirectoryNoteContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Domain.Models.DirectoryNote;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DirectoryNoteServiceTest {

    @Mock
    private IDirectoryNoteRepository directoryNoteRepository;
    @Mock
    private INoteRepository noteRepository;
    @Mock
    private IDirectoryRepository directoryRepository;

    private DirectoryNoteService directoryNoteService;

    private User owner;
    private Note note;
    private Directory directory;
    private UUID noteId;
    private UUID directoryId;

    @BeforeEach
    void setUp() {
        directoryNoteService = new DirectoryNoteService(directoryNoteRepository, noteRepository, directoryRepository);

        UUID ownerId = UUID.randomUUID();
        owner = new User(
                ownerId, "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(),
                "hashed-password", RoleTypeEnum.Client
        );

        noteId = UUID.randomUUID();
        note = new Note(noteId, "Заметка", null, LocalDateTime.now(), NoteTypeEnum.Empty, false, owner);

        directoryId = UUID.randomUUID();
        directory = new Directory(directoryId, "Папка", LocalDateTime.now(), owner);
    }

    @Test
    void addNoteToDirectory_shouldCreateLink() {
        when(noteRepository.GetNoteById(noteId)).thenReturn(Optional.of(note));
        when(directoryRepository.GetDirectoryById(directoryId)).thenReturn(Optional.of(directory));
        when(directoryNoteRepository.ExistsByNoteIdAndDirectoryId(noteId, directoryId)).thenReturn(false);
        when(directoryNoteRepository.SaveDirectoryNote(any(DirectoryNote.class))).thenAnswer(inv -> inv.getArgument(0));

        DirectoryNoteContracts.DirectoryNoteResponse response = directoryNoteService.AddNoteToDirectory(
                new DirectoryNoteContracts.CreateDirectoryNoteRequest(noteId, directoryId));

        assertEquals(noteId, response.noteId());
        assertEquals(directoryId, response.directoryId());
        verify(directoryNoteRepository, times(1)).SaveDirectoryNote(any(DirectoryNote.class));
    }

    @Test
    void addNoteToDirectory_whenAlreadyLinked_shouldNotCreateDuplicate() {
        when(noteRepository.GetNoteById(noteId)).thenReturn(Optional.of(note));
        when(directoryRepository.GetDirectoryById(directoryId)).thenReturn(Optional.of(directory));
        when(directoryNoteRepository.ExistsByNoteIdAndDirectoryId(noteId, directoryId)).thenReturn(true);

        DirectoryNoteContracts.DirectoryNoteResponse response = directoryNoteService.AddNoteToDirectory(
                new DirectoryNoteContracts.CreateDirectoryNoteRequest(noteId, directoryId));

        assertEquals(noteId, response.noteId());
        assertEquals(directoryId, response.directoryId());
        verify(directoryNoteRepository, never()).SaveDirectoryNote(any());
    }

    @Test
    void addNoteToDirectory_withUnknownNote_shouldThrowException() {
        when(noteRepository.GetNoteById(noteId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> directoryNoteService.AddNoteToDirectory(
                new DirectoryNoteContracts.CreateDirectoryNoteRequest(noteId, directoryId)));
        verify(directoryNoteRepository, never()).SaveDirectoryNote(any());
    }

    @Test
    void getNotesByDirectoryId_withNoNotes_shouldReturnEmptyList() {
        when(directoryNoteRepository.GetDirectoriesNotesByDirectoryId(directoryId)).thenReturn(List.of());

        List<DirectoryNoteContracts.DirectoryNoteResponse> result =
                directoryNoteService.GetNotesByDirectoryId(directoryId);

        assertTrue(result.isEmpty());
    }

    @Test
    void removeNoteFromDirectory_withNoExistingLink_shouldNotThrow() {
        assertDoesNotThrow(() -> directoryNoteService.RemoveNoteFromDirectory(directoryId, noteId));

        verify(directoryNoteRepository, times(1))
                .DeleteDirectoryNoteByNoteIdAndDirectoryId(noteId, directoryId);
    }

}
