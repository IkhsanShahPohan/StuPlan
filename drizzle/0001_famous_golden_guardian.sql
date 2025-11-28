ALTER TABLE `tasks` ADD `repeat_end_date` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);