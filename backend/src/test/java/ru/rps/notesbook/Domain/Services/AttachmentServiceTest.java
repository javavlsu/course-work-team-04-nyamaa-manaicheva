package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.rps.notesbook.API.Contracts.AttachmentContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IAttachmentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;
import ru.rps.notesbook.Domain.Models.Attachment;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.User;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Юнит-тесты для {@link AttachmentService}.
 * Соответствует пунктам 51, 54, 55 чек-листа (административный модуль, "Сервис AttachmentService").
 * Пункты 52-53 (пустой файл / файл больше 20 МБ) проверяются в AttachmentControllerTest,
 * т.к. эти лимиты реализованы в AttachmentController, а не в самом сервисе.
 */
@ExtendWith(MockitoExtension.class)
class AttachmentServiceTest {

    @Mock
    private IAttachmentRepository attachmentRepository;
    @Mock
    private INoteRepository noteRepository;
    @Mock
    private IUserRepository userRepository;
    @Mock
    private IFileStorageService fileStorageService;

    private AttachmentService attachmentService;

    private User user;
    private Note note;

    @BeforeEach
    void setUp() {
        attachmentService = new AttachmentService(attachmentRepository, noteRepository, userRepository, fileStorageService);

        user = new User(UUID.randomUUID(), "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(), "hash", RoleTypeEnum.Client);
        note = new Note(UUID.randomUUID(), "Заметка", null, LocalDateTime.now(), NoteTypeEnum.Empty, false, user);
    }

    // 51. Загрузка вложения к заметке с корректным файлом
    @Test
    void uploadAttachment_withValidFile_shouldSaveMetadataAndUploadContent() {
        when(noteRepository.GetNoteById(note.GetId())).thenReturn(Optional.of(note));
        when(userRepository.GetUserById(user.GetId())).thenReturn(Optional.of(user));
        when(attachmentRepository.SaveAttachment(any(Attachment.class))).thenAnswer(inv -> inv.getArgument(0));

        AttachmentContracts.AttachmentResponse response = attachmentService.UploadAttachment(
                note.GetId(), user.GetId(), "photo.png", "image/png", 100L,
                new ByteArrayInputStream(new byte[]{1, 2, 3}));

        assertEquals("photo.png", response.fileName());
        assertEquals(note.GetId(), response.noteId());
        verify(fileStorageService, times(1)).Upload(anyString(), any(), anyLong(), anyString());
        verify(attachmentRepository, times(1)).SaveAttachment(any(Attachment.class));
    }

    // 54. Получение presigned-ссылки на скачивание существующего вложения
    @Test
    void getDownloadUrl_shouldReturnPresignedUrlWithExpiry() {
        Attachment attachment = new Attachment(UUID.randomUUID(), note, "file.pdf", "application/pdf",
                50L, "attachments/" + note.GetId() + "/a1", LocalDateTime.now(), user);
        when(attachmentRepository.GetAttachmentById(attachment.GetId())).thenReturn(Optional.of(attachment));
        when(fileStorageService.GeneratePresignedDownloadUrl(any(), any()))
                .thenReturn("https://storage.example.com/signed-url");

        AttachmentContracts.AttachmentDownloadResponse response =
                attachmentService.GetDownloadUrl(attachment.GetId());

        assertEquals("https://storage.example.com/signed-url", response.url());
        assertNotNull(response.expiresAt());
    }

    // 55. Удаление вложения (метаданные и объект в хранилище)
    @Test
    void deleteAttachmentById_shouldRemoveMetadataAndStorageObject() {
        Attachment attachment = new Attachment(UUID.randomUUID(), note, "file.pdf", "application/pdf",
                50L, "attachments/" + note.GetId() + "/a1", LocalDateTime.now(), user);
        when(attachmentRepository.GetAttachmentById(attachment.GetId())).thenReturn(Optional.of(attachment));

        attachmentService.DeleteAttachmentById(attachment.GetId());

        verify(attachmentRepository, times(1)).DeleteAttachmentById(attachment.GetId());
        verify(fileStorageService, times(1)).Delete(attachment.GetStorageKey());
    }

}
