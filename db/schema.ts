import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Users table - untuk menyimpan data user dari Supabase
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  birthDate: text("birth_date"),
  educationLevel: text("education_level"),
  institution: text("institution"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tasks table dengan user reference
export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  notes: text("notes"), // Hanya untuk category 'tugas'
  category: text("category", { enum: ["tugas", "jadwal", "kegiatan"] })
    .notNull()
    .default("tugas"),
  deadline: text("deadline").notNull(), // ISO string

  // Reminder settings
  reminderEnabled: integer("reminder_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  reminderDaysBefore: integer("reminder_days_before").default(0), // 0, 1, 3, 7, atau custom
  reminderTime: text("reminder_time").notNull().default("08:00"), // Format HH:mm

  // Repeat settings
  repeatEnabled: integer("repeat_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  repeatOption: text("repeat_option", {
    enum: ["none", "daily", "weekly", "monthly", "yearly", "custom"],
  }).default("none"),

  // Custom repeat settings
  customInterval: integer("custom_interval"), // contoh: 3
  customUnit: text("custom_unit", {
    enum: ["days", "weeks", "months", "years"],
  }), // contoh: "days" -> 3 hari sekali

  // End option untuk jadwal & kegiatan
  endOption: text("end_option", {
    enum: ["never", "deadline"],
  }).default("deadline"), // "never" untuk jadwal/kegiatan yang berulang tanpa batas

  status: text("status", { enum: ["pending", "in_progress", "completed"] })
    .notNull()
    .default("pending"),

  // Menyimpan notification IDs dalam format JSON array
  notificationIds: text("notification_ids"), // JSON string: ["id1", "id2", "id3"]

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Subtasks - hanya untuk category 'tugas'
export const subtasks = sqliteTable("subtasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Types untuk TypeScript
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Subtask = typeof subtasks.$inferSelect;
export type NewSubtask = typeof subtasks.$inferInsert;
