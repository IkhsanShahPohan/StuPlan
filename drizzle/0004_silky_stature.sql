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
	`reminder_minutes` integer DEFAULT 0,
	`reminder_time` text DEFAULT '08:00' NOT NULL,
	`repeat_enabled` integer DEFAULT false NOT NULL,
	`repeat_mode` text,
	`repeat_interval` integer DEFAULT 1,
	`selected_days` text,
	`repeat_end_option` text DEFAULT 'never',
	`repeat_end_months` integer,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`notification_ids` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "user_id", "title", "description", "notes", "category", "deadline", "reminder_enabled", "reminder_minutes", "reminder_time", "repeat_enabled", "repeat_mode", "repeat_interval", "selected_days", "repeat_end_option", "repeat_end_months", "status", "notification_ids", "created_at", "updated_at") SELECT "id", "user_id", "title", "description", "notes", "category", "deadline", "reminder_enabled", "reminder_minutes", "reminder_time", "repeat_enabled", "repeat_mode", "repeat_interval", "selected_days", "repeat_end_option", "repeat_end_months", "status", "notification_ids", "created_at", "updated_at" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;