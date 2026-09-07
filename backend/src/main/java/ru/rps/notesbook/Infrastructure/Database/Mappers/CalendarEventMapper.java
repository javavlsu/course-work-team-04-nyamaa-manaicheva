package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.CalendarEvent;
import ru.rps.notesbook.Infrastructure.Database.Entities.CalendarEventEntity;

@Component
@RequiredArgsConstructor
public class CalendarEventMapper {

    private final CalendarMapper calendarMapper;
    private final NoteMapper noteMapper;

    public CalendarEvent ToDomain(CalendarEventEntity entity)
    {
        return new CalendarEvent(
                entity.getId(),
                calendarMapper.ToDomain(entity.getCalendar()),
                entity.getTitle(),
                entity.getDescription(),
                entity.getStartAt(),
                entity.getEndAt(),
                entity.getAllDay(),
                entity.getNote() != null ? noteMapper.ToDomain(entity.getNote()) : null,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public CalendarEventEntity ToEntity(CalendarEvent event)
    {
        return new CalendarEventEntity(
                event.GetId(),
                calendarMapper.ToEntity(event.GetCalendar()),
                event.GetTitle(),
                event.GetDescription(),
                event.GetStartAt(),
                event.GetEndAt(),
                event.IsAllDay(),
                event.GetNote() != null ? noteMapper.ToEntity(event.GetNote()) : null,
                event.GetCreatedAt(),
                event.GetUpdatedAt()
        );
    }

}
