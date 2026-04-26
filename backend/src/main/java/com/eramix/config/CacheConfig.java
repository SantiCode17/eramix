package com.eramix.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // ObjectMapper con soporte para Java 8 date/time (Instant, etc.)
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                mapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL);

        GenericJackson2JsonRedisSerializer serializer =
                new GenericJackson2JsonRedisSerializer(mapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(serializer));

        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        cacheConfigurations.put("exchangeRates", defaultConfig.entryTtl(Duration.ofHours(6)));
        cacheConfigurations.put("emergencyResources", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigurations.put("categories", defaultConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigurations.put("userProfiles", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("upcomingEvents", defaultConfig.entryTtl(Duration.ofMinutes(3)));
        cacheConfigurations.put("eventSearch", defaultConfig.entryTtl(Duration.ofMinutes(2)));
        cacheConfigurations.put("quizQuestions", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("achievements", defaultConfig.entryTtl(Duration.ofHours(6)));
        cacheConfigurations.put("leaderboard", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("globalSearch", defaultConfig.entryTtl(Duration.ofMinutes(2)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }
}
