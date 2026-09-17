package ru.rps.notesbook.Domain.Config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.S3Presigner.Builder;

import java.net.URI;

@Configuration
@ConditionalOnProperty(name = "notesbook.storage.enabled", havingValue = "true", matchIfMissing = true)
public class S3Config {

    private static final Logger log = LoggerFactory.getLogger(S3Config.class);

    @Value("${notesbook.storage.endpoint:}")
    private String endpoint;

    @Value("${notesbook.storage.region}")
    private String region;

    @Value("${notesbook.storage.access-key}")
    private String accessKey;

    @Value("${notesbook.storage.secret-key}")
    private String secretKey;

    @Value("${notesbook.storage.bucket}")
    private String bucket;

    @Value("${notesbook.storage.path-style:true}")
    private boolean pathStyleAccess;

    @Bean
    public S3Client s3Client() {
        S3Client client = configureEndpoint(S3Client.builder())
                .credentialsProvider(credentialsProvider())
                .region(Region.of(region))
                .forcePathStyle(pathStyleAccess)
                .build();

        try {
            client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (Exception e) {
            log.warn("Could not verify S3 bucket '{}' on startup (this is OK if the bucket " +
                    "already exists and the credentials are scoped to it): {}", bucket, e.getMessage());
        }

        return client;
    }

    @Bean
    public S3Presigner s3Presigner() {
        Builder builder = S3Presigner.builder()
                .credentialsProvider(credentialsProvider())
                .region(Region.of(region));

        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        return builder.build();
    }

    private StaticCredentialsProvider credentialsProvider() {
        return StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));
    }

    private S3ClientBuilder configureEndpoint(S3ClientBuilder builder) {
        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }
        return builder;
    }

}