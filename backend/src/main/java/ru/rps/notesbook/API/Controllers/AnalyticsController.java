package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.AnalyticsContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IAnalyticsService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final IAnalyticsService analyticsService;

    @GetMapping
    public AnalyticsContracts.AnalyticsResponse getAnalytics(
            @AuthenticationPrincipal NotesbookUserPrincipal principal
    ) {
        UUID userId = requireUserId(principal);
        return analyticsService.GetAnalytics(userId);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

}
