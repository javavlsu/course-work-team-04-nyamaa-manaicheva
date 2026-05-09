package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;
import ru.rps.notesbook.Domain.Models.Directory;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class DirectoryController {

    private final IDirectoryService directoryService;

    @GetMapping("/directories")
    public List<Directory> getDirectories(@AuthenticationPrincipal UserDetails user) {
        return directoryService.GetDirectoriesByOwnerId(user.getId());
    }

    @GetMapping("/directories/{id}")
    public Directory getDirectoryById(@PathVariable UUID id) {
        return directoryService.GetDirectoryById(id);
    }

    @PostMapping("/directories")
    public Directory saveDirectory(@RequestBody Directory directory) {
        return directoryService.SaveDirectory(directory);
    }

    @DeleteMapping("/directories/{id}")
    public void deleteDirectoryById(@PathVariable UUID id) {
        directoryService.DeleteDirectoryById(id);
    }
}
