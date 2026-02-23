package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.PermissionAccessEntity;

import java.util.UUID;

@Repository
public interface PermissionAccessAdapterJPA extends JpaRepository<PermissionAccessEntity, UUID> {



}