CREATE TABLE `subtasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`title` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `lists`;--> statement-breakpoint
ALTER TABLE `tasks` ADD `deadline` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `notification_id` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `completed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `created_at` integer NOT NULL;