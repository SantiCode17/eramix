-- =============================================================================
-- V14: Fase 23 — Tablas de interoperabilidad EWP (Erasmus Without Paper)
-- =============================================================================

CREATE TABLE inter_institutional_agreement (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    ewp_iia_id              VARCHAR(100) NOT NULL,
    home_institution_id     VARCHAR(100) NOT NULL,
    host_institution_id     VARCHAR(100) NOT NULL,
    home_institution_name   VARCHAR(255),
    host_institution_name   VARCHAR(255),
    academic_year           VARCHAR(20),
    max_students            INT,
    max_months              INT,
    subject_area            VARCHAR(255),
    isced_code              VARCHAR(20),
    status                  VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    raw_data                JSON,
    synced_at               DATETIME(6),
    created_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_iia_home (home_institution_id),
    INDEX idx_iia_host (host_institution_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE learning_agreement_status (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    ewp_omobility_id       VARCHAR(100),
    iia_id                  BIGINT,
    status                  VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    home_signature          VARCHAR(255),
    home_signed_at          DATETIME(6),
    host_signature          VARCHAR(255),
    host_signed_at          DATETIME(6),
    student_signed_at       DATETIME(6),
    rejection_reason        TEXT,
    total_ects_home         DECIMAL(5,1) DEFAULT 0,
    total_ects_host         DECIMAL(5,1) DEFAULT 0,
    raw_data                JSON,
    synced_at               DATETIME(6),
    created_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (iia_id) REFERENCES inter_institutional_agreement(id) ON DELETE SET NULL,
    INDEX idx_la_status_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE academic_credit_mapping (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    learning_agreement_id   BIGINT NOT NULL,
    home_course_name        VARCHAR(255) NOT NULL,
    home_course_code        VARCHAR(50),
    home_ects               DECIMAL(4,1) NOT NULL,
    host_course_name        VARCHAR(255) NOT NULL,
    host_course_code        VARCHAR(50),
    host_ects               DECIMAL(4,1) NOT NULL,
    equivalence_status      VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    notes                   TEXT,
    created_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (learning_agreement_id) REFERENCES learning_agreement_status(id) ON DELETE CASCADE,
    INDEX idx_credit_mapping_la (learning_agreement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
