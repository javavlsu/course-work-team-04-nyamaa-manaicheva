package ru.rps.notesbook.Domain.Services;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Base64;
import java.util.UUID;

public final class PageCursor {

    public static final int DEFAULT_LIMIT = 20;
    public static final int MAX_LIMIT = 100;

    private static final String SEPARATOR = "|";

    private final LocalDateTime updatedAt;
    private final UUID id;

    private PageCursor(LocalDateTime updatedAt, UUID id) {
        this.updatedAt = updatedAt;
        this.id = id;
    }

    public static PageCursor of(LocalDateTime updatedAt, UUID id) {
        return new PageCursor(updatedAt, id);
    }

    public static int normalizeLimit(Integer limit) {
        if (limit == null) {
            return DEFAULT_LIMIT;
        }
        if (limit < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "limit must be >= 1");
        }
        return Math.min(limit, MAX_LIMIT);
    }

    public static PageCursor decodeOrNull(String cursor) {
        if (cursor == null || cursor.isBlank()) {
            return null;
        }
        try {
            String raw = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
            int separatorIndex = raw.lastIndexOf(SEPARATOR);
            if (separatorIndex < 0) {
                throw new IllegalArgumentException("Missing separator in cursor payload");
            }
            LocalDateTime cursorUpdatedAt = LocalDateTime.parse(raw.substring(0, separatorIndex));
            UUID cursorId = UUID.fromString(raw.substring(separatorIndex + 1));
            return new PageCursor(cursorUpdatedAt, cursorId);
        } catch (IllegalArgumentException | DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid cursor", e);
        }
    }

    public String encode() {
        String raw = updatedAt.toString() + SEPARATOR + id;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    public boolean isAfter(LocalDateTime itemUpdatedAt, UUID itemId) {
        int cmp = itemUpdatedAt.compareTo(updatedAt);
        if (cmp != 0) {
            return cmp < 0;
        }
        return itemId.compareTo(id) < 0;
    }

}