package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.UserEntity;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAdapterJPA  extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByPasswordResetTokenHash(String passwordResetTokenHash);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from UserEntity u where u.id = :userId")
    int deleteRowById(@Param("userId") UUID userId);

}