package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.API.Contracts.DirectoryNoteContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryNoteService;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Domain.Models.DirectoryNote;
import ru.rps.notesbook.Domain.Models.Note;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DirectoryNoteService implements IDirectoryNoteService {

    private final IDirectoryNoteRepository directoryNoteRepository;
    private final INoteRepository noteRepository;
    private final IDirectoryRepository directoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DirectoryNoteContracts.DirectoryNoteResponse> GetNotesByDirectoryId(UUID directoryId) {
        return directoryNoteRepository.GetDirectoriesNotesByDirectoryId(directoryId).stream()
                .map(DirectoryNoteService::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public DirectoryNoteContracts.DirectoryNoteResponse AddNoteToDirectory(DirectoryNoteContracts.CreateDirectoryNoteRequest request) {
        Note note = noteRepository.GetNoteById(request.noteId())
                .orElseThrow(() -> new RuntimeException("Note not found"));
        Directory directory = directoryRepository.GetDirectoryById(request.directoryId())
                .orElseThrow(() -> new RuntimeException("Directory not found"));

        if (directoryNoteRepository.ExistsByNoteIdAndDirectoryId(note.GetId(), directory.GetId())) {
            return new DirectoryNoteContracts.DirectoryNoteResponse(note.GetId(), directory.GetId());
        }

        DirectoryNote directoryNote = new DirectoryNote(note, directory);

        return toResponse(directoryNoteRepository.SaveDirectoryNote(directoryNote));
    }

    @Override
    @Transactional
    public void RemoveNoteFromDirectory(UUID directoryId, UUID noteId) {
        directoryNoteRepository.DeleteDirectoryNoteByNoteIdAndDirectoryId(noteId, directoryId);
    }

    private static DirectoryNoteContracts.DirectoryNoteResponse toResponse(DirectoryNote dn) {
        return new DirectoryNoteContracts.DirectoryNoteResponse(
                dn.GetNote().GetId(),
                dn.GetDirectory().GetId()
        );
    }
}
