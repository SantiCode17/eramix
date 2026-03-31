-- V10: Extend messages for multimedia chat (audio, video, location coords)
ALTER TABLE message ADD COLUMN latitude DOUBLE NULL;
ALTER TABLE message ADD COLUMN longitude DOUBLE NULL;

-- Extend message_type enum values handled at app level (TEXT, IMAGE, LOCATION, AUDIO, VIDEO)
