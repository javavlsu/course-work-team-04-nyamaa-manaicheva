package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IAdminRepository;
import ru.rps.notesbook.Domain.Models.Admin;
import ru.rps.notesbook.Infrastructure.Database.Adapters.AdminAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.AdminEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.AdminMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class AdminRepository implements IAdminRepository {

    private final AdminAdapterJPA adminAdapterJPA;
    private final AdminMapper adminMapper;

    @Override
    public List<Admin> GetAdminsByUsersIds(List<UUID> userIds)
    {
        return adminAdapterJPA.findByUsersIdsIn(userIds)
                .stream()
                .map(adminMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<Admin> GetAdminByUserId(UUID userId)
    {
        return adminAdapterJPA.findByUserId(userId).map(adminMapper::ToDomain);
    }

    @Override
    public Admin SaveAdmin(Admin admin)
    {
        AdminEntity entity = adminMapper.ToEntity(admin);

        AdminEntity createdEntity = adminAdapterJPA.save(entity);

        return adminMapper.ToDomain(createdEntity);
    }

    @Override
    public void DeleteAdminById(UUID userId)
    {
        adminAdapterJPA.deleteByUserId(userId);
    }

}