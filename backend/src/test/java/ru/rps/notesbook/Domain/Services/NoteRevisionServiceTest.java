package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.rps.notesbook.API.Contracts.NoteRevisionContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRevisionRepository;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.NoteRevision;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NoteRevisionServiceTest {

    @Mock
    private INoteRevisionRepository noteRevisionRepository;

    private NoteRevisionService noteRevisionService;

    private User owner;
    private Note note;

    @BeforeEach
    void setUp() {
        noteRevisionService = new NoteRevisionService(noteRevisionRepository);

        owner = new User(UUID.randomUUID(), "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(), "hash", RoleTypeEnum.Client);
        note = new Note(UUID.randomUUID(), "Заметка", null, LocalDateTime.now(), NoteTypeEnum.Empty, false, owner);
    }

    @Test
    void getRevisionsByNoteId_shouldReturnRevisionsInRepositoryOrder() {
        NoteRevision first = new NoteRevision(UUID.randomUUID(), note, "Версия 1", "{}", 1L, LocalDateTime.now().minusHours(2), owner);
        NoteRevision second = new NoteRevision(UUID.randomUUID(), note, "Версия 2", "{}", 2L, LocalDateTime.now().minusHours(1), owner);
        when(noteRevisionRepository.GetRevisionsByNoteId(note.GetId())).thenReturn(List.of(first, second));

        List<NoteRevisionContracts.NoteRevisionResponse> result = noteRevisionService.GetRevisionsByNoteId(note.GetId());

        assertEquals(2, result.size());
        assertEquals("Версия 1", result.get(0).title());
        assertEquals("Версия 2", result.get(1).title());
    }

    @Test
    void getRevisionById_shouldReturnRevisionData() {
        NoteRevision revision = new NoteRevision(UUID.randomUUID(), note, "Заголовок", "{\"a\":1}", 1L, LocalDateTime.now(), owner);
        when(noteRevisionRepository.GetRevisionById(revision.GetId())).thenReturn(Optional.of(revision));

        NoteRevisionContracts.NoteRevisionResponse response = noteRevisionService.GetRevisionById(revision.GetId());

        assertEquals("Заголовок", response.title());
        assertEquals(note.GetId(), response.noteId());
        assertEquals(1L, response.version());
    }

    @Test
    void getRevisionById_withUnknownId_shouldThrowException() {
        UUID id = UUID.randomUUID();
        when(noteRevisionRepository.GetRevisionById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> noteRevisionService.GetRevisionById(id));
    }

    @Test
    void getRevisionsByNoteId_withNoHistory_shouldReturnEmptyList() {
        when(noteRevisionRepository.GetRevisionsByNoteId(note.GetId())).thenReturn(List.of());

        assertTrue(noteRevisionService.GetRevisionsByNoteId(note.GetId()).isEmpty());
    }

}
