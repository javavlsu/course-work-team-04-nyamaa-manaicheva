package ru.rps.notesbook.API.Controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.NoteRevisionContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteRevisionService;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteTagService;
import ru.rps.notesbook.Domain.Interfaces.Services.IPermissionAccessService;
import ru.rps.notesbook.Domain.Interfaces.Services.ITagService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Юнит-тест для {@link NoteController}.
 * Пункт 73 чек-листа ("ревизия не принадлежит указанной заметке") — эта сверка
 * (revision.noteId() vs {id} из URL) реализована здесь, а не в NoteRevisionService.
 */
@ExtendWith(MockitoExtension.class)
class NoteControllerTest {

    @Mock
    private INoteService noteService;
    @Mock
    private INoteRevisionService noteRevisionService;
    @Mock
    private INoteTagService noteTagService;
    @Mock
    private ITagService tagService;
    @Mock
    private IPermissionAccessService permissionAccessService;

    private NoteController controller;
    private NotesbookUserPrincipal principal;

    @BeforeEach
    void setUp() {
        controller = new NoteController(noteService, noteRevisionService, noteTagService, tagService, permissionAccessService);
        principal = new NotesbookUserPrincipal(UUID.randomUUID(), "user@example.com", "hash", List.of());
    }

    // 73. Запрос ревизии, не принадлежащей указанной заметке
    @Test
    void getRevision_notBelongingToNote_shouldThrowNotFound() {
        UUID noteId = UUID.randomUUID();
        UUID revisionId = UUID.randomUUID();
        UUID differentNoteId = UUID.randomUUID();

        when(permissionAccessService.canViewNote(any(), any())).thenReturn(true);
        NoteRevisionContracts.NoteRevisionResponse revision = new NoteRevisionContracts.NoteRevisionResponse(
                revisionId, differentNoteId, "Заголовок", null, 1L, LocalDateTime.now(), UUID.randomUUID());
        when(noteRevisionService.GetRevisionById(revisionId)).thenReturn(revision);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.getRevision(principal, noteId, revisionId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

}
