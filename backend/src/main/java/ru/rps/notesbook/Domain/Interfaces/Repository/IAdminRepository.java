package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Admin;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IAdminRepository {
    List<Admin> GetAdminsByUsersIds(List<UUID> usersIds);
    Optional<Admin> GetAdminByUserId(UUID userId);
    Admin SaveAdmin(Admin admin);
    void DeleteAdminById(UUID userId);
}
