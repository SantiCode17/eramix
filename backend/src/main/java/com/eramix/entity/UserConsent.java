package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Preferencias de consentimiento activo del usuario para GDPR.
 */
@Entity
@Table(name = "user_consent")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserConsent extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "location_tracking", nullable = false)
    @Builder.Default
    private Boolean locationTracking = false;

    @Column(name = "wellbeing_analysis", nullable = false)
    @Builder.Default
    private Boolean wellbeingAnalysis = false;

    @Column(name = "marketing_notifications", nullable = false)
    @Builder.Default
    private Boolean marketingNotifications = false;

    @Column(name = "analytics_anonymized", nullable = false)
    @Builder.Default
    private Boolean analyticsAnonymized = true;

    @Column(name = "third_party_ewp_sync", nullable = false)
    @Builder.Default
    private Boolean thirdPartyEwpSync = false;
}
