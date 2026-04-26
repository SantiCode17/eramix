package com.eramix.config;

import com.eramix.entity.User;
import com.eramix.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class TestUserSeeder {

    @Bean
    public CommandLineRunner initTestUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("test1@eramix.eu").isEmpty()) {
                String hash = passwordEncoder.encode("Test?1234");
                User test1 = User.builder()
                        .email("test1@eramix.eu")
                        .passwordHash(hash)
                        .firstName("Maria")
                        .lastName("Lopez")
                        .isActive(true)
                        .isVerified(true)
                        .build();
                User test2 = User.builder()
                        .email("test2@eramix.eu")
                        .passwordHash(hash)
                        .firstName("Carlos")
                        .lastName("Gomez")
                        .isActive(true)
                        .isVerified(true)
                        .build();
                User test3 = User.builder()
                        .email("test3@eramix.eu")
                        .passwordHash(hash)
                        .firstName("Emma")
                        .lastName("Schmidt")
                        .isActive(true)
                        .isVerified(true)
                        .build();
                User test4 = User.builder()
                        .email("test4@eramix.eu")
                        .passwordHash(hash)
                        .firstName("Luca")
                        .lastName("Rossi")
                        .isActive(true)
                        .isVerified(true)
                        .build();
                userRepository.saveAll(List.of(test1, test2, test3, test4));
                System.out.println("TEST USERS CREATED SUCCESSFULLY");
            }
        };
    }
}
