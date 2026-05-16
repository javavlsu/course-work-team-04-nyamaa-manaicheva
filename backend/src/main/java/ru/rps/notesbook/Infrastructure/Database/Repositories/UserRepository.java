package ru.rps.notesbook.Infrastructure.Database.Repositories;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
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

    @PersistenceContext
    private EntityManager entityManager;

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
    @Transactional
    public User SaveUser(User user) {
        UserEntity entity = userMapper.ToEntity(user);
        UUID id = entity.getId();
        if (id != null && userAdapterJPA.existsById(id)) {
            return userMapper.ToDomain(userAdapterJPA.save(entity));
        }
        entityManager.persist(entity);
        return userMapper.ToDomain(entity);
    }

    @Override
    public void DeleteUserById(UUID id)
    {
        userAdapterJPA.deleteById(id);
    }
}