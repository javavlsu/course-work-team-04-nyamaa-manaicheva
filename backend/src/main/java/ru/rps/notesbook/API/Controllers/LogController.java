package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.LogContracts;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Services.ILogService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogController {

    private static final String ADMIN_AUTHORITY = "ROLE_" + RoleTypeEnum.Admin.name().toUpperCase();

    private final ILogService logService;

    @GetMapping
    public LogContracts.LogsResponse getLogs(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestParam(required = false) Integer lines
    ) {
        requireAdmin(principal);
        return logService.GetLogs(lines);
    }

    private static void requireAdmin(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(ADMIN_AUTHORITY));
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

}
