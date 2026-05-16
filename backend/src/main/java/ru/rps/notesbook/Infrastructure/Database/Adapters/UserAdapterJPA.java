package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.UserEntity;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAdapterJPA  extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

}