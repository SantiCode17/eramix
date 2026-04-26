-- =============================================
-- EraMix — V28: Reset all accounts & seed 4 test accounts
-- Passwords: Test?1234 (bcrypt $2a$10$...)
-- =============================================

-- Temporarily disable FK checks to allow full cleanup
SET FOREIGN_KEY_CHECKS = 0;

-- ── Clean all user-related data (order doesn't matter with FK checks off) ──
DELETE FROM user_intention;
DELETE FROM user_interest;
DELETE FROM user_language;
DELETE FROM user_photo;
DELETE FROM user_achievement;
DELETE FROM user_level;
DELETE FROM user_consent;
DELETE FROM user_place;
DELETE FROM xp_transaction;
DELETE FROM quiz_result;
DELETE FROM place_review;
DELETE FROM challenge_submission;
DELETE FROM challenge_vote;
DELETE FROM erasmus_challenge;
DELETE FROM grant_allocation;
DELETE FROM learning_agreement_status;
DELETE FROM academic_credit_mapping;
DELETE FROM inter_institutional_agreement;
DELETE FROM escrow_transaction;
DELETE FROM cryptographic_ticket;
DELETE FROM spending_category;
DELETE FROM ticket_redemption;
DELETE FROM ticket_listing;
DELETE FROM refresh_token;
DELETE FROM notification;
DELETE FROM story_reaction;
DELETE FROM story_view;
DELETE FROM story;
DELETE FROM event_participant;
DELETE FROM event;
DELETE FROM community_post_like;
DELETE FROM community_comment;
DELETE FROM community_post;
DELETE FROM community_member;
DELETE FROM community;
DELETE FROM group_message;
DELETE FROM group_member;
DELETE FROM chat_group;
DELETE FROM message;
DELETE FROM conversation;
DELETE FROM friendship;
DELETE FROM friend_request;
DELETE FROM language_exchange_request;
DELETE FROM exchange_review;
DELETE FROM exchange_session;
DELETE FROM roommate_preference;
DELETE FROM housing_post;
DELETE FROM ai_message;
DELETE FROM ai_conversation;
DELETE FROM agent_session;
DELETE FROM optical_record;
DELETE FROM wellbeing_checkin;
DELETE FROM consent_audit_log;
DELETE FROM budget_alert;
DELETE FROM budget;
DELETE FROM ledger_transaction;
DELETE FROM marketplace_photo;
DELETE FROM marketplace_listing;
DELETE FROM sos_activation;
DELETE FROM emergency_contact;
DELETE FROM vector_document;
DELETE FROM `user`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 4 Test Accounts — Password for all: Test?1234
-- =============================================

-- ── test1@eramix.eu — Carlos Martínez (España → Berlín) ──
INSERT INTO `user` (
    email, password_hash, role,
    first_name, last_name,
    date_of_birth, bio,
    home_university_id, host_university_id,
    destination_city, destination_country,
    mobility_start, mobility_end,
    latitude, longitude, location_updated_at,
    is_active, is_verified,
    auth_provider, degree,
    gender, looking_for_gender, show_gender_on_profile,
    notifications_enabled
) VALUES (
    'test1@eramix.eu',
    '$2a$10$HI8N4TdYVop6CtWR8vujFeBGs7gnnitjVsaMpq5.iK8fqO2TndgG6',
    'USER',
    'Carlos', 'M.',
    '2003-03-15',
    'Erasmus en Berlín desde Granada 🇩🇪 Me encanta la música electrónica, el fútbol y hacer nuevos amigos. ¡Escríbeme!',
    1,   -- Universidad de Granada (home)
    16,  -- Humboldt-Universität zu Berlin (host)
    'Berlin', 'Germany',
    '2026-02-01', '2026-07-31',
    52.5200066, 13.4049540, NOW(),
    TRUE, TRUE,
    'LOCAL', 'Ingeniería Informática',
    'Hombre', 'Todos', TRUE,
    TRUE
);

SET @u1 = LAST_INSERT_ID();

INSERT INTO user_language (user_id, language_id, proficiency_level) VALUES
(@u1, (SELECT id FROM language WHERE code = 'es'), 'NATIVE'),
(@u1, (SELECT id FROM language WHERE code = 'en'), 'ADVANCED'),
(@u1, (SELECT id FROM language WHERE code = 'de'), 'BASIC');

INSERT INTO user_interest (user_id, interest_id) VALUES
(@u1, (SELECT id FROM interest WHERE name = 'Football')),
(@u1, (SELECT id FROM interest WHERE name = 'Programming')),
(@u1, (SELECT id FROM interest WHERE name = 'Electronic')),
(@u1, (SELECT id FROM interest WHERE name = 'Nightlife')),
(@u1, (SELECT id FROM interest WHERE name = 'City Trips'));

INSERT INTO user_intention (user_id, intention) VALUES
(@u1, 'MEET_PEOPLE'),
(@u1, 'PRACTICE_LANGUAGES'),
(@u1, 'ORGANIZE_PLANS');

-- ── test2@eramix.eu — Sophie Dubois (Francia → Barcelona) ──
INSERT INTO `user` (
    email, password_hash, role,
    first_name, last_name,
    date_of_birth, bio,
    home_university_id, host_university_id,
    destination_city, destination_country,
    mobility_start, mobility_end,
    latitude, longitude, location_updated_at,
    is_active, is_verified,
    auth_provider, degree,
    gender, looking_for_gender, show_gender_on_profile,
    notifications_enabled
) VALUES (
    'test2@eramix.eu',
    '$2a$10$YHU5.GGxNRElPS04Y3tHbelZQHkUGpcpaiUCGWu0zaSVtxY4.SIHC',
    'USER',
    'Sophie', 'D.',
    '2002-07-22',
    'Française à Barcelone 🇫🇷🇪🇸 J adore la gastronomie, la photo et les soirées. Looking for tandem español!',
    11,  -- Sorbonne Université (home)
    3,   -- Universitat de Barcelona (host)
    'Barcelona', 'Spain',
    '2025-09-01', '2026-01-31',
    41.3862268, 2.1649876, NOW(),
    TRUE, TRUE,
    'LOCAL', 'Lettres Modernes',
    'Mujer', 'Todos', TRUE,
    TRUE
);

SET @u2 = LAST_INSERT_ID();

INSERT INTO user_language (user_id, language_id, proficiency_level) VALUES
(@u2, (SELECT id FROM language WHERE code = 'fr'), 'NATIVE'),
(@u2, (SELECT id FROM language WHERE code = 'en'), 'ADVANCED'),
(@u2, (SELECT id FROM language WHERE code = 'es'), 'INTERMEDIATE');

INSERT INTO user_interest (user_id, interest_id) VALUES
(@u2, (SELECT id FROM interest WHERE name = 'Photography')),
(@u2, (SELECT id FROM interest WHERE name = 'Cooking')),
(@u2, (SELECT id FROM interest WHERE name = 'Wine Tasting')),
(@u2, (SELECT id FROM interest WHERE name = 'Museums')),
(@u2, (SELECT id FROM interest WHERE name = 'Language Exchange'));

INSERT INTO user_intention (user_id, intention) VALUES
(@u2, 'PRACTICE_LANGUAGES'),
(@u2, 'MEET_PEOPLE'),
(@u2, 'FIND_SPECIAL_SOMEONE');

-- ── test3@eramix.eu — Lena Müller (Alemania → Lisboa) ──
INSERT INTO `user` (
    email, password_hash, role,
    first_name, last_name,
    date_of_birth, bio,
    home_university_id, host_university_id,
    destination_city, destination_country,
    mobility_start, mobility_end,
    latitude, longitude, location_updated_at,
    is_active, is_verified,
    auth_provider, degree,
    gender, looking_for_gender, show_gender_on_profile,
    notifications_enabled
) VALUES (
    'test3@eramix.eu',
    '$2a$10$StwG2LBEpuVhRzb/42hdNOhCMRi3i9RJ3fjQX1r.wfPOI5aSWidUq',
    'USER',
    'Lena', 'M.',
    '2001-11-08',
    'Erasmus in Lissabon 🇩🇪🇵🇹 Ich liebe Surfen, Yoga und Entdeckungsreisen. Looking for people to explore the city!',
    15,  -- Technische Universität München (home)
    19,  -- Universidade de Lisboa (host)
    'Lisbon', 'Portugal',
    '2026-02-01', '2026-07-31',
    38.7222524, -9.1393366, NOW(),
    TRUE, TRUE,
    'LOCAL', 'Arquitectura',
    'Mujer', 'Hombres', TRUE,
    TRUE
);

SET @u3 = LAST_INSERT_ID();

INSERT INTO user_language (user_id, language_id, proficiency_level) VALUES
(@u3, (SELECT id FROM language WHERE code = 'de'), 'NATIVE'),
(@u3, (SELECT id FROM language WHERE code = 'en'), 'ADVANCED'),
(@u3, (SELECT id FROM language WHERE code = 'pt'), 'BASIC');

INSERT INTO user_interest (user_id, interest_id) VALUES
(@u3, (SELECT id FROM interest WHERE name = 'Yoga')),
(@u3, (SELECT id FROM interest WHERE name = 'Hiking')),
(@u3, (SELECT id FROM interest WHERE name = 'Painting')),
(@u3, (SELECT id FROM interest WHERE name = 'Backpacking')),
(@u3, (SELECT id FROM interest WHERE name = 'Coffee'));

INSERT INTO user_intention (user_id, intention) VALUES
(@u3, 'MEET_PEOPLE'),
(@u3, 'ORGANIZE_PLANS'),
(@u3, 'EXPLORE');

-- ── test4@eramix.eu — Marco Ricci (Italia → Ámsterdam) ──
INSERT INTO `user` (
    email, password_hash, role,
    first_name, last_name,
    date_of_birth, bio,
    home_university_id, host_university_id,
    destination_city, destination_country,
    mobility_start, mobility_end,
    latitude, longitude, location_updated_at,
    is_active, is_verified,
    auth_provider, degree,
    gender, looking_for_gender, show_gender_on_profile,
    notifications_enabled
) VALUES (
    'test4@eramix.eu',
    '$2a$10$obt/0xz8NCNW4uk0yoND9uiEVqaMpUjAgnR3.nCcjLC130OjfWanu',
    'USER',
    'Marco', 'R.',
    '2000-04-30',
    'Erasmus ad Amsterdam dall Italia 🇮🇹🇳🇱 Appassionato di cinema, cucina e sport. Cerco coinquilini e amici!',
    7,   -- Università di Bologna (home)
    21,  -- Universiteit van Amsterdam (host)
    'Amsterdam', 'Netherlands',
    '2025-09-01', '2026-06-30',
    52.3675734, 4.9041389, NOW(),
    TRUE, TRUE,
    'LOCAL', 'Economía y Empresa',
    'Hombre', 'Mujeres', TRUE,
    TRUE
);

SET @u4 = LAST_INSERT_ID();

INSERT INTO user_language (user_id, language_id, proficiency_level) VALUES
(@u4, (SELECT id FROM language WHERE code = 'it'), 'NATIVE'),
(@u4, (SELECT id FROM language WHERE code = 'en'), 'ADVANCED'),
(@u4, (SELECT id FROM language WHERE code = 'nl'), 'BASIC');

INSERT INTO user_interest (user_id, interest_id) VALUES
(@u4, (SELECT id FROM interest WHERE name = 'Cinema')),
(@u4, (SELECT id FROM interest WHERE name = 'Cooking')),
(@u4, (SELECT id FROM interest WHERE name = 'Football')),
(@u4, (SELECT id FROM interest WHERE name = 'Gaming')),
(@u4, (SELECT id FROM interest WHERE name = 'City Trips'));

INSERT INTO user_intention (user_id, intention) VALUES
(@u4, 'FIND_ROOMMATE'),
(@u4, 'MEET_PEOPLE'),
(@u4, 'FIND_SPECIAL_SOMEONE');
