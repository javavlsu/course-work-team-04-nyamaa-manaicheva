package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;
import java.util.UUID;

public class Attachment {

    private final UUID id;
    private final Note note;
    private final String fileName;
    private final String contentType;
    private final Long fileSize;
    private final String storageKey;
    private final LocalDateTime createdAt;
    private final User createdBy;

    public Attachment(UUID id, Note note, String fileName, String contentType,
                      Long fileSize, String storageKey,
                      LocalDateTime createdAt, User createdBy) {
        ValidateNote(note);
        ValidateFileName(fileName);
        ValidateContentType(contentType);
        ValidateFileSize(fileSize);
        ValidateStorageKey(storageKey);
        ValidateCreatedBy(createdBy);

        this.id = id;
        this.note = note;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.storageKey = storageKey;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }

    public UUID GetId() { return this.id; }
    public Note GetNote() { return this.note; }
    public String GetFileName() { return this.fileName; }
    public String GetContentType() { return this.contentType; }
    public Long GetFileSize() { return this.fileSize; }
    public String GetStorageKey() { return this.storageKey; }
    public LocalDateTime GetCreatedAt() { return this.createdAt; }
    public User GetCreatedBy() { return this.createdBy; }

    public void ValidateNote(Note note) {
        if (note == null) {
            throw new IllegalArgumentException("note can't be null");
        }
    }
    public void ValidateFileName(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            throw new IllegalArgumentException("file name can't be null or empty");
        }
        if (fileName.strip().length() > 255) {
            throw new IllegalArgumentException("file name is too long");
        }
    }
    public void ValidateContentType(String contentType) {
        if (contentType == null || contentType.isEmpty()) {
            throw new IllegalArgumentException("content type can't be null or empty");
        }
        if (contentType.strip().length() > 100) {
            throw new IllegalArgumentException("content type is too long");
        }
    }
    public void ValidateFileSize(Long fileSize) {
        if (fileSize == null || fileSize < 0) {
            throw new IllegalArgumentException("file size must be a non-negative number");
        }
    }
    public void ValidateStorageKey(String storageKey) {
        if (storageKey == null || storageKey.isEmpty()) {
            throw new IllegalArgumentException("storage key can't be null or empty");
        }
        if (storageKey.strip().length() > 255) {
            throw new IllegalArgumentException("storage key is too long");
        }
    }
    public void ValidateCreatedBy(User createdBy) {
        if (createdBy == null) {
            throw new IllegalArgumentException("created by can't be null");
        }
    }
}
