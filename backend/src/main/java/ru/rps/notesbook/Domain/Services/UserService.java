package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
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

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private static final int SEARCH_RESULT_LIMIT = 20;

    private static final Duration PASSWORD_RESET_TOKEN_TTL = Duration.ofMinutes(30);
    private static final int PASSWORD_RESET_TOKEN_BYTES = 32;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

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

        if (request.name() != null) {
            user.ChangeName(request.name());
        }
        if (request.surname() != null) {
            user.ChangeSurname(request.surname());
        }
        if (request.email() != null) {
            user.ChangeEmail(request.email().trim().toLowerCase());
        }
        if (request.birthdayDate() != null) {
            user.ChangeBirthdayDate(request.birthdayDate());
        }

        return toResponse(userRepository.SaveUser(user));
    }

    @Override
    @Transactional
    public UserContracts.UserResponse ChangeUserRole(UUID id, RoleTypeEnum role) {
        User user = userRepository.GetUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.ChangeRole(role);

        return toResponse(userRepository.SaveUser(user));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserContracts.UserSearchResponse> SearchUsers(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        String normalized = query.trim().toLowerCase();

        return userRepository.GetUsers().stream()
                .filter(u -> u.GetEmail().toLowerCase().contains(normalized)
                        || u.GetName().toLowerCase().contains(normalized)
                        || u.GetSurname().toLowerCase().contains(normalized))
                .limit(SEARCH_RESULT_LIMIT)
                .map(u -> new UserContracts.UserSearchResponse(u.GetId(), u.GetEmail(), u.GetName()))
                .toList();
    }

    @Override
    @Transactional
    public void DeleteUserById(UUID id) {
        try {
            userRepository.DeleteUserById(id);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Невозможно удалить пользователя: с ним связаны заметки, директории или другие данные"
            );
        }
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
            LocalDateTime.now(),
            passwordEncoder.encode(rawPassword),
            RoleTypeEnum.Client
        );

        userRepository.SaveUser(user);
    }

    @Override
    @Transactional
    public String RequestPasswordReset(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }

        Optional<User> maybeUser = userRepository.GetUserByEmail(email.trim().toLowerCase());
        if (maybeUser.isEmpty()) {
            return null;
        }

        User user = maybeUser.get();

        byte[] randomBytes = new byte[PASSWORD_RESET_TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        user.SetPasswordResetToken(hashToken(rawToken), LocalDateTime.now().plus(PASSWORD_RESET_TOKEN_TTL));
        userRepository.SaveUser(user);

        return rawToken;
    }

    @Override
    @Transactional
    public void ResetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Токен обязателен");
        }

        User user = userRepository.GetUserByPasswordResetTokenHash(hashToken(token))
                .orElseThrow(() -> new IllegalArgumentException("Недействительный токен восстановления"));

        LocalDateTime expiresAt = user.GetPasswordResetExpiresAt();
        if (expiresAt == null || expiresAt.isBefore(LocalDateTime.now())) {
            user.ClearPasswordResetToken();
            userRepository.SaveUser(user);
            throw new IllegalArgumentException("Срок действия токена истёк");
        }

        user.ChangePassword(passwordEncoder.encode(newPassword));
        user.ClearPasswordResetToken();
        userRepository.SaveUser(user);
    }

    private static String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 недоступен", e);
        }
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