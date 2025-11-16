import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// export const tasks = sqliteTable('tasks', {
//   id: integer('id').primaryKey({ autoIncrement: true }),
//   title: text('title').notNull(),
//   description: text('description'),
//   deadline: text('deadline').notNull(),
//   status: text('status', { enum: ['pending', 'in_progress', 'completed'] })
//     .notNull()
//     .default('pending'),
//   createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
//   updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
// });

// export const subtasks = sqliteTable('subtasks', {
//   id: integer('id').primaryKey({ autoIncrement: true }),
//   taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
//   title: text('title').notNull(),
//   completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
//   createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
// });

// // Export Task to use as an interface in your app
// export type Task = typeof tasks.$inferSelect;

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  notes: text('notes'),
  deadline: text('deadline').notNull(),
  status: text('status', { enum: ['pending', 'in_progress', 'completed'] })
    .notNull()
    .default('pending'),
  reminderEnabled: integer('reminder_enabled', { mode: 'boolean' }).notNull().default(false),
  reminderDaysBefore: integer('reminder_days_before').default(1),
  reminderTime: text('reminder_time').default('08:00'),
  notificationId: text('notification_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const subtasks = sqliteTable('subtasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
