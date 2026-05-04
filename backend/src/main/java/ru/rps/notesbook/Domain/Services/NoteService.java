package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;

@Service
@RequiredArgsConstructor
public class NoteService implements INoteService {

    private final INoteRepository noteRepository;
    private final IPermissionAccessRepository permissionAccessRepository;


}