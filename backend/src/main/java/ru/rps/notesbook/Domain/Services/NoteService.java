package ru.rps.notesbook.Domain.Services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRevisionRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.NoteRevision;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService implements INoteService {

    private final INoteRepository noteRepository;
    private final IUserRepository userRepository;
    private final INoteRevisionRepository noteRevisionRepository;
    // Spring Boot 4 + Jackson 3 автоконфигурирует бин JsonMapper, а не классический
    // com.fasterxml.jackson.databind.ObjectMapper (Jackson 2). Зарегистрирует ли конкретно
    // эта версия (4.0.3) ещё и совместимый ObjectMapper-бин параллельно — я не могу
    // проверить без реальной сборки, поэтому создаём его сами: jackson-databind (2.x)
    // гарантированно есть на classpath (это подтверждает документация Spring Boot 4 —
    // Jackson 2 и 3 сосуществуют), а new ObjectMapper() работает всегда, независимо от
    // того, что именно Spring решит зарегистрировать как бин.
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public List<NoteContracts.NoteResponse> GetNotesByOwnerId(UUID ownerId) {
        return noteRepository.GetNotesByUserId(ownerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public NoteContracts.NoteResponse GetNoteById(UUID id) {
        return toResponse(noteRepository.GetNoteById(id)
                .orElseThrow(() -> new RuntimeException("Note not found")));
    }

    @Override
    @Transactional
    public NoteContracts.NoteResponse CreateNote(UUID ownerId, NoteContracts.CreateNoteRequest request) {
        User owner = userRepository.GetUserById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Note(id, title, content, createDate, noteType, isFavourite, owner) сама проставляет
        // updatedAt = createDate, deletedAt = null; version = null, что для JPA (@Version)
        // означает "новая сущность" — Hibernate выставит version = 0 при первом сохранении.
        Note note = new Note(
                UUID.randomUUID(),
                request.title(),
                writeContent(request.content()),
                LocalDateTime.now(),
                request.noteType(),
                request.isFavourite(),
                owner
        );

        return toResponse(noteRepository.SaveNote(note));
    }

    @Override
    @Transactional
    public NoteContracts.NoteResponse UpdateNote(UUID id, NoteContracts.UpdateNoteRequest request) {
        Note note = noteRepository.GetNoteById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        boolean isChanging = request.title() != null || request.content() != null;

        // Перед применением изменений сохраняем текущее (ещё не изменённое) состояние
        // как NoteRevision — простая история изменений без conflict resolution.
        // Редактировать заметку сейчас может только её владелец (ownership проверяется
        // в Controller до вызова этого метода), поэтому createdBy = текущий owner заметки.
        if (isChanging) {
            NoteRevision revision = new NoteRevision(
                    UUID.randomUUID(),
                    note,
                    note.GetTitle(),
                    note.GetContent(),
                    note.GetVersion(),
                    LocalDateTime.now(),
                    note.GetOwner()
            );
            noteRevisionRepository.SaveRevision(revision);
        }

        // note.ChangeTitle/ChangeContent сами обновляют updatedAt; createDate и owner не трогаем.
        // version обновит Hibernate через @Version при сохранении (optimistic locking).
        if (request.title() != null) {
            note.ChangeTitle(request.title());
        }
        if (request.content() != null) {
            note.ChangeContent(writeContent(request.content()));
        }

        return toResponse(noteRepository.SaveNote(note));
    }

    @Override
    @Transactional
    public NoteContracts.NoteResponse favouriteChangeNote(UUID id) {
        Note note = noteRepository.GetNoteById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        note.ChangeIsFavourite(!note.GetIsFavourite());

        return toResponse(noteRepository.SaveNote(note));
    }

    @Override
    @Transactional
    public void DeleteNoteById(UUID id) {
        // Soft delete: заметка остаётся в БД с проставленным deleted_at, чтобы другие
        // устройства могли узнать об удалении во время будущей синхронизации.
        // Физическое удаление (INoteRepository.DeleteNoteById) больше здесь не используется.
        Note note = noteRepository.GetNoteById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        note.MarkDeleted();

        noteRepository.SaveNote(note);
    }

    // content хранится в Note/NoteEntity как обычный Java String, но колонка в PostgreSQL —
    // JSONB. Поэтому на границе API (Contracts) content — это Object (обычная Java-структура:
    // Map/List/String/число/null — как Jackson нативно разбирает любой JSON), а внутри
    // Domain/Entity остаётся String с валидным JSON-текстом. Это позволяет не трогать
    // Entity/Mapper/Repository — конвертация целиком на границе Service.
    private String writeContent(Object content) {
        if (content == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Некорректный JSON в content заметки", e);
        }
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

    private NoteContracts.NoteResponse toResponse(Note n) {
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

}