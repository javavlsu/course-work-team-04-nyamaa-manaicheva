package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.TagContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.ITagService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final ITagService tagService;

    @GetMapping
    public List<TagContracts.TagResponse> listTags(@AuthenticationPrincipal NotesbookUserPrincipal principal) {
        UUID ownerId = requireUserId(principal);
        return tagService.GetTagsByOwnerId(ownerId);
    }

    @PostMapping
    public TagContracts.TagResponse createTag(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestBody TagContracts.CreateTagRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        return tagService.CreateTag(ownerId, request);
    }

    @PutMapping("/{id}")
    public TagContracts.TagResponse updateTag(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody TagContracts.UpdateTagRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        TagContracts.TagResponse tag = tagService.GetTagById(id);
        requireOwnership(tag, ownerId);

        return tagService.UpdateTag(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTag(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        TagContracts.TagResponse tag = tagService.GetTagById(id);
        requireOwnership(tag, ownerId);

        tagService.DeleteTagById(id);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

    private static void requireOwnership(TagContracts.TagResponse response, UUID ownerId) {
        if (!response.ownerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

}