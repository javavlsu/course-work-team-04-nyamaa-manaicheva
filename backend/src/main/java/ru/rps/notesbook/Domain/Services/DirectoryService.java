package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;

@Service
@RequiredArgsConstructor
public class DirectoryService implements IDirectoryService {

    private final IDirectoryRepository directoryRepository;

}