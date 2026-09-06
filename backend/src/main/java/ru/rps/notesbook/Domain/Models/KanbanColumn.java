package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;
import java.util.UUID;

public class KanbanColumn {

    private final UUID id;
    private KanbanBoard board;
    private String title;
    private int position;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public KanbanColumn(UUID id, KanbanBoard board, String title, int position, LocalDateTime createdAt) {
        this(id, board, title, position, createdAt, createdAt);
    }

    public KanbanColumn(UUID id, KanbanBoard board, String title, int position,
                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        ValidateBoard(board);
        ValidateTitle(title);
        ValidatePosition(position);

        this.id = id;
        this.board = board;
        this.title = title;
        this.position = position;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID GetId() { return this.id; }
    public KanbanBoard GetBoard() { return this.board; }
    public String GetTitle() { return this.title; }
    public int GetPosition() { return this.position; }
    public LocalDateTime GetCreatedAt() { return this.createdAt; }
    public LocalDateTime GetUpdatedAt() { return this.updatedAt; }

    public void ChangeTitle(String title) {
        ValidateTitle(title);
        this.title = title;
        this.updatedAt = LocalDateTime.now();
    }

    public void ChangePosition(int position) {
        ValidatePosition(position);
        this.position = position;
        this.updatedAt = LocalDateTime.now();
    }

    public void ChangeBoard(KanbanBoard board) {
        ValidateBoard(board);
        this.board = board;
        this.updatedAt = LocalDateTime.now();
    }

    public void ValidateBoard(KanbanBoard board) {
        if (board == null) {
            throw new IllegalArgumentException("board can't be null");
        }
    }
    public void ValidateTitle(String title) {
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("title can't be null or empty");
        }
        if (title.strip().length() > 100) {
            throw new IllegalArgumentException("title is too long");
        }
    }
    public void ValidatePosition(int position) {
        if (position < 0) {
            throw new IllegalArgumentException("position can't be negative");
        }
    }

}