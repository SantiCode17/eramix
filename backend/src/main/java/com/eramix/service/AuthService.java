package com.eramix.service;

import com.eramix.dto.auth.*;
import com.eramix.dto.user.UserProfileResponse;
import com.eramix.entity.RefreshToken;
import com.eramix.entity.University;
import com.eramix.entity.User;
import com.eramix.exception.*;
import com.eramix.repository.RefreshTokenRepository;
import com.eramix.repository.UniversityRepository;
import com.eramix.repository.UserRepository;
import com.eramix.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UniversityRepository universityRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    /**
     * In-memory store for password reset tokens (dev only).
     * Key = token, Value = { userId, expiresAt }.
     * In production this would be a DB table or Redis.
     */
    private final Map<String, PasswordResetEntry> resetTokens = new ConcurrentHashMap<>();

    // ── Register ───────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .dateOfBirth(request.getDateOfBirth())
                .destinationCity(request.getDestinationCity())
                .destinationCountry(request.getDestinationCountry())
                .mobilityStart(request.getMobilityStartDate())
                .mobilityEnd(request.getMobilityEndDate())
                .isVerified(false)
                .isActive(true)
                .build();

        if (request.getHomeUniversityId() != null) {
            University home = universityRepository.findById(request.getHomeUniversityId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Universidad de origen no encontrada: " + request.getHomeUniversityId()));
            user.setHomeUniversity(home);
        }
        if (request.getHostUniversityId() != null) {
            University host = universityRepository.findById(request.getHostUniversityId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Universidad de destino no encontrada: " + request.getHostUniversityId()));
            user.setHostUniversity(host);
        }

        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    // ── Login ──────────────────────────────────────────────

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        if (!user.getIsActive()) {
            throw new InvalidCredentialsException("La cuenta está desactivada");
        }

        user.setLastSeen(Instant.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    // ── Refresh ────────────────────────────────────────────

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.getRefreshToken());

        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Refresh token no encontrado"));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(stored);
            throw new TokenExpiredException("El refresh token ha expirado");
        }

        // Rotation: delete old, generate new pair
        refreshTokenRepository.delete(stored);

        User user = stored.getUser();
        user.setLastSeen(Instant.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    // ── Logout ─────────────────────────────────────────────

    @Transactional
    public void logout(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.getRefreshToken());
        refreshTokenRepository.findByTokenHash(tokenHash)
                .ifPresent(refreshTokenRepository::delete);
    }

    // ── Forgot Password ────────────────────────────────────

    public Map<String, String> forgotPassword(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new UserNotFoundException("No existe un usuario con ese email"));

        // Generate 32-byte URL-safe token
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        String resetToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        resetTokens.put(resetToken, new PasswordResetEntry(
                user.getId(),
                Instant.now().plusSeconds(3600) // 1 hour
        ));

        // In development: return token directly. In prod: send via email.
        return Map.of("resetToken", resetToken,
                       "message", "Token de recuperación generado (válido 1 hora)");
    }

    // ── Reset Password ─────────────────────────────────────

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetEntry entry = resetTokens.remove(token);
        if (entry == null) {
            throw new InvalidTokenException("Token de recuperación inválido o ya utilizado");
        }
        if (entry.expiresAt().isBefore(Instant.now())) {
            throw new TokenExpiredException("El token de recuperación ha expirado");
        }

        User user = userRepository.findById(entry.userId())
                .orElseThrow(() -> new UserNotFoundException(entry.userId()));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Revoke all refresh tokens
        refreshTokenRepository.deleteAllByUserId(user.getId());
    }

    // ── Delete Account ─────────────────────────────────────

    @Transactional
    public void deleteAccount(Long userId, String passwordConfirmation) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!passwordEncoder.matches(passwordConfirmation, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Contraseña incorrecta");
        }

        // Cascade delete: FK constraints in DB handle related records
        refreshTokenRepository.deleteAllByUserId(userId);
        userRepository.delete(user);
    }

    // ── Helpers ────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken();

        // Store hashed refresh token
        RefreshToken entity = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(refreshToken))
                .expiresAt(Instant.now().plusMillis(
                        jwtTokenProvider.getRefreshTokenExpirationMs()))
                .build();
        refreshTokenRepository.save(entity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(mapToProfile(user))
                .build();
    }

    private UserProfileResponse mapToProfile(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .dateOfBirth(user.getDateOfBirth())
                .bio(user.getBio())
                .destinationCity(user.getDestinationCity())
                .destinationCountry(user.getDestinationCountry())
                .mobilityStartDate(user.getMobilityStart())
                .mobilityEndDate(user.getMobilityEnd())
                .isActive(user.getIsActive())
                .isVerified(user.getIsVerified())
                .lastSeen(user.getLastSeen())
                .createdAt(user.getCreatedAt())
                .interests(Collections.emptyList())
                .languages(Collections.emptyList())
                .photos(Collections.emptyList())
                .friendCount(0L)
                .eventCount(0L)
                .build();
    }

    /**
     * SHA-256 hash of a token for secure storage.
     */
    private String hashToken(String token) {
        try {
            java.security.MessageDigest digest =
                    java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hash);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 no disponible", e);
        }
    }

    private record PasswordResetEntry(Long userId, Instant expiresAt) {}
}
