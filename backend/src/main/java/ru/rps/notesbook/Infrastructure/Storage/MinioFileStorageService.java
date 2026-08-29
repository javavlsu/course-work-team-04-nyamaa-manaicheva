package ru.rps.notesbook.Infrastructure.Storage;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.Http;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;

import java.io.InputStream;
import java.time.Duration;

@Component
public class MinioFileStorageService implements IFileStorageService {

    private final MinioClient minioClient;
    private final String bucket;

    public MinioFileStorageService(
            MinioClient minioClient,
            @Value("${notesbook.storage.bucket}") String bucket
    ) {
        this.minioClient = minioClient;
        this.bucket = bucket;
    }

    @Override
    public void Upload(String storageKey, InputStream content, long size, String contentType) {
        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(storageKey)
                    .stream(content, size, -1L)
                    .contentType(contentType)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload object to storage: " + storageKey, e);
        }
    }

    @Override
    public String GeneratePresignedDownloadUrl(String storageKey, Duration expiry) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Http.Method.GET)
                    .bucket(bucket)
                    .object(storageKey)
                    .expiry((int) expiry.toSeconds())
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate presigned download url: " + storageKey, e);
        }
    }

    @Override
    public void Delete(String storageKey) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(storageKey)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete object from storage: " + storageKey, e);
        }
    }

}