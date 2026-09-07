package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.Calendar;
import ru.rps.notesbook.Infrastructure.Database.Entities.CalendarEntity;

@Component
@RequiredArgsConstructor
public class CalendarMapper {

    private final UserMapper userMapper;

    public Calendar ToDomain(CalendarEntity entity)
    {
        return new Calendar(
                entity.getId(),
                userMapper.ToDomain(entity.getOwner()),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public CalendarEntity ToEntity(Calendar calendar)
    {
        return new CalendarEntity(
                calendar.GetId(),
                userMapper.ToEntity(calendar.GetOwner()),
                calendar.GetCreatedAt(),
                calendar.GetUpdatedAt()
        );
    }

}
