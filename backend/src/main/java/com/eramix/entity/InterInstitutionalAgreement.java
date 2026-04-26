package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * Acuerdo interinstitucional bilateral entre universidad de origen y acogida.
 * Datos sincronizados desde la red EWP.
 */
@Entity
@Table(name = "inter_institutional_agreement")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InterInstitutionalAgreement extends BaseEntity {

    @Column(name = "ewp_iia_id", nullable = false, length = 100)
    private String ewpIiaId;

    @Column(name = "home_institution_id", nullable = false, length = 100)
    private String homeInstitutionId;

    @Column(name = "host_institution_id", nullable = false, length = 100)
    private String hostInstitutionId;

    @Column(name = "home_institution_name", length = 255)
    private String homeInstitutionName;

    @Column(name = "host_institution_name", length = 255)
    private String hostInstitutionName;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "max_students")
    private Integer maxStudents;

    @Column(name = "max_months")
    private Integer maxMonths;

    @Column(name = "subject_area", length = 255)
    private String subjectArea;

    @Column(name = "isced_code", length = 20)
    private String iscedCode;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "raw_data", columnDefinition = "JSON")
    private String rawData;

    @Column(name = "synced_at")
    private Instant syncedAt;
}
