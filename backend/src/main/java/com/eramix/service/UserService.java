package com.eramix.service;

import com.eramix.dto.user.*;
import com.eramix.entity.*;
import com.eramix.entity.enums.ProficiencyLevel;
import com.eramix.exception.UserNotFoundException;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final InterestRepository interestRepository;
    private final LanguageRepository languageRepository;
    private final UserLanguageRepository userLanguageRepository;
    private final UserPhotoRepository userPhotoRepository;
    private final UniversityRepository universityRepository;
    private final FriendshipRepository friendshipRepository;
    private final EventRepository eventRepository;
    private final FileStorageService fileStorageService;

    // ── 1. GET /me  ── Mi perfil ──────────────────────────

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(Long userId) {
        return getProfile(userId);
    }

    // ── 2. GET /{id} ── Perfil público ────────────────────

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findByIdWithProfile(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return mapToProfileResponse(user);
    }

    // ── 3. PUT /me ── Actualizar perfil ───────────────────

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findByIdWithProfile(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getDestinationCity() != null) user.setDestinationCity(request.getDestinationCity());
        if (request.getDestinationCountry() != null) user.setDestinationCountry(request.getDestinationCountry());
        if (request.getMobilityStartDate() != null) user.setMobilityStart(request.getMobilityStartDate());
        if (request.getMobilityEndDate() != null) user.setMobilityEnd(request.getMobilityEndDate());

        if (request.getHomeUniversityId() != null) {
            University home = universityRepository.findById(request.getHomeUniversityId())
                    .orElseThrow(() -> new IllegalArgumentException("Universidad de origen no encontrada"));
            user.setHomeUniversity(home);
        }
        if (request.getHostUniversityId() != null) {
            University host = universityRepository.findById(request.getHostUniversityId())
                    .orElseThrow(() -> new IllegalArgumentException("Universidad de destino no encontrada"));
            user.setHostUniversity(host);
        }

        // Reemplazar intereses
        if (request.getInterestIds() != null) {
            Set<Interest> interests = new HashSet<>(interestRepository.findAllById(request.getInterestIds()));
            user.setInterests(interests);
        }

        // Reemplazar idiomas
        if (request.getLanguages() != null) {
            user.getUserLanguages().clear();
            for (UserLanguageRequest langReq : request.getLanguages()) {
                Language language = languageRepository.findById(langReq.getLanguageId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Idioma no encontrado: " + langReq.getLanguageId()));
                UserLanguage ul = UserLanguage.builder()
                        .user(user)
                        .language(language)
                        .proficiencyLevel(ProficiencyLevel.valueOf(langReq.getProficiencyLevel()))
                        .build();
                user.getUserLanguages().add(ul);
            }
        }

        return mapToProfileResponse(userRepository.save(user));
    }

    // ── 4. PUT /me/photo ── Foto de perfil ────────────────

    @Transactional
    public UserProfileResponse updateProfilePhoto(Long userId, MultipartFile file) {
        User user = userRepository.findByIdWithProfile(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Eliminar foto anterior si existe
        if (user.getProfilePhotoUrl() != null) {
            fileStorageService.deleteFile(user.getProfilePhotoUrl());
        }

        String url = fileStorageService.storePhoto(file);
        user.setProfilePhotoUrl(url);
        return mapToProfileResponse(userRepository.save(user));
    }

    // ── 5. POST /me/photos ── Añadir foto adicional ──────

    @Transactional
    public UserPhotoResponse addPhoto(Long userId, MultipartFile file, Integer displayOrder) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        long count = userPhotoRepository.countByUserId(userId);
        if (count >= 6) {
            throw new IllegalArgumentException("Máximo 6 fotos permitidas");
        }

        String url = fileStorageService.storePhoto(file);
        int order = displayOrder != null ? displayOrder : (int) count;

        UserPhoto photo = UserPhoto.builder()
                .user(user)
                .photoUrl(url)
                .displayOrder(order)
                .build();

        photo = userPhotoRepository.save(photo);
        return mapToPhotoResponse(photo);
    }

    // ── 6. DELETE /me/photos/{photoId} ── Eliminar foto ──

    @Transactional
    public void deletePhoto(Long userId, Long photoId) {
        UserPhoto photo = userPhotoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("Foto no encontrada"));

        if (!photo.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("No tienes permiso para eliminar esta foto");
        }

        fileStorageService.deleteFile(photo.getPhotoUrl());
        userPhotoRepository.delete(photo);
    }

    // ── 7. GET /me/photos ── Listar mis fotos ────────────

    @Transactional(readOnly = true)
    public List<UserPhotoResponse> getPhotos(Long userId) {
        return userPhotoRepository.findByUserIdOrderByDisplayOrderAsc(userId)
                .stream()
                .map(this::mapToPhotoResponse)
                .toList();
    }

    // ── 8. PUT /me/location ── Actualizar ubicación ──────

    @Transactional
    public UserProfileResponse updateLocation(Long userId, LocationUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.setLatitude(BigDecimal.valueOf(request.getLatitude()));
        user.setLongitude(BigDecimal.valueOf(request.getLongitude()));
        user.setLocationUpdatedAt(Instant.now());

        return mapToProfileResponse(userRepository.save(user));
    }

    // ── Mappers ───────────────────────────────────────────

    public UserProfileResponse mapToProfileResponse(User user) {
        long friendCount = friendshipRepository.countByUserId(user.getId());
        long eventCount = eventRepository.countByCreatorId(user.getId());

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .dateOfBirth(user.getDateOfBirth())
                .bio(user.getBio())
                .homeUniversity(mapUniversity(user.getHomeUniversity()))
                .hostUniversity(mapUniversity(user.getHostUniversity()))
                .destinationCity(user.getDestinationCity())
                .destinationCountry(user.getDestinationCountry())
                .mobilityStartDate(user.getMobilityStart())
                .mobilityEndDate(user.getMobilityEnd())
                .latitude(user.getLatitude() != null ? user.getLatitude().doubleValue() : null)
                .longitude(user.getLongitude() != null ? user.getLongitude().doubleValue() : null)
                .locationUpdatedAt(user.getLocationUpdatedAt())
                .isActive(user.getIsActive())
                .isVerified(user.getIsVerified())
                .lastSeen(user.getLastSeen())
                .createdAt(user.getCreatedAt())
                .interests(user.getInterests().stream()
                        .map(i -> UserProfileResponse.InterestSummary.builder()
                                .id(i.getId())
                                .name(i.getName())
                                .category(i.getCategory())
                                .emoji(i.getEmoji())
                                .build())
                        .toList())
                .languages(user.getUserLanguages().stream()
                        .map(ul -> UserProfileResponse.UserLanguageSummary.builder()
                                .id(ul.getLanguage().getId())
                                .code(ul.getLanguage().getCode())
                                .name(ul.getLanguage().getName())
                                .proficiencyLevel(ul.getProficiencyLevel().name())
                                .build())
                        .toList())
                .photos(user.getPhotos().stream()
                        .map(this::mapToPhotoResponse)
                        .toList())
                .friendCount(friendCount)
                .eventCount(eventCount)
                .build();
    }

    private UserProfileResponse.UniversitySummary mapUniversity(University u) {
        if (u == null) return null;
        return UserProfileResponse.UniversitySummary.builder()
                .id(u.getId())
                .name(u.getName())
                .city(u.getCity())
                .country(u.getCountry())
                .build();
    }

    private UserPhotoResponse mapToPhotoResponse(UserPhoto photo) {
        return UserPhotoResponse.builder()
                .id(photo.getId())
                .photoUrl(photo.getPhotoUrl())
                .displayOrder(photo.getDisplayOrder())
                .createdAt(photo.getCreatedAt())
                .build();
    }
}
