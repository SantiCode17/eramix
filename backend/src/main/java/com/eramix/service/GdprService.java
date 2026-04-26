package com.eramix.service;

import com.eramix.dto.gdpr.*;
import com.eramix.entity.*;
import com.eramix.entity.enums.ConsentType;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GdprService {

    private final UserConsentRepository consentRepo;
    private final ConsentAuditLogRepository auditRepo;

    // ── Get consent status ───────────────────────────────────────────────

    public ConsentStatusResponse getConsentStatus(Long userId) {
        UserConsent consent = consentRepo.findByUserId(userId).orElse(null);
        if (consent == null) {
            return ConsentStatusResponse.builder()
                    .locationTracking(false)
                    .wellbeingAnalysis(false)
                    .marketingNotifications(false)
                    .analyticsAnonymized(true)
                    .thirdPartyEwpSync(false)
                    .build();
        }
        return ConsentStatusResponse.builder()
                .locationTracking(consent.getLocationTracking())
                .wellbeingAnalysis(consent.getWellbeingAnalysis())
                .marketingNotifications(consent.getMarketingNotifications())
                .analyticsAnonymized(consent.getAnalyticsAnonymized())
                .thirdPartyEwpSync(consent.getThirdPartyEwpSync())
                .lastUpdated(consent.getUpdatedAt() != null ? consent.getUpdatedAt().toString() : null)
                .build();
    }

    // ── Update consents ──────────────────────────────────────────────────

    @Transactional
    public ConsentStatusResponse updateConsents(Long userId, ConsentUpdateRequest req, String ipAddress) {
        UserConsent consent = consentRepo.findByUserId(userId)
                .orElseGet(() -> {
                    UserConsent c = new UserConsent();
                    c.setUserId(userId);
                    return c;
                });

        Map<String, Boolean> changes = req.getConsents();

        if (changes.containsKey("LOCATION_TRACKING")) {
            boolean newVal = changes.get("LOCATION_TRACKING");
            logConsentChange(userId, ConsentType.LOCATION_TRACKING, consent.getLocationTracking(), newVal, ipAddress);
            consent.setLocationTracking(newVal);
        }
        if (changes.containsKey("WELLBEING_ANALYSIS")) {
            boolean newVal = changes.get("WELLBEING_ANALYSIS");
            logConsentChange(userId, ConsentType.WELLBEING_ANALYSIS, consent.getWellbeingAnalysis(), newVal, ipAddress);
            consent.setWellbeingAnalysis(newVal);
        }
        if (changes.containsKey("MARKETING_NOTIFICATIONS")) {
            boolean newVal = changes.get("MARKETING_NOTIFICATIONS");
            logConsentChange(userId, ConsentType.MARKETING_NOTIFICATIONS, consent.getMarketingNotifications(), newVal, ipAddress);
            consent.setMarketingNotifications(newVal);
        }
        if (changes.containsKey("ANALYTICS_ANONYMIZED")) {
            boolean newVal = changes.get("ANALYTICS_ANONYMIZED");
            logConsentChange(userId, ConsentType.ANALYTICS_ANONYMIZED, consent.getAnalyticsAnonymized(), newVal, ipAddress);
            consent.setAnalyticsAnonymized(newVal);
        }
        if (changes.containsKey("THIRD_PARTY_EWP_SYNC")) {
            boolean newVal = changes.get("THIRD_PARTY_EWP_SYNC");
            logConsentChange(userId, ConsentType.THIRD_PARTY_EWP_SYNC, consent.getThirdPartyEwpSync(), newVal, ipAddress);
            consent.setThirdPartyEwpSync(newVal);
        }

        consentRepo.save(consent);
        return getConsentStatus(userId);
    }

    // ── Data export request ──────────────────────────────────────────────

    @Transactional
    public DataExportResponse requestDataExport(Long userId) {
        // Log the export request
        ConsentAuditLog log = ConsentAuditLog.builder()
                .userId(userId)
                .consentType(ConsentType.ACCOUNT_DELETED)
                .granted(false)
                .ipAddress("system")
                .build();
        auditRepo.save(log);

        // In production: queue async data export job
        return DataExportResponse.builder()
                .exportId(java.util.UUID.randomUUID().toString())
                .status("PROCESSING")
                .requestedAt(Instant.now().toString())
                .build();
    }

    // ── Account deletion ─────────────────────────────────────────────────

    @Transactional
    public void requestAccountDeletion(Long userId, String ipAddress) {
        logConsentChange(userId, ConsentType.ACCOUNT_DELETED, false, true, ipAddress);
        // In production: schedule account deletion after 30-day grace period
        GdprService.log.info("Account deletion requested for user {}. 30-day grace period started.", userId);
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private void logConsentChange(Long userId, ConsentType type, boolean oldVal, boolean newVal, String ip) {
        if (oldVal == newVal) return;
        ConsentAuditLog logEntry = ConsentAuditLog.builder()
                .userId(userId)
                .consentType(type)
                .granted(newVal)
                .ipAddress(ip != null ? ip : "unknown")
                .build();
        auditRepo.save(logEntry);
    }
}
