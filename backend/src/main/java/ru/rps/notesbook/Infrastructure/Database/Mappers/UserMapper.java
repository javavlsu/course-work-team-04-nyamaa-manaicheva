package ru.rps.notesbook.Infrastructure.Database.Mappers;

import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.User;
import ru.rps.notesbook.Infrastructure.Database.Entities.UserEntity;

@Component
public class UserMapper {
    public User ToDomain(UserEntity entity)
    {
        return new User(
                entity.getId(),
                entity.getName(),
                entity.getSurname(),
                entity.getEmail(),
                entity.getBirthdayDate(),
                entity.getRegistrationDate(),
                entity.getPassword(),
                entity.getRole()
        );
    }

    public UserEntity ToEntity(User user)
    {
        return new UserEntity(
                user.GetId(),
                user.GetName(),
                user.GetSurname(),
                user.GetEmail(),
                user.GetBirthdayDate(),
                user.GetRegistrationDate(),
                user.GetPassword(),
                user.GetRole()
        );
    }
}
