package com.eramix.service;

import com.eramix.dto.wellbeing.*;
import com.eramix.entity.*;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WellbeingService {

    private final WellbeingCheckinRepository checkinRepo;
    private final EmergencyResourceRepository resourceRepo;
    private final SOSActivationRepository sosRepo;
    private final EmergencyContactRepository contactRepo;

    // ── Check-ins ────────────────────────────────────────────────────────

    @Transactional
    public CheckinResponse createCheckin(Long userId, CheckinRequest req) {
        WellbeingCheckin checkin = WellbeingCheckin.builder()
                .userId(userId)
                .moodScore(req.getMoodScore())
                .build();
        checkin = checkinRepo.save(checkin);
        return toCheckinResponse(checkin);
    }

    public List<CheckinResponse> getCheckins(Long userId) {
        return checkinRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toCheckinResponse).toList();
    }

    // ── Summary ──────────────────────────────────────────────────────────

    public WellbeingSummaryResponse getSummary(Long userId, String countryCode) {
        Instant now = Instant.now();
        Instant days7 = now.minus(7, ChronoUnit.DAYS);
        Instant days30 = now.minus(30, ChronoUnit.DAYS);

        Double avg7 = checkinRepo.averageMoodSince(userId, days7);
        Double avg30 = checkinRepo.averageMoodSince(userId, days30);
        Long total = checkinRepo.countCheckinsSince(userId, days30);

        // Determine trend
        String trend = "STABLE";
        if (avg7 != null && avg30 != null) {
            if (avg7 > avg30 + 0.5) trend = "IMPROVING";
            else if (avg7 < avg30 - 0.5) trend = "DECLINING";
        }

        // Mood history
        List<WellbeingCheckin> recent = checkinRepo.findByUserIdSince(userId, days30);
        List<WellbeingSummaryResponse.DailyMood> history = recent.stream()
                .map(c -> WellbeingSummaryResponse.DailyMood.builder()
                        .date(c.getCreatedAt().toString())
                        .moodScore(c.getMoodScore())
                        .build())
                .toList();

        // Emergency resources
        List<EmergencyResource> resources = countryCode != null
                ? resourceRepo.findByCountryCode(countryCode)
                : List.of();
        List<WellbeingSummaryResponse.ResourceItem> resourceItems = resources.stream()
                .map(r -> {
                    return WellbeingSummaryResponse.ResourceItem.builder()
                        .name(r.getOrganizationName())
                        .phone(r.getEmergencyNumber())
                        .url(r.getInfoUrl())
                        .type("emergency")
                        .build();
                })
                .toList();

        return WellbeingSummaryResponse.builder()
                .averageMood7d(avg7)
                .averageMood30d(avg30)
                .totalCheckins(total)
                .trend(trend)
                .moodHistory(history)
                .emergencyResources(resourceItems)
                .build();
    }

    // ── SOS ──────────────────────────────────────────────────────────────

    @Transactional
    public void activateSOS(Long userId, SOSActivateRequest req) {
        SOSActivation sos = SOSActivation.builder()
                .userId(userId)
                .activationType("SOS_BUTTON")
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .countryCode(req.getCountryCode())
                .build();
        sosRepo.save(sos);

        // In production: send SMS/push to emergency contacts
        List<EmergencyContact> contacts = contactRepo.findByUserIdOrderByIsPrimaryDesc(userId);
        for (EmergencyContact contact : contacts) {
            log.info("SOS ALERT: Notifying {} ({}) for user {}",
                    contact.getName(), contact.getPhoneNumber(), userId);
        }
    }

    // ── Emergency Contacts ───────────────────────────────────────────────

    @Transactional
    public EmergencyContact addEmergencyContact(Long userId, EmergencyContactRequest req) {
        EmergencyContact contact = EmergencyContact.builder()
                .userId(userId)
                .name(req.getContactName())
                .phoneNumber(req.getContactPhone())
                .relationship(req.getRelationship())
                .isPrimary(req.isPrimary())
                .build();
        return contactRepo.save(contact);
    }

    public List<EmergencyContact> getEmergencyContacts(Long userId) {
        return contactRepo.findByUserIdOrderByIsPrimaryDesc(userId);
    }

    @Transactional
    public void deleteEmergencyContact(Long contactId, Long userId) {
        EmergencyContact contact = contactRepo.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        if (!contact.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        contactRepo.delete(contact);
    }

    // ── Mappers ──────────────────────────────────────────────────────────

    private CheckinResponse toCheckinResponse(WellbeingCheckin c) {
        return CheckinResponse.builder()
                .id(c.getId())
                .moodScore(c.getMoodScore())
                .journalEntry(null)
                .sleepHours(null)
                .socialInteractions(null)
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
                .build();
    }
}
