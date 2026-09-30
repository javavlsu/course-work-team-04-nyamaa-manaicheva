package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.UserContracts;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IEmailService;
import ru.rps.notesbook.Domain.Interfaces.Services.IUserService;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;
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
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private static final int SEARCH_RESULT_LIMIT = 20;

    private static final Duration PASSWORD_RESET_TOKEN_TTL = Duration.ofMinutes(30);
    private static final int PASSWORD_RESET_TOKEN_BYTES = 32;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IEmailService emailService;
    private final IFileStorageService fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public UserContracts.UserPageResponse GetUsers(Integer limit, String cursor) {
        int pageSize = PageCursor.normalizeLimit(limit);
        PageCursor pageCursor = PageCursor.decodeOrNull(cursor);

        List<User> sorted = userRepository.GetUsers().stream()
                .sorted(Comparator.comparing(User::GetRegistrationDate).thenComparing(User::GetId))
                .toList();

        List<User> page = sorted.stream()
                .filter(u -> pageCursor == null || pageCursor.isAfter(u.GetRegistrationDate(), u.GetId(), false))
                .limit(pageSize + 1)
                .toList();

        boolean hasMore = page.size() > pageSize;
        List<User> pageItems = hasMore ? page.subList(0, pageSize) : page;

        String nextCursor = hasMore
                ? PageCursor.of(pageItems.get(pageItems.size() - 1).GetRegistrationDate(), pageItems.get(pageItems.size() - 1).GetId()).encode()
                : null;

        return new UserContracts.UserPageResponse(
                pageItems.stream().map(UserService::toResponse).toList(),
                nextCursor,
                hasMore,
                sorted.size()
        );
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
    public void DeleteUserById(UUID id) {
        userRepository.GetUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> storageKeys = userRepository.DeleteUserById(id);

        for (String storageKey : storageKeys) {
            try {
                fileStorageService.Delete(storageKey);
            } catch (RuntimeException e) {
                log.error("Failed to delete storage object (key={}) of removed user {}; metadata already removed",
                        storageKey, id, e);
            }
        }

        log.info("User {} deleted together with all data ({} attachment objects)", id, storageKeys.size());
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
    public void RequestPasswordReset(String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        Optional<User> maybeUser = userRepository.GetUserByEmail(email.trim().toLowerCase());
        if (maybeUser.isEmpty()) {
            return;
        }

        User user = maybeUser.get();

        byte[] randomBytes = new byte[PASSWORD_RESET_TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        user.SetPasswordResetToken(hashToken(rawToken), LocalDateTime.now().plus(PASSWORD_RESET_TOKEN_TTL));
        userRepository.SaveUser(user);

        emailService.SendPasswordResetEmail(user.GetEmail(), rawToken);
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

    @Override
    @Transactional
    public void ChangePassword(UUID userId, String oldPassword, String newPassword) {
        if (oldPassword == null || oldPassword.isEmpty()) {
            throw new IllegalArgumentException("Укажите текущий пароль");
        }
        if (newPassword == null || newPassword.isEmpty()) {
            throw new IllegalArgumentException("Укажите новый пароль");
        }

        User user = userRepository.GetUserById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));

        if (!passwordEncoder.matches(oldPassword, user.GetPassword())) {
            throw new IllegalArgumentException("Неверный текущий пароль");
        }

        user.ChangePassword(passwordEncoder.encode(newPassword));
        userRepository.SaveUser(user);
    }

    @Override
    public UserContracts.UserResponse CreateUser(UserContracts.CreateUserRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Укажите имя");
        }
        if (request.surname() == null || request.surname().isBlank()) {
            throw new IllegalArgumentException("Укажите фамилию");
        }
        if (request.email() == null || request.email().isBlank()) {
            throw new IllegalArgumentException("Укажите email");
        }
        if (request.password() == null || request.password().isEmpty()) {
            throw new IllegalArgumentException("Укажите пароль");
        }

        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.GetUserByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("Пользователь с таким email уже зарегистрирован");
        }

        User user = new User(
                UUID.randomUUID(),
                request.name().strip(),
                request.surname().strip(),
                normalizedEmail,
                request.birthdayDate(),
                LocalDateTime.now(),
                passwordEncoder.encode(request.password()),
                request.role()
        );

        return toResponse(userRepository.SaveUser(user));
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