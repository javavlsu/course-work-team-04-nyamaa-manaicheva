package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.User;

import java.util.List;
import java.util.UUID;

@Repository
public interface IUserRepository{
    List<User> GetUsersAsync();
    User GetUserByIdAsync(UUID id);
    User GetUserByEmailAsync(String email);
    User CreateUserAsync(User user);
    User UpdateUserAsync(User user);
    void DeleteUserByIdAsync(UUID id);
}