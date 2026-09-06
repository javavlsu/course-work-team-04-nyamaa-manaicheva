package ru.rps.notesbook.Domain.Models;

import ru.rps.notesbook.Domain.Enum.KanbanTaskStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class KanbanTask {

    private final UUID id;
    private KanbanColumn column;
    private String title;
    private String description;
    private int position;
    private KanbanTaskStatus status;
    private boolean archived;
    private Note note;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public KanbanTask(UUID id, KanbanColumn column, String title, String description,
                       int position, KanbanTaskStatus status, boolean archived,
                       Note note, LocalDateTime createdAt) {
        this(id, column, title, description, position, status, archived, note, createdAt, createdAt);
    }

    public KanbanTask(UUID id, KanbanColumn column, String title, String description,
                       int position, KanbanTaskStatus status, boolean archived,
                       Note note, LocalDateTime createdAt, LocalDateTime updatedAt) {
        ValidateColumn(column);
        ValidateTitle(title);
        ValidatePosition(position);
        ValidateStatus(status);

        this.id = id;
        this.column = column;
        this.title = title;
        this.description = description;
        this.position = position;
        this.status = status;
        this.archived = archived;
        this.note = note;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID GetId() { return this.id; }
    public KanbanColumn GetColumn() { return this.column; }
    public String GetTitle() { return this.title; }
    public String GetDescription() { return this.description; }
    public int GetPosition() { return this.position; }
    public KanbanTaskStatus GetStatus() { return this.status; }
    public boolean IsArchived() { return this.archived; }
    public Note GetNote() { return this.note; }
    public LocalDateTime GetCreatedAt() { return this.createdAt; }
    public LocalDateTime GetUpdatedAt() { return this.updatedAt; }

    public void ChangeTitle(String title) {
        ValidateTitle(title);
        this.title = title;
        this.updatedAt = LocalDateTime.now();
    }

    public void ChangeDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public void ChangePosition(int position) {
        ValidatePosition(position);
        this.position = position;
        this.updatedAt = LocalDateTime.now();
    }

    public void ChangeStatus(KanbanTaskStatus status) {
        ValidateStatus(status);
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public void MoveToColumn(KanbanColumn column) {
        ValidateColumn(column);
        this.column = column;
        this.updatedAt = LocalDateTime.now();
    }

    public void LinkNote(Note note) {
        this.note = note;
        this.updatedAt = LocalDateTime.now();
    }

    public void UnlinkNote() {
        this.note = null;
        this.updatedAt = LocalDateTime.now();
    }

    public void Archive() {
        this.archived = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void Unarchive() {
        this.archived = false;
        this.updatedAt = LocalDateTime.now();
    }

    public void ValidateColumn(KanbanColumn column) {
        if (column == null) {
            throw new IllegalArgumentException("column can't be null");
        }
    }
    public void ValidateTitle(String title) {
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("title can't be null or empty");
        }
        if (title.strip().length() > 150) {
            throw new IllegalArgumentException("title is too long");
        }
    }
    public void ValidatePosition(int position) {
        if (position < 0) {
            throw new IllegalArgumentException("position can't be negative");
        }
    }
    public void ValidateStatus(KanbanTaskStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("status can't be null");
        }
    }

}