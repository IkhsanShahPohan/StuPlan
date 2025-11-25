CREATE TABLE `subtasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`title` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `lists`;--> statement-breakpoint
ALTER TABLE `tasks` ADD `description` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `deadline` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `tasks` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP;