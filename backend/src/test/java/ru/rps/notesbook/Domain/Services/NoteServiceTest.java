package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IAttachmentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICommentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRevisionRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteTagRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;
import ru.rps.notesbook.Domain.Models.Attachment;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.NoteRevision;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Юнит-тесты для {@link NoteService}.
 * Соответствует пунктам 1-14 чек-листа, раздел "Сервис NoteService" (клиентский модуль).
 */
@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock
    private INoteRepository noteRepository;
    @Mock
    private IUserRepository userRepository;
    @Mock
    private INoteRevisionRepository noteRevisionRepository;
    @Mock
    private IPermissionAccessRepository permissionAccessRepository;
    @Mock
    private IDirectoryRepository directoryRepository;
    @Mock
    private IDirectoryNoteRepository directoryNoteRepository;
    @Mock
    private INoteTagRepository noteTagRepository;
    @Mock
    private ICommentRepository commentRepository;
    @Mock
    private IAttachmentRepository attachmentRepository;
    @Mock
    private IFileStorageService fileStorageService;

    private NoteService noteService;

    private User owner;
    private UUID ownerId;

    @BeforeEach
    void setUp() {
        noteService = new NoteService(
                noteRepository,
                userRepository,
                noteRevisionRepository,
                permissionAccessRepository,
                directoryRepository,
                directoryNoteRepository,
                noteTagRepository,
                commentRepository,
                attachmentRepository,
                fileStorageService
        );

        ownerId = UUID.randomUUID();
        owner = new User(
                ownerId, "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(),
                "hashed-password", RoleTypeEnum.Client
        );
    }

    private Note existingNote(UUID id, LocalDateTime updatedAt, Long version) {
        return new Note(
                id, "Заголовок", "{\"text\":\"старое содержимое\"}",
                updatedAt.minusDays(1), updatedAt, null,
                NoteTypeEnum.Empty, false, owner, version
        );
    }

    // 1. Создание новой заметки с корректными данными
    @Test
    void createNote_withValidData_shouldCreateNote() {
        when(userRepository.GetUserById(ownerId)).thenReturn(Optional.of(owner));
        when(noteRepository.SaveNote(any(Note.class))).thenAnswer(inv -> inv.getArgument(0));

        NoteContracts.CreateNoteRequest request = new NoteContracts.CreateNoteRequest(
                "Моя первая заметка", "{\"text\":\"привет\"}", NoteTypeEnum.Empty, false
        );

        NoteContracts.NoteResponse response = noteService.CreateNote(ownerId, request);

        assertNotNull(response.id());
        assertEquals("Моя первая заметка", response.title());
        assertEquals(NoteTypeEnum.Empty, response.noteType());
        assertFalse(response.isFavourite());
        assertEquals(ownerId, response.ownerId());
        verify(noteRepository, times(1)).SaveNote(any(Note.class));
    }

    // 2. Создание заметки с некорректным JSON в поле content
    @Test
    void createNote_withUnserializableContent_shouldThrowBadRequest() {
        when(userRepository.GetUserById(ownerId)).thenReturn(Optional.of(owner));

        NoteContracts.CreateNoteRequest request = new NoteContracts.CreateNoteRequest(
                "Заметка", new CyclicContent(), NoteTypeEnum.Empty, false
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> noteService.CreateNote(ownerId, request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(noteRepository, never()).SaveNote(any());
    }

    // Вспомогательный класс с самоссылкой — Jackson не может сериализовать такой объект
    private static final class CyclicContent {
        @SuppressWarnings("unused")
        public CyclicContent self = this;
    }

    // 3. Получение списка заметок с фильтрацией (тип/избранное/поиск) и пагинацией
    @Test
    void getNotesByOwnerId_withFilters_shouldReturnFilteredList() {
        LocalDateTime now = LocalDateTime.now();
        Note matching = new Note(UUID.randomUUID(), "Рабочие задачи", null,
                now, now, null, NoteTypeEnum.List, true, owner, 1L);
        Note nonMatchingType = new Note(UUID.randomUUID(), "Список покупок", null,
                now, now, null, NoteTypeEnum.Empty, true, owner, 1L);
        Note nonMatchingFavourite = new Note(UUID.randomUUID(), "Рабочий план", null,
                now, now, null, NoteTypeEnum.List, false, owner, 1L);

        when(noteRepository.GetNotesByUserId(ownerId))
                .thenReturn(List.of(matching, nonMatchingType, nonMatchingFavourite));
        when(permissionAccessRepository.GetPermissionAccessesByUserId(ownerId))
                .thenReturn(List.of());

        NoteContracts.NotePageResponse page = noteService.GetNotesByOwnerId(
                ownerId, "рабочие", NoteTypeEnum.List, true, null, null, null, null);

        assertEquals(1, page.items().size());
        assertEquals(matching.GetId(), page.items().get(0).id());
    }

    // 4. Получение списка заметок с недопустимым значением order
    @Test
    void getNotesByOwnerId_withInvalidOrder_shouldThrowBadRequest() {
        when(noteRepository.GetNotesByUserId(ownerId)).thenReturn(List.of());
        when(permissionAccessRepository.GetPermissionAccessesByUserId(ownerId)).thenReturn(List.of());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> noteService.GetNotesByOwnerId(
                        ownerId, null, null, null, null, null, null, "sideways"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    // 5. Запрос списка заметок с limit больше максимально допустимого значения
    @Test
    void getNotesByOwnerId_withLimitAboveMax_shouldNormalizeLimit() {
        LocalDateTime now = LocalDateTime.now();
        List<Note> notes = new java.util.ArrayList<>();
        for (int i = 0; i < 150; i++) {
            notes.add(new Note(UUID.randomUUID(), "Заметка " + i, null,
                    now.minusMinutes(i), now.minusMinutes(i), null,
                    NoteTypeEnum.Empty, false, owner, 1L));
        }
        when(noteRepository.GetNotesByUserId(ownerId)).thenReturn(notes);
        when(permissionAccessRepository.GetPermissionAccessesByUserId(ownerId)).thenReturn(List.of());

        // 500 явно превышает PageCursor.MAX_LIMIT (100) — сервис должен молча ограничить размер страницы
        NoteContracts.NotePageResponse page = noteService.GetNotesByOwnerId(
                ownerId, null, null, null, 500, null, null, null);

        assertEquals(100, page.items().size());
        assertTrue(page.hasMore());
    }

    // 6. Получение заметки по несуществующему ID
    @Test
    void getNoteById_withUnknownId_shouldThrowException() {
        UUID noteId = UUID.randomUUID();
        when(noteRepository.GetNoteById(noteId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> noteService.GetNoteById(noteId));
    }

    // 7. Обновление заголовка/содержимого заметки
    @Test
    void updateNote_shouldCreateRevisionAndUpdateNote() {
        UUID noteId = UUID.randomUUID();
        LocalDateTime updatedAt = LocalDateTime.now();
        Note note = existingNote(noteId, updatedAt, 1L);

        when(noteRepository.GetNoteById(noteId)).thenReturn(Optional.of(note));
        when(noteRepository.SaveNote(any(Note.class))).thenAnswer(inv -> inv.getArgument(0));

        NoteContracts.UpdateNoteRequest request =
                new NoteContracts.UpdateNoteRequest("Новый заголовок", "{\"text\":\"новое\"}", null);

        NoteContracts.NoteResponse response = noteService.UpdateNote(noteId, request);

        assertEquals("Новый заголовок", response.title());

        org.mockito.ArgumentCaptor<NoteRevision> captor =
                org.mockito.ArgumentCaptor.forClass(NoteRevision.class);
        verify(noteRevisionRepository, times(1)).SaveRevision(captor.capture());
        assertEquals("Заголовок", captor.getValue().GetTitle());
        assertEquals(1L, captor.getValue().GetVersion());
    }

    // 8. Обновление заметки с устаревшим expectedVersion
    @Test
    void updateNote_withStaleVersion_shouldThrowConflict() {
        UUID noteId = UUID.randomUUID();
        Note note = existingNote(noteId, LocalDateTime.now(), 3L);
        when(noteRepository.GetNoteById(noteId)).thenReturn(Optional.of(note));

        NoteContracts.UpdateNoteRequest request =
                new NoteContracts.UpdateNoteRequest("Заголовок 2", null, 1L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> noteService.UpdateNote(noteId, request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(noteRepository, never()).SaveNote(any());
    }

    // 9. Перемещение заметки в корзину и её отображение в списке корзины
    @Test
    void deleteAndListTrash_shouldMarkNoteDeletedAndAppearInTrash() {
        UUID noteId = UUID.randomUUID();
        Note note = existingNote(noteId, LocalDateTime.now(), 1L);
        when(noteRepository.GetNoteById(noteId)).thenReturn(Optional.of(note));
        when(noteRepository.SaveNote(any(Note.class))).thenAnswer(inv -> inv.getArgument(0));

        noteService.DeleteNoteById(noteId);

        assertNotNull(note.GetDeletedAt());

        when(noteRepository.GetDeletedNotesByOwnerId(ownerId)).thenReturn(List.of(note));
        List<NoteContracts.NoteResponse> trash = noteService.GetTrashByOwnerId(ownerId);

        assertEquals(1, trash.size());
        assertEquals(noteId, trash.get(0).id());
    }

    // 10. Удаление заметки (перемещение в корзину) с устаревшим expectedVersion
    @Test
    void deleteNoteById_withStaleVersion_shouldThrowConflict() {
        UUID noteId = UUID.randomUUID();
        Note note = existingNote(noteId, LocalDateTime.now(), 5L);
        when(noteRepository.GetNoteById(noteId)).thenReturn(Optional.of(note));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> noteService.DeleteNoteById(noteId, 4L));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(noteRepository, never()).SaveNote(any());
    }

    // 11. Получение пустой корзины (нет удалённых заметок)
    @Test
    void getTrashByOwnerId_withNoDeletedNotes_shouldReturnEmptyList() {
        when(noteRepository.GetDeletedNotesByOwnerId(ownerId)).thenReturn(List.of());

        List<NoteContracts.NoteResponse> trash = noteService.GetTrashByOwnerId(ownerId);

        assertTrue(trash.isEmpty());
    }

    // 12. Восстановление заметки из корзины не владельцем
    @Test
    void restoreNoteById_byNonOwner_shouldThrowForbidden() {
        UUID noteId = UUID.randomUUID();
        Note note = existingNote(noteId, LocalDateTime.now(), 1L);
        note.MarkDeleted();
        when(noteRepository.GetDeletedNoteById(noteId)).thenReturn(Optional.of(note));

        UUID otherUserId = UUID.randomUUID();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> noteService.RestoreNoteById(noteId, otherUserId));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    // 13. Полное удаление (purge) заметки владельцем
    @Test
    void purgeNoteById_byOwner_shouldDeleteAllRelatedData() {
        UUID noteId = UUID.randomUUID();
        Note note = existingNote(noteId, LocalDateTime.now(), 1L);
        note.MarkDeleted();
        when(noteRepository.GetDeletedNoteById(noteId)).thenReturn(Optional.of(note));

        Attachment attachment = new Attachment(
                UUID.randomUUID(), note, "file.png", "image/png", 100L,
                "attachments/" + noteId + "/att1", LocalDateTime.now(), owner
        );
        when(attachmentRepository.GetAttachmentsByNoteId(noteId)).thenReturn(List.of(attachment));

        noteService.PurgeNoteById(noteId, ownerId);

        verify(commentRepository, times(1)).DeleteCommentsByNoteId(noteId);
        verify(noteRevisionRepository, times(1)).DeleteRevisionsByNoteId(noteId);
        verify(noteTagRepository, times(1)).DeleteNoteTagByNoteId(noteId);
        verify(directoryNoteRepository, times(1)).DeleteDirectoryNoteByNoteId(noteId);
        verify(attachmentRepository, times(1)).DeleteAttachmentsByNoteId(noteId);
        verify(permissionAccessRepository, times(1)).DeletePermissionAccessByNoteId(noteId);
        verify(noteRepository, times(1)).DeleteNoteById(noteId);
        verify(fileStorageService, times(1)).Delete(attachment.GetStorageKey());
    }

    // 14. Полное удаление (purge) заметки пользователем, не являющимся владельцем
    @Test
    void purgeNoteById_byNonOwner_shouldThrowForbidden() {
        UUID noteId = UUID.randomUUID();
        Note note = existingNote(noteId, LocalDateTime.now(), 1L);
        note.MarkDeleted();
        when(noteRepository.GetDeletedNoteById(noteId)).thenReturn(Optional.of(note));

        UUID otherUserId = UUID.randomUUID();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> noteService.PurgeNoteById(noteId, otherUserId));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(noteRepository, never()).DeleteNoteById(any());
    }

}
