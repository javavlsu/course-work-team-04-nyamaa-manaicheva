package ru.rps.notesbook.Domain.Services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.AdminContracts;
import ru.rps.notesbook.API.Contracts.UserContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IAdminService;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;
import ru.rps.notesbook.Domain.Models.User;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class AdminService implements IAdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private static final String LOG_FILE_NAME = "notesbook.log";
    private static final int DEFAULT_LOG_LINES = 500;
    private static final int MAX_LOG_LINES = 5000;
    private static final long MAX_TAIL_BYTES = 1024L * 1024;

    private final IUserRepository userRepository;
    private final IFileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final Path logFile;

    @Autowired
    public AdminService(
            IUserRepository userRepository,
            IFileStorageService fileStorageService,
            PasswordEncoder passwordEncoder,
            @Value("${logging.file.path:logs}") String logDirectory
    ) {
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.passwordEncoder = passwordEncoder;
        this.logFile = Paths.get(logDirectory).resolve(LOG_FILE_NAME);
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

        User saved = userRepository.SaveUser(user);

        return new UserContracts.UserResponse(
                saved.GetId(),
                saved.GetName(),
                saved.GetSurname(),
                saved.GetEmail(),
                saved.GetBirthdayDate(),
                saved.GetRegistrationDate(),
                saved.GetRole()
        );
    }

    @Override
    public void DeleteUserWithAllData(UUID targetUserId, UUID actorUserId) {
        if (targetUserId.equals(actorUserId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Нельзя удалить собственную учётную запись"
            );
        }

        userRepository.GetUserById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> storageKeys = userRepository.DeleteUserWithAllData(targetUserId);

        for (String storageKey : storageKeys) {
            try {
                fileStorageService.Delete(storageKey);
            } catch (RuntimeException e) {
                log.error("Failed to delete storage object (key={}) of removed user {}; metadata already removed",
                        storageKey, targetUserId, e);
            }
        }

        log.info("User {} deleted by admin {} together with all data ({} attachment objects)",
                targetUserId, actorUserId, storageKeys.size());
    }

    @Override
    public AdminContracts.LogsResponse GetLogs(Integer lines) {
        int limit = lines == null ? DEFAULT_LOG_LINES : Math.min(Math.max(lines, 1), MAX_LOG_LINES);

        if (!Files.isRegularFile(logFile)) {
            return new AdminContracts.LogsResponse(false, "");
        }

        try (RandomAccessFile file = new RandomAccessFile(logFile.toFile(), "r")) {
            long length = file.length();
            long start = Math.max(0, length - MAX_TAIL_BYTES);
            byte[] buffer = new byte[(int) (length - start)];
            file.seek(start);
            file.readFully(buffer);

            String text = new String(buffer, StandardCharsets.UTF_8);
            String[] allLines = text.split("\\R", -1);

            int from = start > 0 ? 1 : 0;
            int to = allLines.length > 0 && allLines[allLines.length - 1].isEmpty()
                    ? allLines.length - 1
                    : allLines.length;

            if (from >= to) {
                return new AdminContracts.LogsResponse(true, "");
            }

            int tailFrom = Math.max(from, to - limit);
            String content = String.join("\n", Arrays.copyOfRange(allLines, tailFrom, to));
            return new AdminContracts.LogsResponse(true, content);
        } catch (IOException e) {
            log.error("Failed to read log file {}", logFile, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Не удалось прочитать лог-файл");
        }
    }

}