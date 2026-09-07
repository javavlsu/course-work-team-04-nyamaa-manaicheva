package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;
import java.util.UUID;

public class CalendarEvent {

    private final UUID id;
    private Calendar calendar;
    private String title;
    private String description;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private boolean allDay;
    private Note note;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CalendarEvent(UUID id, Calendar calendar, String title, String description,
                          LocalDateTime startAt, LocalDateTime endAt, boolean allDay,
                          Note note, LocalDateTime createdAt) {
        this(id, calendar, title, description, startAt, endAt, allDay, note, createdAt, createdAt);
    }

    public CalendarEvent(UUID id, Calendar calendar, String title, String description,
                          LocalDateTime startAt, LocalDateTime endAt, boolean allDay,
                          Note note, LocalDateTime createdAt, LocalDateTime updatedAt) {
        ValidateCalendar(calendar);
        ValidateTitle(title);
        ValidateRange(startAt, endAt);

        this.id = id;
        this.calendar = calendar;
        this.title = title;
        this.description = description;
        this.startAt = startAt;
        this.endAt = endAt;
        this.allDay = allDay;
        this.note = note;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID GetId() { return this.id; }
    public Calendar GetCalendar() { return this.calendar; }
    public String GetTitle() { return this.title; }
    public String GetDescription() { return this.description; }
    public LocalDateTime GetStartAt() { return this.startAt; }
    public LocalDateTime GetEndAt() { return this.endAt; }
    public boolean IsAllDay() { return this.allDay; }
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

    public void Reschedule(LocalDateTime startAt, LocalDateTime endAt) {
        ValidateRange(startAt, endAt);
        this.startAt = startAt;
        this.endAt = endAt;
        this.updatedAt = LocalDateTime.now();
    }

    public void ChangeAllDay(boolean allDay) {
        this.allDay = allDay;
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

    public void ValidateCalendar(Calendar calendar) {
        if (calendar == null) {
            throw new IllegalArgumentException("calendar can't be null");
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

    public void ValidateRange(LocalDateTime startAt, LocalDateTime endAt) {
        if (startAt == null || endAt == null) {
            throw new IllegalArgumentException("startAt/endAt can't be null");
        }
        if (endAt.isBefore(startAt)) {
            throw new IllegalArgumentException("endAt can't be before startAt");
        }
    }

}