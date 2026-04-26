package com.eramix.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Custom Prometheus metrics para EraMix.
 * Usa MeterRegistry (Micrometer) que ya está configurado con Prometheus.
 */
@Configuration
public class MetricsConfig {

    @Bean
    public Counter storyReactionsCounter(MeterRegistry registry) {
        return Counter.builder("eramix.story.reactions")
                .description("Total story reactions")
                .register(registry);
    }

    @Bean
    public Counter messagesSentCounter(MeterRegistry registry) {
        return Counter.builder("eramix.messages.sent")
                .description("Total chat messages sent")
                .register(registry);
    }

    @Bean
    public Counter eventsCreatedCounter(MeterRegistry registry) {
        return Counter.builder("eramix.events.created")
                .description("Total events created")
                .register(registry);
    }

    @Bean
    public Counter searchesPerformedCounter(MeterRegistry registry) {
        return Counter.builder("eramix.searches.performed")
                .description("Total searches performed")
                .register(registry);
    }

    @Bean
    public Counter quizCompletedCounter(MeterRegistry registry) {
        return Counter.builder("eramix.quiz.completed")
                .description("Total quizzes completed")
                .register(registry);
    }

    @Bean
    public Counter usersRegisteredCounter(MeterRegistry registry) {
        return Counter.builder("eramix.users.registered")
                .description("Total users registered")
                .register(registry);
    }

    @Bean
    public Counter imageUploadsCounter(MeterRegistry registry) {
        return Counter.builder("eramix.uploads.images")
                .description("Total images uploaded")
                .register(registry);
    }
}
