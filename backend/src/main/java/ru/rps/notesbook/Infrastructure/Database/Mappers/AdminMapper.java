package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.Admin;
import ru.rps.notesbook.Infrastructure.Database.Entities.AdminEntity;

@Component
@RequiredArgsConstructor
public class AdminMapper {

    private final UserMapper userMapper;

    public Admin ToDomain(AdminEntity entity)
    {
        return new Admin(
                userMapper.ToDomain(entity.getUser()),
                entity.getCode()
        );
    }

    public AdminEntity ToEntity(Admin admin)
    {
        AdminEntity entity = new AdminEntity();
        entity.setUser(userMapper.ToEntity(admin.GetUser()));
        entity.setCode(admin.GetCode());
        return entity;
    }
}
