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

    private final String sortValue;
    private final UUID id;

    private PageCursor(String sortValue, UUID id) {
        this.sortValue = sortValue;
        this.id = id;
    }

    public static PageCursor of(LocalDateTime sortValue, UUID id) {
        return new PageCursor(sortValue.toString(), id);
    }

    public static PageCursor of(String sortValue, UUID id) {
        return new PageCursor(sortValue, id);
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
            UUID cursorId = UUID.fromString(raw.substring(separatorIndex + 1));
            return new PageCursor(raw.substring(0, separatorIndex), cursorId);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid cursor", e);
        }
    }

    public String encode() {
        String raw = sortValue + SEPARATOR + id;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    public boolean isAfter(LocalDateTime itemValue, UUID itemId) {
        return isAfter(itemValue, itemId, true);
    }

    public boolean isAfter(LocalDateTime itemValue, UUID itemId, boolean desc) {
        int cmp = itemValue.compareTo(sortValueAsDate());
        if (cmp == 0) {
            cmp = itemId.compareTo(id);
        }
        return desc ? cmp < 0 : cmp > 0;
    }

    public boolean isAfterText(String itemValue, UUID itemId, boolean desc) {
        int cmp = itemValue.compareTo(sortValue);
        if (cmp == 0) {
            cmp = itemId.compareTo(id);
        }
        return desc ? cmp < 0 : cmp > 0;
    }

    private LocalDateTime sortValueAsDate() {
        try {
            return LocalDateTime.parse(sortValue);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid cursor", e);
        }
    }

}