package ru.rps.notesbook.API.Controllers;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> index() {
        return Map.of(
                "service", "notesbook",
                "status", "ok"
        );
    }

    @GetMapping("/home")
    public Map<String, Object> home(@AuthenticationPrincipal NotesbookUserPrincipal user) {
        return Map.of(
                "authenticated", user != null,
                "username", user != null ? user.getUsername() : null
        );
    }
}