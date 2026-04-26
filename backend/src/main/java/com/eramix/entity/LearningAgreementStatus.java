package com.eramix.entity;

import com.eramix.entity.enums.LearningAgreementState;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Estado de las firmas del Learning Agreement (OLA) del estudiante.
 * Sincronizado con la Outgoing Mobilities API de EWP.
 */
@Entity
@Table(name = "learning_agreement_status")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LearningAgreementStatus extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "ewp_omobility_id", length = 100)
    private String ewpOmobilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "iia_id")
    private InterInstitutionalAgreement iia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private LearningAgreementState status = LearningAgreementState.DRAFT;

    @Column(name = "home_signature", length = 255)
    private String homeSignature;

    @Column(name = "home_signed_at")
    private Instant homeSignedAt;

    @Column(name = "host_signature", length = 255)
    private String hostSignature;

    @Column(name = "host_signed_at")
    private Instant hostSignedAt;

    @Column(name = "student_signed_at")
    private Instant studentSignedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "total_ects_home", precision = 5, scale = 1)
    @Builder.Default
    private BigDecimal totalEctsHome = BigDecimal.ZERO;

    @Column(name = "total_ects_host", precision = 5, scale = 1)
    @Builder.Default
    private BigDecimal totalEctsHost = BigDecimal.ZERO;

    @Column(name = "raw_data", columnDefinition = "JSON")
    private String rawData;

    @Column(name = "synced_at")
    private Instant syncedAt;

    @OneToMany(mappedBy = "learningAgreement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AcademicCreditMapping> creditMappings = new ArrayList<>();
}
