ALTER TABLE `user` ADD COLUMN `budget_alerts_enabled` TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE `user` ADD COLUMN `budget_alert_threshold` INT NOT NULL DEFAULT 75;
