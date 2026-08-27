package com.zoqel.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "zoqel.ollama")
@Getter
@Setter
public class OllamaConfig {

    private String apiKey;
    private String baseUrl;
    private String model;
    private String siteUrl;
    private String siteName;

    @Bean
    public RestClient ollamaClient() {
        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("HTTP-Referer", siteUrl)
                .defaultHeader("X-Title", siteName)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
