package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.AdminContracts;
import ru.rps.notesbook.API.Contracts.UserContracts;

import java.util.UUID;

public interface IAdminService {

    UserContracts.UserResponse CreateUser(UserContracts.CreateUserRequest request);
    void DeleteUserWithAllData(UUID targetUserId, UUID actorUserId);
    AdminContracts.LogsResponse GetLogs(Integer lines);

}
