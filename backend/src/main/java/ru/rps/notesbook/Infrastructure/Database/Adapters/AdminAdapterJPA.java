package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.AdminEntity;

import java.util.UUID;

@Repository
public interface AdminAdapterJPA extends JpaRepository<AdminEntity, UUID> {



}