package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.UserContracts;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IUserService;
import ru.rps.notesbook.Domain.Models.User;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UserContracts.UserResponse> GetUsers() {
        return userRepository.GetUsers().stream()
                .map(UserService::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserContracts.UserResponse GetUserById(UUID id) {
        return toResponse(userRepository.GetUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    @Override
    @Transactional
    public UserContracts.UserResponse UpdateUser(UUID id, UserContracts.UpdateUserRequest request) {
        User user = userRepository.GetUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toResponse(userRepository.SaveUser(user));
    }

    @Override
    @Transactional
    public void DeleteUserById(UUID id) {
        userRepository.DeleteUserById(id);
    }

    @Override
    @Transactional
    public void register(String name, String surname, String email,
                        LocalDate birthday, String rawPassword) {
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.GetUserByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("Пользователь с таким email уже зарегистрирован");
        }
        
        User user = new User(
            UUID.randomUUID(),
            name,
            surname,
            normalizedEmail,
            birthday,
            passwordEncoder.encode(rawPassword),
            RoleTypeEnum.Client
        );

        userRepository.SaveUser(user);
    }

    private static UserContracts.UserResponse toResponse(User u) {
        return new UserContracts.UserResponse(
                u.GetId(),
                u.GetName(),
                u.GetSurname(),
                u.GetEmail(),
                u.GetBirthdayDate(),
                u.GetRegistrationDate(),
                u.GetRole()
        );
    }
}