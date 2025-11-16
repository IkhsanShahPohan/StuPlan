ALTER TABLE `tasks` ADD `reminder_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `reminder_days_before` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `tasks` ADD `reminder_time` text DEFAULT '08:00';--> statement-breakpoint
ALTER TABLE `tasks` ADD `notification_id` text;