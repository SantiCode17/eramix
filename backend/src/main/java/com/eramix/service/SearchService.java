package com.eramix.service;

import com.eramix.dto.PageResponse;
import com.eramix.dto.user.NearbyUserResponse;
import com.eramix.dto.user.UserProfileResponse;
import com.eramix.dto.user.UserSearchRequest;
import com.eramix.entity.User;
import com.eramix.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final EntityManager entityManager;

    // ── 1. POST /search ── Búsqueda combinada con filtros ─

    @Transactional(readOnly = true)
    public PageResponse<UserProfileResponse> searchUsers(UserSearchRequest request, Long currentUserId) {
        Page<User> page = userRepository.findByFilters(
                request.getDestinationCity(),
                request.getDestinationCountry(),
                request.getUniversityId(),
                PageRequest.of(request.getPage(), request.getSize())
        );

        List<UserProfileResponse> content = page.getContent().stream()
                .filter(u -> !u.getId().equals(currentUserId)) // Excluir usuario actual
                .map(userService::mapToProfileResponse)
                .toList();

        return PageResponse.<UserProfileResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    // ── 2. GET /nearby ── Usuarios cercanos (Haversine) ───

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<NearbyUserResponse> findNearbyUsers(
            Double latitude, Double longitude, Double radiusKm, Long currentUserId) {

        double radius = radiusKm != null ? radiusKm : 50.0;

        Query query = entityManager.createNativeQuery(
                "CALL findUsersNearby(:lat, :lng, :radius, :excludeId)");
        query.setParameter("lat", latitude);
        query.setParameter("lng", longitude);
        query.setParameter("radius", radius);
        query.setParameter("excludeId", currentUserId);

        List<Object[]> results = query.getResultList();

        return results.stream()
                .map(row -> NearbyUserResponse.builder()
                        .id(((Number) row[0]).longValue())
                        .firstName((String) row[1])
                        .lastName((String) row[2])
                        .profilePhotoUrl((String) row[3])
                        .destinationCity((String) row[4])
                        .destinationCountry((String) row[5])
                        .distanceKm(((Number) row[6]).doubleValue())
                        .build())
                .toList();
    }

    // ── 3. GET /by-city ── Usuarios por ciudad ────────────

    @Transactional(readOnly = true)
    public List<UserProfileResponse> findByCity(String city, Long currentUserId) {
        return userRepository.findByDestinationCityIgnoreCase(city).stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .map(userService::mapToProfileResponse)
                .toList();
    }

    // ── 4. GET /by-country ── Usuarios por país ───────────

    @Transactional(readOnly = true)
    public List<UserProfileResponse> findByCountry(String country, Long currentUserId) {
        return userRepository.findByDestinationCountryIgnoreCase(country).stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .map(userService::mapToProfileResponse)
                .toList();
    }
}
