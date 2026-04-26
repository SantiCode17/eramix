-- =============================================================================
-- V19: Fase 28 — Tablas de bienestar y protocolo SOS
-- =============================================================================

CREATE TABLE wellbeing_checkin (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    mood_score  TINYINT NOT NULL,
    created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_wellbeing_user (user_id),
    INDEX idx_wellbeing_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE emergency_resource (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    country_code        VARCHAR(3) NOT NULL,
    country_name        VARCHAR(100) NOT NULL,
    emergency_number    VARCHAR(20) NOT NULL,
    mental_health_line  VARCHAR(20),
    organization_name   VARCHAR(255),
    languages           VARCHAR(255),
    info_url            VARCHAR(512),
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_emergency_country (country_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed de recursos de emergencia para los 30 países Erasmus principales
INSERT INTO emergency_resource (country_code, country_name, emergency_number, mental_health_line, organization_name, languages, info_url, created_at, updated_at) VALUES
('ES', 'España', '112', '024', 'Línea de Atención a la Conducta Suicida', 'es,en', 'https://www.sanidad.gob.es/linea024', NOW(6), NOW(6)),
('FR', 'Francia', '112', '3114', 'Numéro National de Prévention du Suicide', 'fr,en', 'https://3114.fr', NOW(6), NOW(6)),
('DE', 'Alemania', '112', '0800-1110111', 'Telefonseelsorge', 'de,en', 'https://www.telefonseelsorge.de', NOW(6), NOW(6)),
('IT', 'Italia', '112', '800-274274', 'Telefono Amico Italia', 'it', 'https://www.telefonoamico.it', NOW(6), NOW(6)),
('PL', 'Polonia', '112', '116-123', 'Telefon Zaufania', 'pl,en', 'https://116123.pl', NOW(6), NOW(6)),
('PT', 'Portugal', '112', '808-200-204', 'SOS Voz Amiga', 'pt,en', 'https://www.sosvozamiga.org', NOW(6), NOW(6)),
('NL', 'Países Bajos', '112', '0900-0113', 'Stichting 113 Zelfmoordpreventie', 'nl,en', 'https://www.113.nl', NOW(6), NOW(6)),
('BE', 'Bélgica', '112', '1813', 'Centre de Prévention du Suicide', 'fr,nl,en', 'https://www.preventionsuicide.be', NOW(6), NOW(6)),
('AT', 'Austria', '112', '142', 'Telefonseelsorge Österreich', 'de', 'https://www.telefonseelsorge.at', NOW(6), NOW(6)),
('SE', 'Suecia', '112', '90101', 'Mind Självmordslinjen', 'sv,en', 'https://mind.se', NOW(6), NOW(6)),
('DK', 'Dinamarca', '112', '70-201-201', 'Livslinien', 'da,en', 'https://www.livslinien.dk', NOW(6), NOW(6)),
('FI', 'Finlandia', '112', '09-2525-0111', 'MIELI Mental Health Finland', 'fi,en', 'https://mieli.fi', NOW(6), NOW(6)),
('NO', 'Noruega', '112', '116-123', 'Mental Helse', 'no,en', 'https://mentalhelse.no', NOW(6), NOW(6)),
('IE', 'Irlanda', '112', '116-123', 'Samaritans Ireland', 'en,ga', 'https://www.samaritans.org', NOW(6), NOW(6)),
('CZ', 'República Checa', '112', '116-123', 'Linka bezpečí', 'cs,en', 'https://www.linkabezpeci.cz', NOW(6), NOW(6)),
('GR', 'Grecia', '112', '1018', 'Klimaka NGO', 'el,en', 'https://www.klimaka.org.gr', NOW(6), NOW(6)),
('RO', 'Rumanía', '112', '0800-801-200', 'Telefonul Sufletului', 'ro', 'https://www.telefonulsufletului.ro', NOW(6), NOW(6)),
('HU', 'Hungría', '112', '116-123', 'Lelki Elsősegély Telefonszolgálat', 'hu', 'https://www.sos116123.hu', NOW(6), NOW(6)),
('HR', 'Croacia', '112', '01-4833-888', 'Hrabri Telefon', 'hr,en', 'https://www.hrabritelefon.hr', NOW(6), NOW(6)),
('BG', 'Bulgaria', '112', '0035-29-981-76-86', 'Bulgarian Red Cross', 'bg', 'https://www.redcross.bg', NOW(6), NOW(6)),
('SK', 'Eslovaquia', '112', '0800-500-333', 'Linka dôvery Nezábudka', 'sk', 'https://www.nezabudka.sk', NOW(6), NOW(6)),
('SI', 'Eslovenia', '112', '116-123', 'Zaupni telefon Samarijan', 'sl', 'https://www.telefonsamarijan.si', NOW(6), NOW(6)),
('LT', 'Lituania', '112', '116-123', 'Vilties linija', 'lt', 'https://www.viltieslinija.lt', NOW(6), NOW(6)),
('LV', 'Letonia', '112', '116-123', 'Skalbes', 'lv', 'https://www.skalbes.lv', NOW(6), NOW(6)),
('EE', 'Estonia', '112', '655-8088', 'Laste ja Noorte Telefon', 'et,en', 'https://www.lastetelefon.ee', NOW(6), NOW(6)),
('MT', 'Malta', '112', '179', 'Supportline 179', 'mt,en', 'https://www.maltacvs.org', NOW(6), NOW(6)),
('CY', 'Chipre', '112', '1410', 'Cyprus Samaritans', 'el,en', 'https://www.cyprussamaritans.org', NOW(6), NOW(6)),
('LU', 'Luxemburgo', '112', '454545', 'SOS Détresse', 'fr,de,en', 'https://www.454545.lu', NOW(6), NOW(6)),
('TR', 'Turquía', '112', '182', 'İntihar Önleme Hattı', 'tr,en', 'https://www.saglik.gov.tr', NOW(6), NOW(6)),
('GB', 'Reino Unido', '999', '116-123', 'Samaritans UK', 'en', 'https://www.samaritans.org', NOW(6), NOW(6));

CREATE TABLE sos_activation (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    activation_type     VARCHAR(30) NOT NULL,
    latitude            DECIMAL(10,7),
    longitude           DECIMAL(10,7),
    contacts_notified   INT NOT NULL DEFAULT 0,
    country_code        VARCHAR(3),
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_sos_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para contactos de emergencia personales
CREATE TABLE emergency_contact (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    name            VARCHAR(200) NOT NULL,
    phone_number    VARCHAR(30) NOT NULL,
    relationship    VARCHAR(50),
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_emergency_contact_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
