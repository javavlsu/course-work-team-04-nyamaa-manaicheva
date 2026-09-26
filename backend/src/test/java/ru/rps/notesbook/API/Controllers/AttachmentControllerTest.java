package ru.rps.notesbook.API.Controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.Domain.Interfaces.Services.IAttachmentService;
import ru.rps.notesbook.Domain.Interfaces.Services.IPermissionAccessService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttachmentControllerTest {

    @Mock
    private IAttachmentService attachmentService;
    @Mock
    private IPermissionAccessService permissionAccessService;

    private AttachmentController controller;

    private NotesbookUserPrincipal principal;
    private UUID noteId;

    @BeforeEach
    void setUp() {
        controller = new AttachmentController(attachmentService, permissionAccessService);
        noteId = UUID.randomUUID();
        principal = new NotesbookUserPrincipal(UUID.randomUUID(), "user@example.com", "hash", List.of());
    }

    @Test
    void uploadAttachment_withEmptyFile_shouldThrowBadRequest() {
        when(permissionAccessService.canEditNote(any(), any())).thenReturn(true);
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.uploadAttachment(principal, noteId, file));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(attachmentService, never()).UploadAttachment(any(), any(), any(), any(), anyLong(), any());
    }

    @Test
    void uploadAttachment_exceedingSizeLimit_shouldThrowPayloadTooLarge() {
        when(permissionAccessService.canEditNote(any(), any())).thenReturn(true);
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(21L * 1024 * 1024);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.uploadAttachment(principal, noteId, file));
        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, ex.getStatusCode());
        verify(attachmentService, never()).UploadAttachment(any(), any(), any(), any(), anyLong(), any());
    }

}
