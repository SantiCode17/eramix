-- =============================================
-- EraMix — V29: Update user profile for new cards
-- =============================================

ALTER TABLE user
    ADD COLUMN why_am_i_here VARCHAR(100),
    ADD COLUMN favorite_song VARCHAR(255),
    ADD COLUMN favorite_food VARCHAR(255),
    ADD COLUMN special_hobby VARCHAR(255),
    ADD COLUMN custom_prompts JSON,
    ADD COLUMN social_instagram VARCHAR(255),
    ADD COLUMN social_tiktok VARCHAR(255);

ALTER TABLE user_photo
    ADD COLUMN caption VARCHAR(255);
