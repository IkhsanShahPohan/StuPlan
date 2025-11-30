import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Users table - untuk menyimpan data user dari Supabase
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID dari Supabase
  email: text("email").notNull().unique(),
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
  deadline: text("deadline"),
  time: text("time"), // Untuk jadwal & kegiatan
  repeatOption: text("repeat_option", {
    enum: ["none", "daily", "weekly", "monthly", "yearly"],
  }).default("none"), // Untuk jadwal & kegiatan
  repeatEndDate: text("repeat_end_date"), // Tanggal akhir pengulangan
  status: text("status", { enum: ["pending", "in_progress", "completed"] })
    .notNull()
    .default("pending"),
  reminderEnabled: integer("reminder_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  reminderDaysBefore: integer("reminder_days_before").default(1),
  reminderTime: text("reminder_time").default("08:00"),
  reminderFrequency: text("reminder_frequency", {
    enum: ["once", "daily", "every_2_days", "every_3_days", "weekly"],
  }).default("once"), // Frekuensi pengingat untuk tugas
  notificationIds: text("notification_ids"), // JSON array untuk multiple notifications
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
