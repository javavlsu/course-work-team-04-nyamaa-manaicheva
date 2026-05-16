package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.UserContracts;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface IUserService {

    List<UserContracts.UserResponse> GetUsers();

    UserContracts.UserResponse GetUserById(UUID id);

    UserContracts.UserResponse UpdateUser(UUID id, UserContracts.UpdateUserRequest request);

    void DeleteUserById(UUID id);

    void register(String name, String surname, String email, LocalDate birthday, String rawPassword);

}