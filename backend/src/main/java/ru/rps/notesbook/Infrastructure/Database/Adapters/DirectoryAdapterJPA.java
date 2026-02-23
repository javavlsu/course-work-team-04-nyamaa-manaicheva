package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Directory;

import java.util.UUID;

@Repository
public interface DirectoryAdapterJPA extends JpaRepository<Directory, UUID> {



}