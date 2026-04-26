package com.eramix.service;

import com.eramix.dto.user.SmartMatchResponse;
import com.eramix.entity.Interest;
import com.eramix.entity.User;
import com.eramix.entity.UserLanguage;
import com.eramix.exception.UserNotFoundException;
import com.eramix.repository.FriendshipRepository;
import com.eramix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmartMatchService {

    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;

    /**
     * Returns smart-match suggestions: users in the same destination city/country
     * ranked by compatibility (shared interests + shared languages).
     */
    @Transactional(readOnly = true)
    public List<SmartMatchResponse> getSuggestions(Long userId, int limit) {
        User currentUser = userRepository.findByIdWithProfile(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Get users in the same destination city (or country as fallback)
        List<User> candidates;
        if (currentUser.getDestinationCity() != null && !currentUser.getDestinationCity().isBlank()) {
            candidates = userRepository.findByDestinationCityIgnoreCase(currentUser.getDestinationCity());
        } else if (currentUser.getDestinationCountry() != null && !currentUser.getDestinationCountry().isBlank()) {
            candidates = userRepository.findByDestinationCountryIgnoreCase(currentUser.getDestinationCountry());
        } else {
            // Fallback: return random active users
            candidates = userRepository.findByFilters(null, null, null, PageRequest.of(0, limit * 2))
                    .getContent();
        }

        // Exclude current user and existing friends
        Set<Long> friendIds = friendshipRepository.findFriendIdsByUserId(userId);
        friendIds.add(userId);

        Set<String> myInterests = currentUser.getInterests().stream()
                .map(Interest::getName)
                .collect(Collectors.toSet());

        Set<String> myLanguages = currentUser.getUserLanguages().stream()
                .map(ul -> ul.getLanguage().getName())
                .collect(Collectors.toSet());

        return candidates.stream()
                .filter(u -> !friendIds.contains(u.getId()))
                .filter(u -> u.getIsActive() != null && u.getIsActive())
                .map(u -> {
                    // Calculate compatibility
                    Set<String> theirInterests = u.getInterests().stream()
                            .map(Interest::getName)
                            .collect(Collectors.toSet());
                    Set<String> theirLanguages = u.getUserLanguages().stream()
                            .map(ul -> ul.getLanguage().getName())
                            .collect(Collectors.toSet());

                    List<String> sharedInterests = myInterests.stream()
                            .filter(theirInterests::contains)
                            .toList();
                    List<String> sharedLanguages = myLanguages.stream()
                            .filter(theirLanguages::contains)
                            .toList();

                    int score = (sharedInterests.size() * 15) + (sharedLanguages.size() * 20);
                    // Bonus for same city
                    if (currentUser.getDestinationCity() != null &&
                            currentUser.getDestinationCity().equalsIgnoreCase(u.getDestinationCity())) {
                        score += 10;
                    }
                    score = Math.min(score, 100);

                    return SmartMatchResponse.builder()
                            .id(u.getId())
                            .firstName(u.getFirstName())
                            .lastName(u.getLastName())
                            .profilePhotoUrl(u.getProfilePhotoUrl())
                            .destinationCity(u.getDestinationCity())
                            .destinationCountry(u.getDestinationCountry())
                            .bio(u.getBio())
                            .compatibilityScore(score)
                            .sharedInterests(sharedInterests)
                            .sharedLanguages(sharedLanguages)
                            .build();
                })
                .sorted(Comparator.comparingInt(SmartMatchResponse::getCompatibilityScore).reversed())
                .limit(limit)
                .toList();
    }

    /** Like — currently a no-op, can be extended to track preferences */
    public void likeSuggestion(Long userId, Long targetUserId) {
        log.info("User {} liked smart-match suggestion {}", userId, targetUserId);
    }

    /** Skip — currently a no-op, can be extended to track preferences */
    public void skipSuggestion(Long userId, Long targetUserId) {
        log.info("User {} skipped smart-match suggestion {}", userId, targetUserId);
    }
}
