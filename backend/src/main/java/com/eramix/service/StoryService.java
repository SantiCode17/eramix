package com.eramix.service;

import com.eramix.dto.story.StoryResponse;
import com.eramix.entity.Story;
import com.eramix.entity.StoryView;
import com.eramix.entity.User;
import com.eramix.exception.UserNotFoundException;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoryService {

    private final StoryRepository storyRepository;
    private final StoryViewRepository storyViewRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final FileStorageService fileStorageService;

    // ── 1. POST / ── Crear story con upload ───────────────

    @Transactional
    public StoryResponse createStory(Long userId, MultipartFile file, String caption) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        String mediaUrl = fileStorageService.storePhoto(file);

        Story story = Story.builder()
                .user(user)
                .mediaUrl(mediaUrl)
                .caption(caption)
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();

        story = storyRepository.save(story);
        return mapToResponse(story, userId);
    }

    // ── 2. DELETE /{id} ── Eliminar story ─────────────────

    @Transactional
    public void deleteStory(Long storyId, Long userId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new IllegalArgumentException("Story no encontrada"));

        if (!story.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Solo puedes eliminar tus propias stories");
        }

        fileStorageService.deleteFile(story.getMediaUrl());
        storyRepository.delete(story);
    }

    // ── 3. POST /{id}/view ── Registrar visualización ────

    @Transactional
    public void viewStory(Long storyId, Long viewerId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new IllegalArgumentException("Story no encontrada"));

        // No registrar si es del propio usuario o ya fue vista
        if (story.getUser().getId().equals(viewerId)) return;
        if (storyViewRepository.existsByStoryIdAndViewerId(storyId, viewerId)) return;

        User viewer = userRepository.findById(viewerId)
                .orElseThrow(() -> new UserNotFoundException(viewerId));

        StoryView view = StoryView.builder()
                .story(story)
                .viewer(viewer)
                .viewedAt(Instant.now())
                .build();

        storyViewRepository.save(view);
    }

    // ── 4. GET /feed ── Stories activas (amigos + propias)

    @Transactional(readOnly = true)
    public List<StoryResponse> getStoryFeed(Long userId) {
        Instant now = Instant.now();

        // Obtener IDs de amigos
        List<Long> friendIds = friendshipRepository.findAllByUserId(userId).stream()
                .map(f -> f.getUser1().getId().equals(userId)
                        ? f.getUser2().getId()
                        : f.getUser1().getId())
                .toList();

        // Stories del usuario + amigos
        List<Story> myStories = storyRepository.findActiveByUserId(userId, now);
        List<Story> friendStories = friendIds.stream()
                .flatMap(fId -> storyRepository.findActiveByUserId(fId, now).stream())
                .toList();

        return Stream.concat(myStories.stream(), friendStories.stream())
                .map(s -> mapToResponse(s, userId))
                .toList();
    }

    // ── 5. GET /user/{userId} ── Stories de un usuario ────

    @Transactional(readOnly = true)
    public List<StoryResponse> getUserStories(Long targetUserId, Long currentUserId) {
        Instant now = Instant.now();
        return storyRepository.findActiveByUserId(targetUserId, now).stream()
                .map(s -> mapToResponse(s, currentUserId))
                .toList();
    }

    // ── Mapper ────────────────────────────────────────────

    private StoryResponse mapToResponse(Story s, Long currentUserId) {
        long viewCount = storyViewRepository.countByStoryId(s.getId());
        boolean viewed = storyViewRepository.existsByStoryIdAndViewerId(s.getId(), currentUserId);

        return StoryResponse.builder()
                .id(s.getId())
                .userId(s.getUser().getId())
                .userFirstName(s.getUser().getFirstName())
                .userLastName(s.getUser().getLastName())
                .userProfilePhotoUrl(s.getUser().getProfilePhotoUrl())
                .mediaUrl(s.getMediaUrl())
                .caption(s.getCaption())
                .createdAt(s.getCreatedAt())
                .expiresAt(s.getExpiresAt())
                .viewCount(viewCount)
                .viewedByCurrentUser(viewed)
                .build();
    }
}
