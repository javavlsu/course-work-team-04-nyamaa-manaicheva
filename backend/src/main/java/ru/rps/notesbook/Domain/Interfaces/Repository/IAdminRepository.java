package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Admin;

import java.util.List;
import java.util.UUID;

@Repository
public interface IAdminRepository {
    List<Admin> GetAdminsByUsersIdsAsync(List<UUID> usersIds);
    Admin GetAdminByUserIdAsync(UUID userId);
    Admin CreateAdminAsync(Admin admin);
    Admin UpdateAdminAsync(Admin admin);
    void DeleteAdminByIdAsync(UUID userId);
}
