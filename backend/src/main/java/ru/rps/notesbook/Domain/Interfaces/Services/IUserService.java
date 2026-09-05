package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.UserContracts;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface IUserService {

    List<UserContracts.UserResponse> GetUsers();

    UserContracts.UserResponse GetUserById(UUID id);

    UserContracts.UserResponse UpdateUser(UUID id, UserContracts.UpdateUserRequest request);

    UserContracts.UserResponse ChangeUserRole(UUID id, RoleTypeEnum role);

    List<UserContracts.UserSearchResponse> SearchUsers(String query);

    void DeleteUserById(UUID id);

    void register(String name, String surname, String email, LocalDate birthday, String rawPassword);

    void RequestPasswordReset(String email);

    void ResetPassword(String token, String newPassword);

}