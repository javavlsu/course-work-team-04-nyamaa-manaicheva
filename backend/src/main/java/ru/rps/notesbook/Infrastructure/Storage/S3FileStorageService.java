package ru.rps.notesbook.Infrastructure.Storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.InputStream;
import java.time.Duration;

@Component
@ConditionalOnProperty(name = "notesbook.storage.enabled", havingValue = "true", matchIfMissing = true)
public class S3FileStorageService implements IFileStorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucket;

    public S3FileStorageService(
            S3Client s3Client,
            S3Presigner s3Presigner,
            @Value("${notesbook.storage.bucket}") String bucket
    ) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucket = bucket;
    }

    @Override
    public void Upload(String storageKey, InputStream content, long size, String contentType) {
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(storageKey)
                    .contentType(contentType)
                    .contentLength(size)
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(content, size));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload object to storage: " + storageKey, e);
        }
    }

    @Override
    public String GeneratePresignedDownloadUrl(String storageKey, Duration expiry) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(storageKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(expiry)
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(presignRequest);
            return presigned.url().toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate presigned download url: " + storageKey, e);
        }
    }

    @Override
    public void Delete(String storageKey) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(storageKey)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete object from storage: " + storageKey, e);
        }
    }

}
