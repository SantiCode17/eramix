package com.eramix.service;

import com.eramix.dto.places.*;
import com.eramix.entity.UserPlace;
import com.eramix.repository.UserPlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserPlaceService {

    private final UserPlaceRepository repo;

    public List<UserPlaceResponse> getPlaces(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserPlaceResponse createPlace(Long userId, CreateUserPlaceRequest req) {
        UserPlace place = UserPlace.builder()
                .userId(userId)
                .name(req.getName())
                .description(req.getDescription())
                .category(req.getCategory() != null ? req.getCategory().toUpperCase() : "OTHER")
                .priority(req.getPriority() != null ? req.getPriority().toUpperCase() : "MEDIUM")
                .mapsUrl(req.getMapsUrl())
                .notes(req.getNotes())
                .targetDate(req.getTargetDate())
                .visited(false)
                .build();
        return toResponse(repo.save(place));
    }

    @Transactional
    public UserPlaceResponse updatePlace(Long id, Long userId, UpdateUserPlaceRequest req) {
        UserPlace place = repo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Place not found"));

        if (req.getName() != null) place.setName(req.getName());
        if (req.getDescription() != null) place.setDescription(req.getDescription());
        if (req.getCategory() != null) place.setCategory(req.getCategory().toUpperCase());
        if (req.getPriority() != null) place.setPriority(req.getPriority().toUpperCase());
        if (req.getVisited() != null) place.setVisited(req.getVisited());
        if (req.getRating() != null) place.setRating(req.getRating());
        if (req.getMapsUrl() != null) place.setMapsUrl(req.getMapsUrl());
        if (req.getNotes() != null) place.setNotes(req.getNotes());
        if (req.getTargetDate() != null) place.setTargetDate(req.getTargetDate());

        return toResponse(repo.save(place));
    }

    @Transactional
    public void deletePlace(Long id, Long userId) {
        UserPlace place = repo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Place not found"));
        repo.delete(place);
    }

    private UserPlaceResponse toResponse(UserPlace p) {
        return UserPlaceResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .category(p.getCategory())
                .priority(p.getPriority())
                .visited(p.getVisited())
                .rating(p.getRating())
                .mapsUrl(p.getMapsUrl())
                .notes(p.getNotes())
                .targetDate(p.getTargetDate())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
