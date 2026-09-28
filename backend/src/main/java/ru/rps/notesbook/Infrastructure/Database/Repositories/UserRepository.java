package ru.rps.notesbook.Infrastructure.Database.Repositories;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Models.User;
import ru.rps.notesbook.Infrastructure.Database.Adapters.AttachmentAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.CalendarAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.CalendarEventAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.CommentAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.DirectoryAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.DirectoryNoteAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.KanbanBoardAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.KanbanColumnAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.KanbanTaskAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.NoteAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.NoteRevisionAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.NoteTagAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.PermissionAccessAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.TagAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Adapters.UserAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.UserEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.UserMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserRepository implements IUserRepository {

    private final UserAdapterJPA userAdapterJPA;
    private final UserMapper userMapper;

    private final AttachmentAdapterJPA attachmentAdapterJPA;
    private final CommentAdapterJPA commentAdapterJPA;
    private final NoteRevisionAdapterJPA noteRevisionAdapterJPA;
    private final NoteTagAdapterJPA noteTagAdapterJPA;
    private final TagAdapterJPA tagAdapterJPA;
    private final PermissionAccessAdapterJPA permissionAccessAdapterJPA;
    private final DirectoryNoteAdapterJPA directoryNoteAdapterJPA;
    private final KanbanTaskAdapterJPA kanbanTaskAdapterJPA;
    private final KanbanColumnAdapterJPA kanbanColumnAdapterJPA;
    private final KanbanBoardAdapterJPA kanbanBoardAdapterJPA;
    private final CalendarEventAdapterJPA calendarEventAdapterJPA;
    private final CalendarAdapterJPA calendarAdapterJPA;
    private final NoteAdapterJPA noteAdapterJPA;
    private final DirectoryAdapterJPA directoryAdapterJPA;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<User> GetUsers()
    {
        return userAdapterJPA.findAll()
                .stream()
                .map(userMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<User> GetUserById(UUID id)
    {
        return userAdapterJPA.findById(id).map(userMapper::ToDomain);
    }

    @Override
    public Optional<User> GetUserByEmail(String email)
    {
        return userAdapterJPA.findByEmail(email).map(userMapper::ToDomain);
    }

    @Override
    public Optional<User> GetUserByPasswordResetTokenHash(String tokenHash)
    {
        return userAdapterJPA.findByPasswordResetTokenHash(tokenHash).map(userMapper::ToDomain);
    }

    @Override
    @Transactional
    public User SaveUser(User user) {
        UserEntity entity = userMapper.ToEntity(user);
        UUID id = entity.getId();
        if (id != null && userAdapterJPA.existsById(id)) {
            return userMapper.ToDomain(userAdapterJPA.save(entity));
        }
        entityManager.persist(entity);
        return userMapper.ToDomain(entity);
    }

    @Override
    public void DeleteUserById(UUID id)
    {
        userAdapterJPA.deleteById(id);
        entityManager.flush();
    }

    @Override
    @Transactional
    public List<String> DeleteUserWithAllData(UUID id)
    {
        List<String> storageKeys = attachmentAdapterJPA.findStorageKeysRelatedToUser(id);

        attachmentAdapterJPA.deleteAllRelatedToUser(id);
        commentAdapterJPA.deleteAllRelatedToUser(id);
        noteRevisionAdapterJPA.deleteAllRelatedToUser(id);
        noteTagAdapterJPA.deleteAllRelatedToUser(id);
        tagAdapterJPA.deleteAllByOwnerId(id);
        permissionAccessAdapterJPA.deleteAllRelatedToUser(id);
        directoryNoteAdapterJPA.deleteAllRelatedToUser(id);

        // Канбан
        kanbanTaskAdapterJPA.deleteAllOnBoardsOwnedBy(id);
        kanbanTaskAdapterJPA.detachNotesOwnedBy(id);
        kanbanColumnAdapterJPA.deleteAllOnBoardsOwnedBy(id);
        kanbanBoardAdapterJPA.deleteAllByOwnerId(id);

        // Календарь
        calendarEventAdapterJPA.deleteAllInCalendarsOwnedBy(id);
        calendarEventAdapterJPA.detachNotesOwnedBy(id);
        calendarAdapterJPA.deleteAllByOwnerId(id);

        noteAdapterJPA.deleteAllByOwnerId(id);
        directoryAdapterJPA.deleteAllByOwnerId(id);
        userAdapterJPA.deleteRowById(id);

        return storageKeys;
    }

}