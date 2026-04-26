-- =============================================
-- EraMix — V30: Add premium profile fields
-- =============================================

ALTER TABLE user
    ADD COLUMN height INT,
    ADD COLUMN zodiac VARCHAR(50),
    ADD COLUMN profession VARCHAR(150);
