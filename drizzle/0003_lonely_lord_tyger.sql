CREATE TABLE `lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
DROP TABLE `subtasks`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `deadline`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `notes`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `notification_id`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `completed`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `created_at`;