PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`notes` text,
	`category` text DEFAULT 'tugas' NOT NULL,
	`deadline` text NOT NULL,
	`reminder_enabled` integer DEFAULT false NOT NULL,
	`reminder_days_before` integer DEFAULT 0,
	`reminder_time` text DEFAULT '08:00' NOT NULL,
	`repeat_enabled` integer DEFAULT false NOT NULL,
	`repeat_option` text DEFAULT 'none',
	`custom_interval` integer,
	`custom_unit` text,
	`end_option` text DEFAULT 'deadline',
	`status` text DEFAULT 'pending' NOT NULL,
	`notification_ids` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "user_id", "title", "description", "notes", "category", "deadline", "reminder_enabled", "reminder_days_before", "reminder_time", "repeat_enabled", "repeat_option", "custom_interval", "custom_unit", "end_option", "status", "notification_ids", "created_at", "updated_at") SELECT "id", "user_id", "title", "description", "notes", "category", "deadline", "reminder_enabled", "reminder_days_before", "reminder_time", "repeat_enabled", "repeat_option", "custom_interval", "custom_unit", "end_option", "status", "notification_ids", "created_at", "updated_at" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;