import { subtasks as subtasksTable, tasks as tasksTable } from "@/db/schema";
import { useDrizzle } from "@/hooks/useDrizzle";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { supabase } from "./supabase";

export interface SyncResult {
  success: boolean;
  message: string;
  uploadedTasks?: number;
  downloadedTasks?: number;
  errors?: string[];
}

export class SyncService {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    this.db = useDrizzle();
  }

  /**
   * Upload semua tasks dari SQLite ke Supabase
   */
  async uploadToSupabase(userId: string): Promise<SyncResult> {
    const errors: string[] = [];
    let uploadedCount = 0;

    try {
      // 1. Fetch semua tasks lokal
      const localTasks = await this.db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.userId, userId));

      if (localTasks.length === 0) {
        return {
          success: true,
          message: "Tidak ada data untuk disinkronkan",
          uploadedTasks: 0,
        };
      }

      // 2. Upload setiap task beserta subtasks-nya
      for (const task of localTasks) {
        try {
          // Fetch subtasks untuk task ini
          const localSubtasks = await this.db
            .select()
            .from(subtasksTable)
            .where(eq(subtasksTable.taskId, task.id));

          // Upload task ke Supabase
          const { data: uploadedTask, error: taskError } = await supabase
            .from("tasks")
            .upsert({
              id: task.id,
              user_id: task.userId,
              title: task.title,
              description: task.description,
              notes: task.notes,
              category: task.category,
              deadline: task.deadline,
              reminder_enabled: task.reminderEnabled,
              reminder_days_before: task.reminderDaysBefore,
              reminder_time: task.reminderTime,
              repeat_enabled: task.repeatEnabled,
              repeat_option: task.repeatOption,
              custom_interval: task.customInterval,
              custom_unit: task.customUnit,
              end_option: task.endOption,
              status: task.status,
              notification_ids: task.notificationIds,
              created_at: task.createdAt,
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (taskError) {
            errors.push(`Task "${task.title}": ${taskError.message}`);
            continue;
          }

          // Upload subtasks jika ada
          if (localSubtasks.length > 0 && uploadedTask) {
            const subtasksToUpload = localSubtasks.map((subtask) => ({
              task_id: uploadedTask.id,
              title: subtask.title,
              completed: subtask.completed,
              created_at: subtask.createdAt,
            }));

            const { error: subtasksError } = await supabase
              .from("subtasks")
              .upsert(subtasksToUpload);

            if (subtasksError) {
              errors.push(
                `Subtasks for "${task.title}": ${subtasksError.message}`
              );
            }
          }

          uploadedCount++;
        } catch (err: any) {
          errors.push(`Task "${task.title}": ${err.message}`);
        }
      }

      return {
        success: errors.length === 0,
        message:
          errors.length === 0
            ? `Berhasil upload ${uploadedCount} tasks ke cloud`
            : `Upload selesai dengan ${errors.length} error`,
        uploadedTasks: uploadedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: any) {
      console.error("Upload error:", error);
      return {
        success: false,
        message: `Gagal upload: ${error.message}`,
        uploadedTasks: uploadedCount,
        errors: [error.message],
      };
    }
  }

  /**
   * Download semua tasks dari Supabase ke SQLite
   */
  async downloadFromSupabase(userId: string): Promise<SyncResult> {
    const errors: string[] = [];
    let downloadedCount = 0;

    try {
      // 1. Fetch semua tasks dari Supabase
      const { data: cloudTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId);

      if (tasksError) {
        return {
          success: false,
          message: `Gagal download: ${tasksError.message}`,
          errors: [tasksError.message],
        };
      }

      if (!cloudTasks || cloudTasks.length === 0) {
        return {
          success: true,
          message: "Tidak ada data di cloud",
          downloadedTasks: 0,
        };
      }

      // 2. Clear local tasks terlebih dahulu (optional, tergantung strategi)
      // await this.db.delete(tasksTable).where(eq(tasksTable.userId, userId));

      // 3. Insert/update setiap task beserta subtasks
      for (const cloudTask of cloudTasks) {
        try {
          // Fetch subtasks untuk task ini
          const { data: cloudSubtasks, error: subtasksError } = await supabase
            .from("subtasks")
            .select("*")
            .eq("task_id", cloudTask.id);

          if (subtasksError) {
            errors.push(
              `Subtasks for task ${cloudTask.id}: ${subtasksError.message}`
            );
          }

          // Check if task sudah ada di lokal
          const existingTask = await this.db
            .select()
            .from(tasksTable)
            .where(eq(tasksTable.id, cloudTask.id))
            .limit(1);

          if (existingTask.length > 0) {
            // Update existing task
            await this.db
              .update(tasksTable)
              .set({
                title: cloudTask.title,
                description: cloudTask.description,
                notes: cloudTask.notes,
                category: cloudTask.category,
                deadline: cloudTask.deadline,
                reminderEnabled: cloudTask.reminder_enabled,
                reminderDaysBefore: cloudTask.reminder_days_before,
                reminderTime: cloudTask.reminder_time,
                repeatEnabled: cloudTask.repeat_enabled,
                repeatOption: cloudTask.repeat_option,
                customInterval: cloudTask.custom_interval,
                customUnit: cloudTask.custom_unit,
                endOption: cloudTask.end_option,
                status: cloudTask.status,
                notificationIds: cloudTask.notification_ids,
                updatedAt: new Date().toISOString(),
              })
              .where(eq(tasksTable.id, cloudTask.id));
          } else {
            // Insert new task
            await this.db.insert(tasksTable).values({
              id: cloudTask.id,
              userId: cloudTask.user_id,
              title: cloudTask.title,
              description: cloudTask.description,
              notes: cloudTask.notes,
              category: cloudTask.category,
              deadline: cloudTask.deadline,
              reminderEnabled: cloudTask.reminder_enabled,
              reminderDaysBefore: cloudTask.reminder_days_before,
              reminderTime: cloudTask.reminder_time,
              repeatEnabled: cloudTask.repeat_enabled,
              repeatOption: cloudTask.repeat_option,
              customInterval: cloudTask.custom_interval,
              customUnit: cloudTask.custom_unit,
              endOption: cloudTask.end_option,
              status: cloudTask.status,
              notificationIds: cloudTask.notification_ids,
              createdAt: cloudTask.created_at,
              updatedAt: new Date().toISOString(),
            });
          }

          // Insert/update subtasks
          if (cloudSubtasks && cloudSubtasks.length > 0) {
            // Delete existing subtasks
            await this.db
              .delete(subtasksTable)
              .where(eq(subtasksTable.taskId, cloudTask.id));

            // Insert new subtasks
            for (const subtask of cloudSubtasks) {
              await this.db.insert(subtasksTable).values({
                id: subtask.id,
                taskId: cloudTask.id,
                title: subtask.title,
                completed: subtask.completed,
                createdAt: subtask.created_at,
              });
            }
          }

          downloadedCount++;
        } catch (err: any) {
          errors.push(`Task ${cloudTask.id}: ${err.message}`);
        }
      }

      return {
        success: errors.length === 0,
        message:
          errors.length === 0
            ? `Berhasil download ${downloadedCount} tasks dari cloud`
            : `Download selesai dengan ${errors.length} error`,
        downloadedTasks: downloadedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: any) {
      console.error("Download error:", error);
      return {
        success: false,
        message: `Gagal download: ${error.message}`,
        downloadedTasks: downloadedCount,
        errors: [error.message],
      };
    }
  }

  /**
   * Full sync: download dulu, lalu upload
   */
  async fullSync(userId: string): Promise<SyncResult> {
    try {
      // 1. Download dari cloud terlebih dahulu
      const downloadResult = await this.downloadFromSupabase(userId);

      if (!downloadResult.success) {
        return downloadResult;
      }

      // 2. Upload ke cloud
      const uploadResult = await this.uploadToSupabase(userId);

      return {
        success: downloadResult.success && uploadResult.success,
        message: `Download: ${downloadResult.message}\nUpload: ${uploadResult.message}`,
        downloadedTasks: downloadResult.downloadedTasks,
        uploadedTasks: uploadResult.uploadedTasks,
        errors: [
          ...(downloadResult.errors || []),
          ...(uploadResult.errors || []),
        ],
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Full sync error: ${error.message}`,
        errors: [error.message],
      };
    }
  }
}
