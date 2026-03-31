package com.eramix.event;

import com.eramix.entity.Community;
import com.eramix.entity.enums.CommunityCategory;
import com.eramix.service.CommunityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Listener que auto-crea comunidades de universidad y ciudad
 * cuando un usuario se registra, y lo agrega como miembro.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserRegisteredEventListener {

    private final CommunityService communityService;

    @Async
    @EventListener
    @Transactional
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Processing auto-community assignment for userId={}", event.getUserId());

        try {
            // Auto-create/join host university community
            if (event.getUniversityName() != null && !event.getUniversityName().isBlank()) {
                String communityName = event.getUniversityName();
                Community university = communityService.getOrCreateCommunity(
                        communityName,
                        CommunityCategory.UNIVERSITY,
                        "Comunidad de estudiantes Erasmus en " + communityName
                );
                communityService.addMemberToCommunity(university.getId(), event.getUserId());
                log.info("User {} joined university community: {}", event.getUserId(), communityName);
            }

            // Auto-create/join destination city community
            if (event.getDestinationCity() != null && !event.getDestinationCity().isBlank()) {
                String cityName = "Erasmus en " + event.getDestinationCity();
                String description = "Comunidad de estudiantes Erasmus en " + event.getDestinationCity();
                if (event.getDestinationCountry() != null) {
                    description += ", " + event.getDestinationCountry();
                }
                Community city = communityService.getOrCreateCommunity(
                        cityName,
                        CommunityCategory.CITY,
                        description
                );
                communityService.addMemberToCommunity(city.getId(), event.getUserId());
                log.info("User {} joined city community: {}", event.getUserId(), cityName);
            }

        } catch (Exception e) {
            log.error("Error processing auto-community for userId={}: {}", event.getUserId(), e.getMessage(), e);
        }
    }
}
