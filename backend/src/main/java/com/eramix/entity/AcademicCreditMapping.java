package com.eramix.entity;

import com.eramix.entity.enums.EquivalenceStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Mapa de equivalencia entre asignaturas de la universidad de origen
 * y la universidad de acogida con sus ECTS correspondientes.
 */
@Entity
@Table(name = "academic_credit_mapping")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AcademicCreditMapping extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_agreement_id", nullable = false)
    private LearningAgreementStatus learningAgreement;

    @Column(name = "home_course_name", nullable = false, length = 255)
    private String homeCourseName;

    @Column(name = "home_course_code", length = 50)
    private String homeCourseCode;

    @Column(name = "home_ects", nullable = false, precision = 4, scale = 1)
    private BigDecimal homeEcts;

    @Column(name = "host_course_name", nullable = false, length = 255)
    private String hostCourseName;

    @Column(name = "host_course_code", length = 50)
    private String hostCourseCode;

    @Column(name = "host_ects", nullable = false, precision = 4, scale = 1)
    private BigDecimal hostEcts;

    @Enumerated(EnumType.STRING)
    @Column(name = "equivalence_status", nullable = false, length = 30)
    @Builder.Default
    private EquivalenceStatus equivalenceStatus = EquivalenceStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
