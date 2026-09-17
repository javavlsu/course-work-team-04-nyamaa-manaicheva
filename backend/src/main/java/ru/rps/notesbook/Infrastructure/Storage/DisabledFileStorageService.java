package ru.rps.notesbook.Infrastructure.Storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;

import java.io.InputStream;
import java.time.Duration;

@Component
@ConditionalOnProperty(name = "notesbook.storage.enabled", havingValue = "false")
public class DisabledFileStorageService implements IFileStorageService {

    private static final String DISABLED_MESSAGE = "File storage (S3) is disabled";

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
