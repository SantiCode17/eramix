package com.eramix.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // React Native / Expo sends requests without an Origin header from
        // physical devices and emulators.  We must use allowedOriginPatterns
        // with a wildcard so that requests with *no* Origin (null) or any
        // origin are accepted.  setAllowedOrigins does NOT support "*" when
        // credentials are enabled, but setAllowedOriginPatterns does.
        List<String> patterns = new java.util.ArrayList<>();
        patterns.add("*"); // allow any origin (mobile apps have no fixed origin)
        // Also add explicit origins from config for web clients
        Arrays.stream(allowedOrigins.split(","))
              .map(String::trim)
              .filter(s -> !s.isEmpty())
              .forEach(patterns::add);

        configuration.setAllowedOriginPatterns(patterns);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
