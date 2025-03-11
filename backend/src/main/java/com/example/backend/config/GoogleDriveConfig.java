package com.example.backend.config;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.microsoft.graph.authentication.TokenCredentialAuthProvider;
import com.microsoft.graph.requests.GraphServiceClient;
import lombok.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class AzureConfig {

    @Value("${azure.client-id}")
    private String clientId;

    @Value("${azure.client-secret}")
    private String clientSecret;

    @Value("${azure.tenant-id}")
    private String tenantId;

    @Bean
    public ClientSecretCredential clientSecretCredential() {
        return new ClientSecretCredentialBuilder()
                .clientId(clientId)
                .clientSecret(clientSecret)
                .tenantId(tenantId)
                .build();
    }

    @Bean
    public TokenCredentialAuthProvider tokenCredentialAuthProvider(ClientSecretCredential clientSecretCredential) {
        return new TokenCredentialAuthProvider(
                Arrays.asList("Files.ReadWrite", "User.Read"),
                clientSecretCredential
        );
    }

    @Bean
    public GraphServiceClient graphServiceClient(TokenCredentialAuthProvider tokenCredentialAuthProvider) {
        return GraphServiceClient
                .builder()
                .authenticationProvider(tokenCredentialAuthProvider)
                .buildClient();
    }

}
