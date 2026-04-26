-- =============================================
-- EraMix — V21: Seed test user for development
-- Password: Test1234!  (bcrypt hash)
-- =============================================

-- ── Test User ───────────────────────────────────
INSERT INTO user (
    email, password_hash, role,
    first_name, last_name,
    date_of_birth, bio,
    home_university_id, host_university_id,
    destination_city, destination_country,
    mobility_start, mobility_end,
    latitude, longitude,
    is_active, is_verified
) VALUES (
    'test@eramix.eu',
    '$2a$10$FhKIhJHBLoQ0O.xur1LPeOxfJiCARHvh9pL12Ns8BeTjwgfl.nttm',
    'USER',
    'Test', 'User',
    '2001-06-15',
    '¡Hola! Soy un usuario de prueba Erasmus en Barcelona. Me encanta explorar la ciudad y conocer gente nueva 🌍',
    1,   -- Universidad de Granada (home)
    3,   -- Universitat de Barcelona (host)
    'Barcelona', 'Spain',
    '2025-09-01', '2026-06-30',
    41.3862268, 2.1649876,
    TRUE, TRUE
);

SET @test_user_id = LAST_INSERT_ID();

-- ── User Languages ──────────────────────────────
INSERT INTO user_language (user_id, language_id, proficiency_level) VALUES
(@test_user_id, (SELECT id FROM language WHERE code = 'es'), 'NATIVE'),
(@test_user_id, (SELECT id FROM language WHERE code = 'en'), 'ADVANCED'),
(@test_user_id, (SELECT id FROM language WHERE code = 'fr'), 'INTERMEDIATE');

-- ── User Interests ──────────────────────────────
INSERT INTO user_interest (user_id, interest_id) VALUES
(@test_user_id, (SELECT id FROM interest WHERE name = 'Photography')),
(@test_user_id, (SELECT id FROM interest WHERE name = 'Running')),
(@test_user_id, (SELECT id FROM interest WHERE name = 'Coffee')),
(@test_user_id, (SELECT id FROM interest WHERE name = 'City Trips')),
(@test_user_id, (SELECT id FROM interest WHERE name = 'Programming'));
