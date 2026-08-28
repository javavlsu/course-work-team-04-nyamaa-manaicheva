package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.PushContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IPushService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.UUID;

// Stage 7.3: Push Sync (CLIENT -> SERVER). Доступ к каждому ресурсу проверяется целиком
// внутри PushService (по аналогии с SyncController/SyncService для Pull Sync) - контроллер
// не делает отдельных ownership/permission проверок.
@RestController
@RequestMapping("/api/sync/push")
@RequiredArgsConstructor
public class PushController {

    private final IPushService pushService;

    @PostMapping
    public PushContracts.PushResponse push(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestBody PushContracts.PushRequest request
    ) {
        UUID userId = requireUserId(principal);
        return pushService.Push(userId, request);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

}
