package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.SyncContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.ISyncService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.UUID;

// Stage 7.2: базовая pull-синхронизация. Доступ к ресурсам вычисляется целиком внутри
// SyncService - контроллер не делает отдельных ownership/permission проверок для каждой
// сущности (в отличие от NoteController/DirectoryController), это часть самого алгоритма Sync.
@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
public class SyncController {

    private final ISyncService syncService;

    @PostMapping
    public SyncContracts.SyncResponse sync(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestBody SyncContracts.SyncRequest request
    ) {
        UUID userId = requireUserId(principal);
        return syncService.Sync(userId, request);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

}
