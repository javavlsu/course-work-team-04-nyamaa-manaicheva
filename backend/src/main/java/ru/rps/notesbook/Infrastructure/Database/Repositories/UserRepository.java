package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Models.User;
import ru.rps.notesbook.Infrastructure.Database.Adapters.UserAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.UserEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.UserMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserRepository implements IUserRepository {

    private final UserAdapterJPA userAdapterJPA;
    private final UserMapper userMapper;

    @Override
    public List<User> GetUsers()
    {
        return userAdapterJPA.findAll()
                .stream()
                .map(userMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<User> GetUserById(UUID id)
    {
        return userAdapterJPA.findById(id).map(userMapper::ToDomain);
    }

    @Override
    public Optional<User> GetUserByEmail(String email)
    {
        return userAdapterJPA.findByEmail(email).map(userMapper::ToDomain);
    }

    @Override
    public User SaveUser(User user)
    {
        UserEntity entity = userMapper.ToEntity(user);

        UserEntity createdEntity = userAdapterJPA.save(entity);

        return userMapper.ToDomain(createdEntity);
    }

    @Override
    public void DeleteUserById(UUID id)
    {
        userAdapterJPA.deleteById(id);
    }
}