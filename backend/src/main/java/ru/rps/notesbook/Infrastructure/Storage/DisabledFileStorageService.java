package ru.rps.notesbook.Infrastructure.Storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;

import java.io.InputStream;
import java.time.Duration;

// Временная заглушка хранилища при отключённом MinIO (notesbook.storage.enabled=false).
// Даёт приложению стартовать без MinIO; файловые операции выдают понятную ошибку,
// UI фронтенда при этом скрывает вложения. Чтобы вернуть MinIO: включите флаг
// notesbook.storage.enabled=true (MINIO_ENABLED=true) — этот класс отключится сам.
@Component
@ConditionalOnProperty(name = "notesbook.storage.enabled", havingValue = "false", matchIfMissing = true)
public class DisabledFileStorageService implements IFileStorageService {

    private static final String DISABLED_MESSAGE = "File storage (MinIO) temporarily disabled";

    @Override
    public void Upload(String storageKey, InputStream content, long size, String contentType) {
        throw new RuntimeException(DISABLED_MESSAGE);
    }

    @Override
    public String GeneratePresignedDownloadUrl(String storageKey, Duration expiry) {
        throw new RuntimeException(DISABLED_MESSAGE);
    }

    @Override
    public void Delete(String storageKey) {
        throw new RuntimeException(DISABLED_MESSAGE);
    }

}