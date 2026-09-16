package ru.rps.notesbook.Domain.Services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.NoteRevisionContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRevisionRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteRevisionService;
import ru.rps.notesbook.Domain.Models.NoteRevision;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteRevisionService implements INoteRevisionService {

    private final INoteRevisionRepository noteRevisionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public List<NoteRevisionContracts.NoteRevisionResponse> GetRevisionsByNoteId(UUID noteId) {
        return noteRevisionRepository.GetRevisionsByNoteId(noteId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public NoteRevisionContracts.NoteRevisionResponse GetRevisionById(UUID id) {
        return toResponse(noteRevisionRepository.GetRevisionById(id)
                .orElseThrow(() -> new RuntimeException("Revision not found")));
    }

    private Object readContent(String content) {
        if (content == null) {
            return null;
        }
        try {
            return objectMapper.readValue(content, Object.class);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Некорректный JSON в content ревизии", e);
        }
    }

    private NoteRevisionContracts.NoteRevisionResponse toResponse(NoteRevision r) {
        return new NoteRevisionContracts.NoteRevisionResponse(
                r.GetId(),
                r.GetNote().GetId(),
                r.GetTitle(),
                readContent(r.GetContent()),
                r.GetVersion(),
                r.GetCreatedAt(),
                r.GetCreatedBy().GetId()
        );
    }

}