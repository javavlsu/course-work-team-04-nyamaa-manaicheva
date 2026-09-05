package ru.rps.notesbook.Domain.Interfaces.Storage;

import java.io.InputStream;
import java.time.Duration;

public interface IFileStorageService {

    void Upload(String storageKey, InputStream content, long size, String contentType);

    String GeneratePresignedDownloadUrl(String storageKey, Duration expiry);

    void Delete(String storageKey);

}