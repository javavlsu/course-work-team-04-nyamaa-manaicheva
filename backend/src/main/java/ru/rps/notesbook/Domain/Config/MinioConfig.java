package ru.rps.notesbook.Domain.Config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Value("${notesbook.storage.endpoint}")
    private String endpoint;

    @Value("${notesbook.storage.public-endpoint}")
    private String publicEndpoint;

    @Value("${notesbook.storage.access-key}")
    private String accessKey;

    @Value("${notesbook.storage.secret-key}")
    private String secretKey;

    @Value("${notesbook.storage.bucket}")
    private String bucket;

    @Bean
    public MinioClient minioClient() {
        MinioClient client = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();

        try {
            boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize MinIO bucket '" + bucket + "'", e);
        }

        return client;
    }

    @Bean
    public MinioClient minioPresignClient() {
        return MinioClient.builder()
                .endpoint(publicEndpoint)
                .credentials(accessKey, secretKey)
                .build();
    }

}