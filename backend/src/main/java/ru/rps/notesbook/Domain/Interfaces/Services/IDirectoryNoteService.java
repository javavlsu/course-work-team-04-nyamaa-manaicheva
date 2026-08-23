package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.DirectoryNoteContracts;

import java.util.List;
import java.util.UUID;

public interface IDirectoryNoteService {

    List<DirectoryNoteContracts.DirectoryNoteResponse> GetNotesByDirectoryId(UUID directoryId);

    DirectoryNoteContracts.DirectoryNoteResponse AddNoteToDirectory(DirectoryNoteContracts.CreateDirectoryNoteRequest request);

    void RemoveNoteFromDirectory(UUID directoryId, UUID noteId);

}
