package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IUserRepository{
    List<User> GetUsers();
    Optional<User> GetUserById(UUID id);
    Optional<User> GetUserByEmail(String email);
    User SaveUser(User user);
    void DeleteUserById(UUID id);
}