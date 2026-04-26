-- =============================================
-- EraMix — V31: Add cover_image_url to event
-- =============================================

ALTER TABLE event
    ADD COLUMN cover_image_url VARCHAR(500) NULL;
